/**
 * Timeline Utilities Tests
 */

import { describe, it, expect } from "vitest";
import type { Receipt, LifeMoment, MusicReceipt, PurchaseReceipt } from "../types/index";
import { groupReceiptsByDate, analyzePatterns, getMomentsForDate } from "../utils/timeline";

const mockReceipts: Receipt[] = [
  {
    id: "r1",
    type: "music",
    title: "Track 1",
    date: new Date("2024-05-10T10:00:00Z"),
    timestamp: "2024-05-10T10:00:00Z",
    source: "spotify",
  } as MusicReceipt,
  {
    id: "r2",
    type: "purchase",
    title: "Coffee",
    date: new Date("2024-05-10T14:30:00Z"),
    timestamp: "2024-05-10T14:30:00Z",
    amount: 5,
    source: "household",
  } as PurchaseReceipt,
  {
    id: "r3",
    type: "music",
    title: "Track 2",
    date: new Date("2024-05-11T18:00:00Z"),
    timestamp: "2024-05-11T18:00:00Z",
    source: "spotify",
  } as MusicReceipt,
];

const mockMoments: LifeMoment[] = [
  {
    id: "m1",
    title: "May 10 Workday Session",
    receipts: [mockReceipts[0], mockReceipts[1]],
    receiptIds: ["r1", "r2"],
    startTime: new Date("2024-05-10T10:00:00Z"),
    endTime: new Date("2024-05-10T14:30:00Z"),
    categories: ["music", "purchase"],
    locations: [],
    connections: [],
    summary: "Coffee and soundtrack during morning work.",
    evidence: ["Clustered within 4.5 hours"],
    timeSpanMinutes: 270,
  },
];

describe("Timeline Utilities", () => {
  it("should group receipts by date correctly", () => {
    const grouped = groupReceiptsByDate(mockReceipts);

    expect(Object.keys(grouped)).toContain("2024-05-10");
    expect(Object.keys(grouped)).toContain("2024-05-11");
    expect(grouped["2024-05-10"].length).toBe(2);
    expect(grouped["2024-05-11"].length).toBe(1);
  });

  it("should sort receipts descending within each date", () => {
    const grouped = groupReceiptsByDate(mockReceipts);
    const day10 = grouped["2024-05-10"];

    expect(day10[0].date.getTime()).toBeGreaterThan(day10[1].date.getTime());
  });

  it("should retrieve moments for a specific date", () => {
    const momentsOn10th = getMomentsForDate("2024-05-10", mockMoments);
    expect(momentsOn10th.length).toBe(1);
    expect(momentsOn10th[0].id).toBe("m1");

    const momentsOn11th = getMomentsForDate("2024-05-11", mockMoments);
    expect(momentsOn11th.length).toBe(0);
  });

  it("should analyze patterns for the timeline view", () => {
    const patterns = analyzePatterns(mockReceipts, mockMoments);

    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0].evidence.length).toBeGreaterThan(0);
  });
});
