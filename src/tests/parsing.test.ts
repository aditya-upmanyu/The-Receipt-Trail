/**
 * Parsing Tests
 */

import { describe, it, expect } from "vitest";
import { parseSpotifyCSV, parseHouseholdTransactionsCSV, parseIndiaTransactionJSON, deduplicateReceipts, sortReceiptsByDate } from "../utils/parsing";
import type { Receipt } from "../types/index";

describe("Spotify CSV Parsing", () => {
  it("should parse valid Spotify CSV data", () => {
    const csv = `spotify_track_uri,ts,platform,ms_played,track_name,artist_name,album_name,reason_start,reason_end,shuffle,skipped
2J3n32GeLmMjwuAzyhcSNe,2013-07-08 02:44:34,web player,3185,Test Track,Test Artist,Test Album,autoplay,clickrow,FALSE,FALSE`;

    const result = parseSpotifyCSV(csv);

    expect(result.data.length).toBe(1);
    expect(result.data[0].type).toBe("music");
    expect(result.data[0].title).toBe("Test Track");
    expect(result.data[0].artist).toBe("Test Artist");
  });

  it("should skip tracks with zero playtime", () => {
    const csv = `spotify_track_uri,ts,platform,ms_played,track_name,artist_name,album_name,reason_start,reason_end,shuffle,skipped
2J3n32GeLmMjwuAzyhcSNe,2013-07-08 02:44:34,web player,0,Test Track,Test Artist,Test Album,autoplay,clickrow,FALSE,FALSE`;

    const result = parseSpotifyCSV(csv);

    expect(result.data.length).toBe(0);
  });
});

describe("Household Transactions CSV Parsing", () => {
  it("should parse valid household transaction CSV", () => {
    const csv = `Date,Mode,Category,Subcategory,Note,Amount,Income/Expense,Currency
01/09/2018 12:04:08,Cash,Transportation,Train,Test note,30,Expense,INR`;

    const result = parseHouseholdTransactionsCSV(csv);

    expect(result.data.length).toBe(1);
    expect(result.data[0].type).toBe("purchase");
    expect(result.data[0].amount).toBe(30);
    expect(result.data[0].currency).toBe("INR");
  });
});

describe("India Transaction JSON Parsing", () => {
  it("should parse valid India transaction JSON", () => {
    const json = JSON.stringify({
      value: [
        {
          trans_id: 12345,
          trans_date_trans_time: "12/26/2023 0:55",
          amt: 100.50,
          merchant: "Test Merchant",
          category: "food",
          city: "Mumbai",
          state: "Maharashtra",
        },
      ],
    });

    const result = parseIndiaTransactionJSON(json);

    expect(result.data.length).toBe(1);
    expect(result.data[0].type).toBe("purchase");
    expect(result.data[0].amount).toBe(100.50);
  });
});

describe("Receipt Normalization", () => {
  it("should deduplicate receipts with same timestamp and title", () => {
    const receipts: Receipt[] = [
      {
        id: "1",
        type: "music",
        timestamp: "2023-01-01T00:00:00Z",
        date: new Date("2023-01-01T00:00:00Z"),
        title: "Same Song",
        source: "spotify",
      },
      {
        id: "2",
        type: "music",
        timestamp: "2023-01-01T00:00:00Z",
        date: new Date("2023-01-01T00:00:00Z"),
        title: "Same Song",
        source: "spotify",
      },
    ];

    const result = deduplicateReceipts(receipts);

    expect(result.length).toBe(1);
  });

  it("should sort receipts by date", () => {
    const receipts: Receipt[] = [
      {
        id: "2",
        type: "music",
        timestamp: "2023-01-02T00:00:00Z",
        date: new Date("2023-01-02T00:00:00Z"),
        title: "Song 2",
        source: "spotify",
      },
      {
        id: "1",
        type: "music",
        timestamp: "2023-01-01T00:00:00Z",
        date: new Date("2023-01-01T00:00:00Z"),
        title: "Song 1",
        source: "spotify",
      },
    ];

    const result = sortReceiptsByDate(receipts);

    expect(result[0].id).toBe("1");
    expect(result[1].id).toBe("2");
  });
});
