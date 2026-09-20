/**
 * Data Parsing & Normalization Pipeline
 * Handles CSV and JSON parsing from all three datasets
 */

import type {
  Receipt,
  MusicReceipt,
  PurchaseReceipt,
  Location,
  ParseResult,
  ParseError,
} from "../types/index";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;

  // Try multiple date formats
  const formats = [
    // ISO format: 2013-07-08T02:44:34 or 2013-07-08
    /^\d{4}-\d{2}-\d{2}/,
    // US format: 12/26/2023 0:55
    /^\d{1,2}\/\d{1,2}\/\d{4}/,
    // DD/MM/YYYY format: 20/09/2018 12:04:08
    /^\d{1,2}\/\d{1,2}\/\d{4}/,
  ];

  for (const format of formats) {
    if (format.test(dateStr)) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return null;
}

function parseLocation(data: Record<string, unknown>): Location | undefined {
  const city = data.city ? String(data.city).trim() : undefined;
  const state = data.state ? String(data.state).trim() : undefined;
  const country = "India"; // Default to India based on datasets

  const latitude =
    typeof data.lat === "number" ? data.lat : typeof data.latitude === "number" ? data.latitude : undefined;
  const longitude =
    typeof data.long === "number" ? data.long : typeof data.longitude === "number" ? data.longitude : undefined;

  if (!city && !state && latitude === undefined && longitude === undefined) {
    return undefined;
  }

  return {
    city: city && city !== "" ? city : undefined,
    state: state && state !== "" ? state : undefined,
    country,
    latitude,
    longitude,
    normalized: [city, state].filter(Boolean).join(", "),
  };
}

function generateId(source: string, data: Record<string, unknown>): string {
  // Create stable IDs based on source and unique fields
  if (source === "spotify") {
    const ts = data.ts as string;
    const track = data.track_name as string;
    return `spotify_${ts}_${track}`.slice(0, 50).replace(/[^a-z0-9_]/gi, "_");
  }
  if (source === "household") {
    const date = data.Date as string;
    const amount = data.Amount as string;
    return `household_${date}_${amount}`.slice(0, 50).replace(/[^a-z0-9_]/gi, "_");
  }
  if (source === "india_transaction") {
    const transId = data.trans_id as string | number;
    return `india_${transId}`.replace(/[^a-z0-9_]/gi, "_");
  }
  return `unknown_${Math.random().toString(36).slice(2, 9)}`;
}

// ============================================================================
// SPOTIFY PARSING
// ============================================================================

export function parseSpotifyCSV(csv: string): ParseResult<MusicReceipt> {
  const errors: ParseError[] = [];
  const receipts: MusicReceipt[] = [];
  const lines = csv.split("\n").filter((line) => line.trim());

  if (lines.length < 2) {
    return { data: receipts, errors, skipped: 0, total: 0 };
  }

  const headers = lines[0].split(",").map((h) => h.trim());
  const total = lines.length - 1;

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i]);
      if (values.length < 5) continue;

      const row: Record<string, unknown> = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || "";
      });

      const timestamp = row.ts as string;
      const date = parseDate(timestamp);
      if (!date) {
        errors.push({ row: i, error: "Invalid timestamp", rawData: timestamp });
        continue;
      }

      const msPlayed = parseInt(String(row.ms_played), 10);
      if (isNaN(msPlayed) || msPlayed <= 0) {
        // Skip tracks not actually played
        continue;
      }

      const receipt: MusicReceipt = {
        id: generateId("spotify", row),
        type: "music",
        timestamp: new Date(timestamp).toISOString(),
        date,
        title: (row.track_name as string) || "Unknown Track",
        artist: (row.artist_name as string) || undefined,
        albumName: (row.album_name as string) || undefined,
        trackUri: (row.spotify_track_uri as string) || undefined,
        msPlayed,
        platform: (row.platform as string) || undefined,
        reasonStart: (row.reason_start as string) || undefined,
        reasonEnd: (row.reason_end as string) || undefined,
        skipped: (row.skipped as string)?.toLowerCase() === "true",
        source: "spotify",
      };

      receipts.push(receipt);
    } catch (error) {
      errors.push({
        row: i,
        error: error instanceof Error ? error.message : "Unknown error",
        rawData: lines[i],
      });
    }
  }

  return { data: receipts, errors, skipped: total - receipts.length, total };
}

// ============================================================================
// HOUSEHOLD TRANSACTIONS PARSING
// ============================================================================

export function parseHouseholdTransactionsCSV(csv: string): ParseResult<PurchaseReceipt> {
  const errors: ParseError[] = [];
  const receipts: PurchaseReceipt[] = [];
  const lines = csv.split("\n").filter((line) => line.trim());

  if (lines.length < 2) {
    return { data: receipts, errors, skipped: 0, total: 0 };
  }

  const headers = lines[0].split(",").map((h) => h.trim());
  const total = lines.length - 1;

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i]);
      if (values.length < 3) continue;

      const row: Record<string, unknown> = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || "";
      });

      const dateStr = row.Date as string;
      const date = parseDate(dateStr);
      if (!date) {
        errors.push({ row: i, error: "Invalid date", rawData: dateStr });
        continue;
      }

      const amount = parseFloat(String(row.Amount));
      if (isNaN(amount)) {
        errors.push({ row: i, error: "Invalid amount", rawData: String(row.Amount) });
        continue;
      }

      const category = (row.Category as string) || "Other";
      const subcategory = (row.Subcategory as string) || undefined;
      const note = (row.Note as string) || undefined;

      const receipt: PurchaseReceipt = {
        id: generateId("household", row),
        type: "purchase",
        timestamp: date.toISOString(),
        date,
        title: subcategory || category,
        description: note,
        amount,
        currency: (row.Currency as string) || "INR",
        category,
        subcategory,
        paymentMode: (row.Mode as string) || undefined,
        metadata: {
          incomeExpense: (row["Income/Expense"] as string) || "Expense",
        },
        source: "household",
      };

      receipts.push(receipt);
    } catch (error) {
      errors.push({
        row: i,
        error: error instanceof Error ? error.message : "Unknown error",
        rawData: lines[i],
      });
    }
  }

  return { data: receipts, errors, skipped: total - receipts.length, total };
}

// ============================================================================
// INDIA TRANSACTION PARSING
// ============================================================================

export function parseIndiaTransactionJSON(jsonStr: string): ParseResult<PurchaseReceipt> {
  const errors: ParseError[] = [];
  const receipts: PurchaseReceipt[] = [];

  try {
    const parsed = JSON.parse(jsonStr);
    const data = parsed.value || parsed;
    const total = Array.isArray(data) ? data.length : 0;

    if (!Array.isArray(data)) {
      return { data: receipts, errors, skipped: total, total };
    }

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i] as Record<string, unknown>;

        if (!row || typeof row !== "object") {
          errors.push({ row: i, error: "Invalid row format" });
          continue;
        }

        const dateStr = row.trans_date_trans_time as string;
        const date = parseDate(dateStr);
        if (!date) {
          errors.push({ row: i, error: "Invalid timestamp", rawData: dateStr });
          continue;
        }

        const amount = parseFloat(String(row.amt));
        if (isNaN(amount)) {
          errors.push({ row: i, error: "Invalid amount", rawData: String(row.amt) });
          continue;
        }

        const location = parseLocation({
          city: row.city,
          state: row.state,
          lat: row.merch_lat || row.lat,
          long: row.merch_long || row.long,
        });

        const merchant = (row.merchant as string) || undefined;
        const category = (row.category as string) || "Other";

        const receipt: PurchaseReceipt = {
          id: generateId("india_transaction", row),
          type: "purchase",
          timestamp: date.toISOString(),
          date,
          title: merchant ? merchant.replace(/^fraud_/, "") : category,
          merchant,
          amount,
          currency: "INR",
          category,
          location,
          metadata: {
            isFraud: row.is_fraud === 1 || row.is_fraud === "1" ? "true" : "false",
            customerId: row.customer_id ? String(row.customer_id) : null,
            cardNum: row.cc_num ? String(row.cc_num).slice(-4) : null,
          },
          source: "india_transaction",
          isFraud: row.is_fraud === 1 || row.is_fraud === "1",
        };

        receipts.push(receipt);
      } catch (error) {
        errors.push({
          row: i,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return { data: receipts, errors, skipped: total - receipts.length, total };
  } catch (error) {
    errors.push({
      row: 0,
      error: error instanceof Error ? error.message : "JSON parse error",
    });
    return { data: receipts, errors, skipped: 1, total: 1 };
  }
}

// ============================================================================
// CSV UTILITIES
// ============================================================================

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

// ============================================================================
// NORMALIZATION
// ============================================================================

export function deduplicateReceipts(receipts: Receipt[]): Receipt[] {
  const seen = new Set<string>();
  const deduplicated: Receipt[] = [];

  for (const receipt of receipts) {
    // Use timestamp + title as deduplication key
    const key = `${receipt.timestamp}_${receipt.title}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(receipt);
    }
  }

  return deduplicated;
}

export function sortReceiptsByDate(receipts: Receipt[]): Receipt[] {
  return [...receipts].sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function normalizeReceipts(receipts: Receipt[]): Receipt[] {
  const deduplicated = deduplicateReceipts(receipts);
  const sorted = sortReceiptsByDate(deduplicated);
  return sorted;
}
