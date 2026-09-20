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
    const spotifyData = await loadSpotifyData();
    allReceipts.push(...spotifyData);

    // Load Household transactions
    const householdData = await loadHouseholdData();
    allReceipts.push(...householdData);

    // Load India transactions
    const indiaData = await loadIndiaTransactionData();
    allReceipts.push(...indiaData);

    // Normalize and deduplicate
    const normalized = normalizeReceipts(allReceipts);

    console.log(`Loaded ${normalized.length} receipts from ${allReceipts.length} raw records`);

    return normalized;
  } catch (error) {
    console.error("Error loading receipts:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to load data";
    throw new Error(`Failed to load receipt data: ${errorMessage}`, { cause: error });
  }
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
