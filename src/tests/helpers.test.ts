/**
 * Helper Functions Tests
 */

import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatCurrency,
  truncate,
  sanitizeSearchInput,
  getCategoryColor,
  getCategoryLabel,
  calculateReceiptStats,
} from "../utils/helpers";
import type { Receipt } from "../types/index";

describe("Date Formatting", () => {
  it("should format date correctly", () => {
    const date = new Date("2023-06-15T10:30:00Z");
    const formatted = formatDate(date);

    expect(formatted).toContain("Jun");
    expect(formatted).toContain("15");
    expect(formatted).toContain("2023");
  });
});

describe("Currency Formatting", () => {
  it("should format INR currency correctly", () => {
    const formatted = formatCurrency(1000, "INR");

    expect(formatted).toContain("1");
    expect(formatted).toContain("000");
  });
});

describe("Text Utilities", () => {
  it("should truncate long text", () => {
    const text = "This is a very long text that needs to be truncated";
    const truncated = truncate(text, 20);

    expect(truncated.length).toBeLessThanOrEqual(20);
    expect(truncated).toContain("...");
  });

  it("should not truncate short text", () => {
    const text = "Short text";
    const truncated = truncate(text, 20);

    expect(truncated).toBe(text);
  });

  it("should sanitize search input", () => {
    const input = "  test query  ";
    const sanitized = sanitizeSearchInput(input);

    expect(sanitized).toBe("test query");
  });

  it("should limit search input length", () => {
    const input = "a".repeat(200);
    const sanitized = sanitizeSearchInput(input);

    expect(sanitized.length).toBeLessThanOrEqual(100);
  });
});

describe("Category Utilities", () => {
  it("should return correct color for music category", () => {
    const color = getCategoryColor("music");

    expect(color).toContain("rgb");
  });

  it("should return correct label for purchase category", () => {
    const label = getCategoryLabel("purchase");

    expect(label).toBe("Purchase");
  });
});

describe("Receipt Statistics", () => {
  it("should calculate correct receipt stats", () => {
    const receipts: Receipt[] = [
      {
        id: "1",
        type: "music",
        timestamp: "2023-01-01T00:00:00Z",
        date: new Date("2023-01-01T00:00:00Z"),
        title: "Song 1",
        source: "spotify",
      },
      {
        id: "2",
        type: "music",
        timestamp: "2023-01-02T00:00:00Z",
        date: new Date("2023-01-02T00:00:00Z"),
        title: "Song 2",
        source: "spotify",
      },
      {
        id: "3",
        type: "purchase",
        timestamp: "2023-01-03T00:00:00Z",
        date: new Date("2023-01-03T00:00:00Z"),
        title: "Purchase 1",
        amount: 100,
        source: "household",
      },
    ];

    const stats = calculateReceiptStats(receipts);

    expect(stats.total).toBe(3);
    expect(stats.byType["music"]).toBe(2);
    expect(stats.byType["purchase"]).toBe(1);
    expect(stats.dateRange.earliest).toEqual(receipts[0].date);
    expect(stats.dateRange.latest).toEqual(receipts[2].date);
  });
});
