/**
 * Connection Engine Tests
 */

import { describe, it, expect } from "vitest";
import { scoreConnection, detectConnections, buildConnectionIndex, getConnectedReceiptIds } from "../utils/connections";
import type { Receipt } from "../types/index";

describe("Connection Scoring", () => {
  it("should give high score for receipts close in time", () => {
    const r1: Receipt = {
      id: "1",
      type: "music",
      timestamp: "2023-01-01T10:00:00Z",
      date: new Date("2023-01-01T10:00:00Z"),
      title: "Song 1",
      source: "spotify",
    };

    const r2: Receipt = {
      id: "2",
      type: "purchase",
      timestamp: "2023-01-01T10:30:00Z",
      date: new Date("2023-01-01T10:30:00Z"),
      title: "Purchase 1",
      amount: 100,
      source: "household",
    };

    const score = scoreConnection(r1, r2);

    expect(score).toBeGreaterThan(15);
  });

  it("should give high score for receipts in same location", () => {
    const r1: Receipt = {
      id: "1",
      type: "purchase",
      timestamp: "2023-01-01T10:00:00Z",
      date: new Date("2023-01-01T10:00:00Z"),
      title: "Purchase 1",
      amount: 100,
      location: { city: "Mumbai", state: "Maharashtra", normalized: "mumbai, maharashtra" },
      source: "household",
    };

    const r2: Receipt = {
      id: "2",
      type: "purchase",
      timestamp: "2023-01-01T14:00:00Z",
      date: new Date("2023-01-01T14:00:00Z"),
      title: "Purchase 2",
      amount: 50,
      location: { city: "Mumbai", state: "Maharashtra", normalized: "mumbai, maharashtra" },
      source: "india_transaction",
    };

    const score = scoreConnection(r1, r2);

    expect(score).toBeGreaterThan(25);
  });

  it("should return 0 for receipts far apart in time and location", () => {
    const r1: Receipt = {
      id: "1",
      type: "music",
      timestamp: "2023-01-01T00:00:00Z",
      date: new Date("2023-01-01T00:00:00Z"),
      title: "Song 1",
      source: "spotify",
    };

    const r2: Receipt = {
      id: "2",
      type: "purchase",
      timestamp: "2023-12-31T00:00:00Z",
      date: new Date("2023-12-31T00:00:00Z"),
      title: "Purchase 1",
      amount: 100,
      source: "household",
    };

    const score = scoreConnection(r1, r2);

    expect(score).toBe(0);
  });
});

describe("Connection Detection", () => {
  it("should detect connections between related receipts", () => {
    const receipts: Receipt[] = [
      {
        id: "1",
        type: "music",
        timestamp: "2023-01-01T10:00:00Z",
        date: new Date("2023-01-01T10:00:00Z"),
        title: "Song 1",
        source: "spotify",
      },
      {
        id: "2",
        type: "purchase",
        timestamp: "2023-01-01T10:30:00Z",
        date: new Date("2023-01-01T10:30:00Z"),
        title: "Purchase 1",
        amount: 100,
        source: "household",
      },
    ];

    const connections = detectConnections(receipts, 10);

    expect(connections.length).toBeGreaterThan(0);
    expect(connections[0].receiptId1).toBeDefined();
    expect(connections[0].receiptId2).toBeDefined();
    expect(connections[0].score).toBeGreaterThan(10);
  });
});

describe("Connection Indexing", () => {
  it("should build connection index correctly", () => {
    const connections = [
      {
        id: "conn_1",
        receiptId1: "r1",
        receiptId2: "r2",
        type: "temporal" as const,
        score: 50,
        reason: "Test",
        details: {},
        strength: "moderate" as const,
      },
    ];

    const index = buildConnectionIndex(connections);

    expect(index.get("r1")).toBeDefined();
    expect(index.get("r2")).toBeDefined();
    expect(index.get("r1")![0].id).toBe("conn_1");
  });

  it("should get connected receipt IDs", () => {
    const connections = [
      {
        id: "conn_1",
        receiptId1: "r1",
        receiptId2: "r2",
        type: "temporal" as const,
        score: 50,
        reason: "Test",
        details: {},
        strength: "moderate" as const,
      },
      {
        id: "conn_2",
        receiptId1: "r1",
        receiptId2: "r3",
        type: "location" as const,
        score: 60,
        reason: "Test",
        details: {},
        strength: "strong" as const,
      },
    ];

    const connectedIds = getConnectedReceiptIds("r1", connections);

    expect(connectedIds).toContain("r2");
    expect(connectedIds).toContain("r3");
    expect(connectedIds.length).toBe(2);
  });
});
