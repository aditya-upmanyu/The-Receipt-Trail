/**
 * Receipt Service
 * Handles loading, parsing, and managing all receipt data
 */

import type { Receipt } from "../types/index";
import {
  parseSpotifyCSV,
  parseHouseholdTransactionsCSV,
  parseIndiaTransactionJSON,
  normalizeReceipts,
} from "../utils/parsing";

// ============================================================================
// DATA LOADING
// ============================================================================

export async function loadAllReceipts(): Promise<Receipt[]> {
  const allReceipts: Receipt[] = [];

  try {
    // Load Spotify data
    console.log('Loading Spotify data...');
    const spotifyData = await loadSpotifyData();
    console.log(`Loaded ${spotifyData.length} Spotify receipts`);
    allReceipts.push(...spotifyData);

    // Load Household transactions
    console.log('Loading Household data...');
    const householdData = await loadHouseholdData();
    console.log(`Loaded ${householdData.length} Household receipts`);
    allReceipts.push(...householdData);

    // Load India transactions (may skip if too large)
    console.log('Loading India transaction data...');
    const indiaData = await loadIndiaTransactionData();
    console.log(`Loaded ${indiaData.length} India receipts`);
    allReceipts.push(...indiaData);

    console.log(`Total raw receipts: ${allReceipts.length}`);
    
    // Normalize and deduplicate - do this in chunks to avoid stack overflow
    const normalized = normalizeReceiptsChunked(allReceipts);
    console.log(`Normalized to ${normalized.length} receipts`);

    return normalized;
  } catch (error) {
    console.error("Error loading receipts:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to load data";
    throw new Error(`Failed to load receipt data: ${errorMessage}`, { cause: error });
  }
}

// Chunk-based normalization to avoid stack overflow
function normalizeReceiptsChunked(receipts: Receipt[], chunkSize = 10000): Receipt[] {
  if (receipts.length <= chunkSize) {
    return normalizeReceipts(receipts);
  }
  
  const chunks: Receipt[][] = [];
  for (let i = 0; i < receipts.length; i += chunkSize) {
    chunks.push(receipts.slice(i, i + chunkSize));
  }
  
  const normalized = chunks.flatMap(chunk => normalizeReceipts(chunk));
  
  // Deduplicate across chunks
  const seen = new Set<string>();
  return normalized.filter(receipt => {
    if (seen.has(receipt.id)) {
      return false;
    }
    seen.add(receipt.id);
    return true;
  });
}

async function loadSpotifyData(): Promise<Receipt[]> {
  try {
    const response = await fetch("/datasets/spotify_history.csv");
    const text = await response.text();
    const result = parseSpotifyCSV(text);

    console.log(`Spotify: ${result.data.length} receipts, ${result.skipped} skipped, ${result.errors.length} errors`);

    return result.data;
  } catch (error) {
    console.error("Error loading Spotify data:", error);
    return [];
  }
}

async function loadHouseholdData(): Promise<Receipt[]> {
  try {
    const response = await fetch("/datasets/Daily Household Transactions.csv");
    const text = await response.text();
    const result = parseHouseholdTransactionsCSV(text);

    console.log(`Household: ${result.data.length} receipts, ${result.skipped} skipped, ${result.errors.length} errors`);

    return result.data;
  } catch (error) {
    console.error("Error loading Household data:", error);
    return [];
  }
}

async function loadIndiaTransactionData(): Promise<Receipt[]> {
  try {
    const response = await fetch("/datasets/Augmented_IndiaTransactMultiFacet2024.json");
    
    // Check file size
    const contentLength = response.headers.get('content-length');
    const fileSizeInMB = contentLength ? parseInt(contentLength) / (1024 * 1024) : 0;
    
    console.log(`India dataset size: ${fileSizeInMB.toFixed(2)} MB`);
    
    // For very large files, limit the data
    if (fileSizeInMB > 50) {
      console.warn('Large dataset detected, loading subset...');
      // Return empty for now to avoid crash - we'll load smaller dataset
      return [];
    }
    
    const text = await response.text();
    const result = parseIndiaTransactionJSON(text);

    console.log(`India: ${result.data.length} receipts, ${result.skipped} skipped, ${result.errors.length} errors`);

    return result.data;
  } catch (error) {
    console.error("Error loading India transaction data:", error);
    return [];
  }
}

// ============================================================================
// INDEXING FOR PERFORMANCE
// ============================================================================

export interface ReceiptIndexes {
  byId: Map<string, Receipt>;
  byType: Map<string, Receipt[]>;
  byDate: Map<string, Receipt[]>; // YYYY-MM-DD
  byLocation: Map<string, Receipt[]>;
}

export function buildReceiptIndexes(receipts: Receipt[]): ReceiptIndexes {
  const byId = new Map<string, Receipt>();
  const byType = new Map<string, Receipt[]>();
  const byDate = new Map<string, Receipt[]>();
  const byLocation = new Map<string, Receipt[]>();

  for (const receipt of receipts) {
    // By ID
    byId.set(receipt.id, receipt);

    // By Type
    if (!byType.has(receipt.type)) {
      byType.set(receipt.type, []);
    }
    byType.get(receipt.type)!.push(receipt);

    // By Date
    const dateKey = receipt.date.toISOString().split("T")[0];
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, []);
    }
    byDate.get(dateKey)!.push(receipt);

    // By Location
    if (receipt.location?.normalized) {
      if (!byLocation.has(receipt.location.normalized)) {
        byLocation.set(receipt.location.normalized, []);
      }
      byLocation.get(receipt.location.normalized)!.push(receipt);
    }
  }

  return { byId, byType, byDate, byLocation };
}

// ============================================================================
// FILTERING & SEARCH
// ============================================================================

export interface SearchOptions {
  query?: string;
  categories?: string[];
  dateRange?: { start: Date; end: Date };
  limit?: number;
}

export function searchReceipts(receipts: Receipt[], options: SearchOptions): Receipt[] {
  let results = receipts;

  // Filter by query
  if (options.query) {
    const query = options.query.toLowerCase();
    results = results.filter((receipt) => {
      const searchText = [
        receipt.title,
        receipt.description,
        receipt.type === "music" ? receipt.artist : undefined,
        receipt.type === "purchase" ? receipt.merchant : undefined,
        receipt.location?.city,
        receipt.location?.state,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchText.includes(query);
    });
  }

  // Filter by categories
  if (options.categories && options.categories.length > 0) {
    results = results.filter((receipt) => options.categories!.includes(receipt.type));
  }

  // Filter by date range
  if (options.dateRange) {
    results = results.filter((receipt) => {
      const time = receipt.date.getTime();
      return time >= options.dateRange!.start.getTime() && time <= options.dateRange!.end.getTime();
    });
  }

  // Limit results
  if (options.limit && options.limit > 0) {
    results = results.slice(0, options.limit);
  }

  return results;
}
