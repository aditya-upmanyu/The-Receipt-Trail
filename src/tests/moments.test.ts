/**
 * Moment Detection Tests
 */

import { describe, it, expect } from "vitest";
import { detectMoments } from "../utils/moments";
import type { Receipt, Connection } from "../types/index";

describe("Moment Detection", () => {
  it("should detect moments from connected receipts", () => {
    const receipts: Receipt[] = [
      {
        id: "r1",
        type: "music",
        timestamp: "2023-01-01T10:00:00Z",
        date: new Date("2023-01-01T10:00:00Z"),
        title: "Song 1",
        source: "spotify",
      },
      {
        id: "r2",
        type: "purchase",
        timestamp: "2023-01-01T10:30:00Z",
        date: new Date("2023-01-01T10:30:00Z"),
        title: "Purchase 1",
        amount: 100,
        source: "household",
      },
      {
        id: "r3",
        type: "place",
        timestamp: "2023-01-01T11:00:00Z",
        date: new Date("2023-01-01T11:00:00Z"),
        title: "Place 1",
        source: "household",
      },
    ];

    const connections: Connection[] = [
      {
        id: "conn_1",
        receiptId1: "r1",
        receiptId2: "r2",
        type: "temporal",
        score: 50,
        reason: "Close in time",
        details: {},
        strength: "moderate",
      },
      {
        id: "conn_2",
        receiptId1: "r2",
        receiptId2: "r3",
        type: "temporal",
        score: 45,
        reason: "Close in time",
        details: {},
        strength: "moderate",
      },
    ];

    const moments = detectMoments(receipts, connections);

    expect(moments.length).toBeGreaterThan(0);
    expect(moments[0].receipts.length).toBeGreaterThanOrEqual(2);
    expect(moments[0].connections.length).toBeGreaterThan(0);
  });

  it("should not create moments from unconnected receipts", () => {
    const receipts: Receipt[] = [
      {
        id: "r1",
        type: "music",
        timestamp: "2023-01-01T10:00:00Z",
        date: new Date("2023-01-01T10:00:00Z"),
        title: "Song 1",
        source: "spotify",
      },
      {
        id: "r2",
        type: "purchase",
        timestamp: "2023-12-31T10:00:00Z",
        date: new Date("2023-12-31T10:00:00Z"),
        title: "Purchase 1",
        amount: 100,
        source: "household",
      },
    ];

    const connections: Connection[] = [];

    const moments = detectMoments(receipts, connections);

    expect(moments.length).toBe(0);
  });

  it("should generate correct moment titles", () => {
    const receipts: Receipt[] = [
      {
        id: "r1",
        type: "music",
        timestamp: "2023-01-01T10:00:00Z",
        date: new Date("2023-01-01T10:00:00Z"),
        title: "Song 1",
        location: { city: "Mumbai", normalized: "mumbai" },
        source: "spotify",
      },
      {
        id: "r2",
        type: "purchase",
        timestamp: "2023-01-01T10:30:00Z",
        date: new Date("2023-01-01T10:30:00Z"),
        title: "Purchase 1",
        amount: 100,
        location: { city: "Mumbai", normalized: "mumbai" },
        source: "household",
      },
    ];

    const connections: Connection[] = [
      {
        id: "conn_1",
        receiptId1: "r1",
        receiptId2: "r2",
        type: "temporal",
        score: 50,
        reason: "Close in time",
        details: {},
        strength: "moderate",
      },
    ];

    const moments = detectMoments(receipts, connections);

    expect(moments[0].title).toContain("Mumbai");
  });
});
