/**
 * Life Insights Engine Tests
 * Verifies calculation of evidence-based patterns (active time, categories, streaks, recurring entities)
 */

import { describe, it, expect } from "vitest";
import type { Receipt, LifeMoment, MusicReceipt, PurchaseReceipt, PlaceReceipt } from "../types/index";
import {
  calculateActiveTimeInsight,
  calculateCategoryInsight,
  calculateRecurringInsights,
  calculateStreaks,
  calculateBusiestPeriods,
  calculateCrossCategoryPatterns,
  generateLifeInsightsReport,
} from "../utils/insights";

const mockReceipts: Receipt[] = [
  {
    id: "m1",
    type: "music",
    title: "Midnight City",
    artist: "M83",
    timestamp: "2024-03-01T20:30:00.000Z",
    date: new Date("2024-03-01T20:30:00.000Z"),
    source: "spotify",
    msPlayed: 240000,
  } as MusicReceipt,
  {
    id: "m2",
    type: "music",
    title: "Wait",
    artist: "M83",
    timestamp: "2024-03-01T21:00:00.000Z",
    date: new Date("2024-03-01T21:00:00.000Z"),
    source: "spotify",
    msPlayed: 180000,
  } as MusicReceipt,
  {
    id: "p1",
    type: "purchase",
    title: "Whole Foods Market",
    merchant: "Whole Foods",
    amount: 142.5,
    currency: "USD",
    category: "Groceries",
    timestamp: "2024-03-01T14:15:00.000Z",
    date: new Date("2024-03-01T14:15:00.000Z"),
    source: "household",
  } as PurchaseReceipt,
  {
    id: "pl1",
    type: "place",
    title: "Central Park",
    location: { city: "New York", country: "USA" },
    timestamp: "2024-03-02T16:00:00.000Z",
    date: new Date("2024-03-02T16:00:00.000Z"),
    source: "household",
  } as PlaceReceipt,
  {
    id: "p2",
    type: "purchase",
    title: "Local Cafe",
    merchant: "Blue Bottle Coffee",
    amount: 8.5,
    currency: "USD",
    category: "Coffee",
    timestamp: "2024-03-03T09:00:00.000Z",
    date: new Date("2024-03-03T09:00:00.000Z"),
    source: "household",
  } as PurchaseReceipt,
];

const mockMoments: LifeMoment[] = [
  {
    id: "moment-1",
    receipts: [mockReceipts[0], mockReceipts[2]],
    receiptIds: ["m1", "p1"],
    startTime: new Date("2024-03-01T14:00:00.000Z"),
    endTime: new Date("2024-03-01T21:30:00.000Z"),
    categories: ["music", "purchase"],
    locations: [],
    connections: [],
    title: "Friday Evening Groceries & Audio",
    summary: "Groceries shopping accompanied by M83 listening.",
    evidence: ["Music and purchase occurred on the same day."],
    timeSpanMinutes: 450,
  },
];

describe("Life Insights Engine", () => {
  it("should calculate active time patterns accurately", () => {
    const active = calculateActiveTimeInsight(mockReceipts);

    expect(active.peakHourCount).toBeGreaterThan(0);
    expect(active.evidence.length).toBeGreaterThan(0);
    expect(["Morning", "Afternoon", "Evening", "Night"]).toContain(active.dominantTimeOfDay);
  });

  it("should calculate category breakdown and dominant category", () => {
    const cats = calculateCategoryInsight(mockReceipts);

    expect(cats.counts.music).toBe(2);
    expect(cats.counts.purchase).toBe(2);
    expect(cats.counts.place).toBe(1);
    expect(cats.percentages.music + cats.percentages.purchase + cats.percentages.place).toBeGreaterThanOrEqual(95);
  });

  it("should identify recurring entities", () => {
    const recurring = calculateRecurringInsights(mockReceipts);

    expect(recurring.artists.length).toBeGreaterThan(0);
    expect(recurring.artists[0].name).toBe("M83");
    expect(recurring.artists[0].count).toBe(2);

    expect(recurring.merchants.length).toBeGreaterThan(0);
    expect(recurring.locations.length).toBeGreaterThan(0);
  });

  it("should calculate consecutive active streaks", () => {
    // 2024-03-01, 2024-03-02, 2024-03-03 is a 3-day continuous streak
    const streak = calculateStreaks(mockReceipts);

    expect(streak.longestStreakDays).toBe(3);
    expect(streak.totalActiveDays).toBe(3);
    expect(streak.evidence.length).toBeGreaterThan(0);
  });

  it("should calculate busiest periods", () => {
    const busiest = calculateBusiestPeriods(mockReceipts);

    expect(busiest.length).toBeGreaterThan(0);
    // 2024-03-01 had 3 events
    expect(busiest[0].date).toBe("2024-03-01");
    expect(busiest[0].eventCount).toBe(3);
  });

  it("should discover cross-category patterns with verified evidence", () => {
    const patterns = calculateCrossCategoryPatterns(mockReceipts, mockMoments);

    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0].evidence.length).toBeGreaterThan(0);
  });

  it("should generate a complete report without error", () => {
    const report = generateLifeInsightsReport(mockReceipts, mockMoments);

    expect(report.totalReceipts).toBe(mockReceipts.length);
    expect(report.totalMoments).toBe(mockMoments.length);
    expect(report.activeTime).toBeDefined();
    expect(report.recurring).toBeDefined();
    expect(report.streaks).toBeDefined();
  });
});
