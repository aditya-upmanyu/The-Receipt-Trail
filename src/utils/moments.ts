/**
 * Moment Detection Engine — DBSCAN-style temporal and relational clustering algorithm.
 * Inputs: Chronologically sorted receipts and discovered connection graph edges.
 * Outputs: Discrete LifeMoment clusters with temporal spans, participating receipts, and verifiable evidence.
 */

import type { Receipt, LifeMoment, Connection, Location } from "../types/index";

const MOMENT_TIME_WINDOW_MINUTES = 180; // 3 hours
const MOMENT_MIN_RECEIPTS = 2;
const MOMENT_MIN_CONNECTION_SCORE = 20;

// ============================================================================
// MOMENT DETECTION
// ============================================================================

export function detectMoments(receipts: Receipt[], connections: Connection[]): LifeMoment[] {
  if (receipts.length < MOMENT_MIN_RECEIPTS) return [];

  const moments: LifeMoment[] = [];
  const usedReceiptIds = new Set<string>();

  // Build connection index for quick lookups
  const connectionIndex = buildConnectionIndex(connections);

  // Sort receipts by date (mutate in place to avoid spread operator stack overflow)
  receipts.sort((a, b) => a.date.getTime() - b.date.getTime());
  const sortedReceipts = receipts;

  for (let i = 0; i < sortedReceipts.length; i++) {
    const receipt = sortedReceipts[i];

    if (usedReceiptIds.has(receipt.id)) continue;

    // Find all receipts within time window and connected
    const cluster = findMomentCluster(receipt, sortedReceipts, connectionIndex, usedReceiptIds);

    if (cluster.length >= MOMENT_MIN_RECEIPTS) {
      const moment = createMoment(cluster, connectionIndex);
      moments.push(moment);

      // Mark receipts as used
      cluster.forEach((r) => usedReceiptIds.add(r.id));
    }
  }

  return moments;
}

function findMomentCluster(
  seedReceipt: Receipt,
  allReceipts: Receipt[],
  connectionIndex: Map<string, Connection[]>,
  excludeIds: Set<string>
): Receipt[] {
  const cluster: Receipt[] = [seedReceipt];
  const clusterIds = new Set([seedReceipt.id]);

  const seedTime = seedReceipt.date.getTime();
  const windowStart = seedTime - MOMENT_TIME_WINDOW_MINUTES * 60 * 1000;
  const windowEnd = seedTime + MOMENT_TIME_WINDOW_MINUTES * 60 * 1000;

  // Find receipts in time window
  for (const receipt of allReceipts) {
    if (excludeIds.has(receipt.id)) continue;
    if (clusterIds.has(receipt.id)) continue;

    const receiptTime = receipt.date.getTime();
    if (receiptTime < windowStart || receiptTime > windowEnd) continue;

    // Check if connected to any receipt in cluster
    const isConnected = cluster.some((clusterReceipt) => {
      const conn = findConnection(clusterReceipt.id, receipt.id, connectionIndex);
      return conn && conn.score >= MOMENT_MIN_CONNECTION_SCORE;
    });

    if (isConnected) {
      cluster.push(receipt);
      clusterIds.add(receipt.id);
    }
  }

  return cluster;
}

function findConnection(id1: string, id2: string, connectionIndex: Map<string, Connection[]>): Connection | null {
  const connections = connectionIndex.get(id1) || [];
  return connections.find((c) => c.receiptId1 === id2 || c.receiptId2 === id2) || null;
}

function buildConnectionIndex(connections: Connection[]): Map<string, Connection[]> {
  const index = new Map<string, Connection[]>();

  for (const conn of connections) {
    if (!index.has(conn.receiptId1)) {
      index.set(conn.receiptId1, []);
    }
    index.get(conn.receiptId1)!.push(conn);

    if (!index.has(conn.receiptId2)) {
      index.set(conn.receiptId2, []);
    }
    index.get(conn.receiptId2)!.push(conn);
  }

  return index;
}

// ============================================================================
// MOMENT CREATION
// ============================================================================

function createMoment(receipts: Receipt[], connectionIndex: Map<string, Connection[]>): LifeMoment {
  // Sort in place to avoid spread operator stack overflow
  receipts.sort((a, b) => a.date.getTime() - b.date.getTime());
  const sortedReceipts = receipts;
  const startTime = sortedReceipts[0].date;
  const endTime = sortedReceipts[sortedReceipts.length - 1].date;

  const categories = Array.from(new Set(receipts.map((r) => r.type)));
  const locations = extractUniqueLocations(receipts);
  const receiptIds = receipts.map((r) => r.id);

  // Get connections within this moment
  const momentConnections = extractMomentConnections(receiptIds, connectionIndex);

  const title = generateMomentTitle(receipts, locations);
  const summary = generateMomentSummary(receipts, categories, locations);
  const evidence = generateMomentEvidence(receipts, momentConnections);

  const timeSpanMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

  return {
    id: `moment_${startTime.getTime()}_${receipts.length}`,
    receipts: sortedReceipts,
    receiptIds,
    startTime,
    endTime,
    categories,
    locations,
    connections: momentConnections,
    title,
    summary,
    evidence,
    timeSpanMinutes,
  };
}

function extractUniqueLocations(receipts: Receipt[]): Location[] {
  const locationMap = new Map<string, Location>();

  for (const receipt of receipts) {
    if (receipt.location?.normalized) {
      locationMap.set(receipt.location.normalized, receipt.location);
    }
  }

  return Array.from(locationMap.values());
}

function extractMomentConnections(receiptIds: string[], connectionIndex: Map<string, Connection[]>): Connection[] {
  const connections: Connection[] = [];
  const seen = new Set<string>();
  const idSet = new Set(receiptIds);

  for (const id of receiptIds) {
    const conns = connectionIndex.get(id) || [];
    for (const conn of conns) {
      if (seen.has(conn.id)) continue;
      if (idSet.has(conn.receiptId1) && idSet.has(conn.receiptId2)) {
        connections.push(conn);
        seen.add(conn.id);
      }
    }
  }

  return connections;
}

// ============================================================================
// TITLE & SUMMARY GENERATION
// ============================================================================

function generateMomentTitle(receipts: Receipt[], locations: Location[]): string {
  const categories = Array.from(new Set(receipts.map((r) => r.type)));

  // Location-based title
  if (locations.length === 1 && locations[0].city) {
    const activity = categories.length > 1 ? "Activity" : getCategoryLabel(categories[0]);
    return `${activity} in ${locations[0].city}`;
  }

  // Multi-location
  if (locations.length > 1) {
    return `${receipts.length} Connected Activities`;
  }

  // Category-based title
  if (categories.length === 1) {
    return `${getCategoryLabel(categories[0])} Session`;
  }

  // Multi-category
  if (categories.length > 1) {
    return `${categories.map(getCategoryLabel).join(" & ")} Cluster`;
  }

  return `${receipts.length} Connected Records`;
}

function generateMomentSummary(receipts: Receipt[], categories: string[], locations: Location[]): string {
  const parts: string[] = [];

  parts.push(`${receipts.length} connected receipt${receipts.length !== 1 ? "s" : ""}`);

  if (categories.length > 0) {
    parts.push(`involving ${categories.map(getCategoryLabel).join(", ")}`);
  }

  if (locations.length > 0) {
    const locationStr = locations
      .map((loc) => loc.city || loc.state)
      .filter(Boolean)
      .join(", ");
    if (locationStr) {
      parts.push(`near ${locationStr}`);
    }
  }

  return parts.join(" ");
}

function generateMomentEvidence(receipts: Receipt[], connections: Connection[]): string[] {
  const evidence: string[] = [];

  evidence.push(`${receipts.length} receipts within a ${Math.round((receipts[receipts.length - 1].date.getTime() - receipts[0].date.getTime()) / (1000 * 60))} minute window`);

  if (connections.length > 0) {
    const avgScore = connections.reduce((sum, c) => sum + c.score, 0) / connections.length;
    evidence.push(`${connections.length} strong connection${connections.length !== 1 ? "s" : ""} (avg score: ${Math.round(avgScore)})`);
  }

  const locations = Array.from(new Set(receipts.map((r) => r.location?.city).filter(Boolean)));
  if (locations.length === 1) {
    evidence.push(`All activity in ${locations[0]}`);
  }

  return evidence;
}

function getCategoryLabel(type: string): string {
  const labels: Record<string, string> = {
    music: "Music",
    place: "Location",
    purchase: "Purchase",
    event: "Event",
  };
  return labels[type] || type;
}
