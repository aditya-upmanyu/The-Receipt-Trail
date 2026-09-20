/**
 * Connection Engine — Computes 6-dimensional weighted relationship graph between digital receipts.
 * Inputs: Array of normalized receipts across music, places, purchases, and events.
 * Outputs: Array of Connection objects scored (0-100) across temporal, location, and semantic dimensions.
 */

import type { Receipt, Connection, ConnectionType } from "../types/index";

// ============================================================================
// CONSTANTS
// ============================================================================

const CONNECTION_WEIGHTS = {
  location: 30,
  temporal: 25,
  keyword: 20,
  tag: 15,
  category: 10,
  recurrence: 10,
} as const;

const TEMPORAL_THRESHOLD_MINUTES = 120; // Within 2 hours
const LOCATION_THRESHOLD_KM = 5; // Within ~5km

// ============================================================================
// SCORING FUNCTIONS
// ============================================================================

function normalizeLocation(location: string | undefined): string {
  if (!location) return "";
  return location.toLowerCase().replace(/\s+/g, " ").trim();
}

function extractKeywords(text: string | undefined): Set<string> {
  if (!text) return new Set();

  // Remove common words and extract meaningful terms
  const stopwords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "from",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
  ]);

  const words = text
    .toLowerCase()
    .split(/[\s\-_.,;:!?'"()]+/)
    .filter((w) => w.length > 2 && !stopwords.has(w));

  return new Set(words);
}

function sharedKeywordCount(text1: string | undefined, text2: string | undefined): number {
  const keywords1 = extractKeywords(text1);
  const keywords2 = extractKeywords(text2);

  let shared = 0;
  for (const keyword of keywords1) {
    if (keywords2.has(keyword)) {
      shared++;
    }
  }

  return shared;
}

function getTemporalScore(r1: Receipt, r2: Receipt): number {
  const diffMs = Math.abs(r1.date.getTime() - r2.date.getTime());
  const diffMinutes = diffMs / (1000 * 60);

  if (diffMinutes > TEMPORAL_THRESHOLD_MINUTES * 4) {
    return 0; // Too far apart
  }

  // Score inversely proportional to time difference
  // 0 minutes = 25 points, 120 minutes = 12.5 points
  return Math.max(0, CONNECTION_WEIGHTS.temporal * (1 - diffMinutes / (TEMPORAL_THRESHOLD_MINUTES * 4)));
}

function getLocationScore(r1: Receipt, r2: Receipt): number {
  const loc1 = r1.location;
  const loc2 = r2.location;

  if (!loc1 || !loc2) {
    // If neither has location, no score
    if (!loc1 && !loc2) return 0;
    // If only one has location, no bonus
    return 0;
  }

  // Exact city match
  if (loc1.city && loc2.city && normalizeLocation(loc1.city) === normalizeLocation(loc2.city)) {
    return CONNECTION_WEIGHTS.location;
  }

  // Exact state match (weaker than city)
  if (loc1.state && loc2.state && normalizeLocation(loc1.state) === normalizeLocation(loc2.state)) {
    return CONNECTION_WEIGHTS.location * 0.5;
  }

  // Coordinate proximity (if available)
  if (
    loc1.latitude !== undefined &&
    loc1.longitude !== undefined &&
    loc2.latitude !== undefined &&
    loc2.longitude !== undefined
  ) {
    const distance = calculateHaversineDistance(loc1.latitude, loc1.longitude, loc2.latitude, loc2.longitude);
    if (distance < LOCATION_THRESHOLD_KM) {
      // Score decreases with distance
      return Math.max(0, CONNECTION_WEIGHTS.location * (1 - distance / LOCATION_THRESHOLD_KM));
    }
  }

  return 0;
}

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getSemanticScore(r1: Receipt, r2: Receipt): number {
  const keywordMatches = sharedKeywordCount(r1.title, r2.title) + sharedKeywordCount(r1.description, r2.description);

  if (keywordMatches > 0) {
    return Math.min(CONNECTION_WEIGHTS.keyword, keywordMatches * 5);
  }

  return 0;
}

function getCategoryScore(r1: Receipt, r2: Receipt): number {
  // Check for related category chains
  if (r1.type === r2.type) {
    return CONNECTION_WEIGHTS.category * 0.5;
  }

  // Music + Place + Purchase is a common chain
  if ((r1.type === "music" && r2.type === "place") || (r1.type === "place" && r2.type === "music")) {
    return CONNECTION_WEIGHTS.category;
  }

  if ((r1.type === "place" && r2.type === "purchase") || (r1.type === "purchase" && r2.type === "place")) {
    return CONNECTION_WEIGHTS.category;
  }

  if ((r1.type === "purchase" && r2.type === "event") || (r1.type === "event" && r2.type === "purchase")) {
    return CONNECTION_WEIGHTS.category;
  }

  return 0;
}

// ============================================================================
// CONNECTION DETECTION
// ============================================================================

export function scoreConnection(r1: Receipt, r2: Receipt): number {
  if (r1.id === r2.id) return 0;

  let score = 0;

  // Temporal: strongest signal
  score += getTemporalScore(r1, r2);

  // Location: very strong
  score += getLocationScore(r1, r2);

  // Semantic: moderate
  score += getSemanticScore(r1, r2);

  // Category: weak but useful
  score += getCategoryScore(r1, r2);

  // Normalize to 0-100
  return Math.min(100, Math.max(0, score));
}

function getConnectionType(r1: Receipt, r2: Receipt): ConnectionType {
  const temporal = getTemporalScore(r1, r2);
  const location = getLocationScore(r1, r2);
  const semantic = getSemanticScore(r1, r2);

  // Determine primary connection type
  if (temporal > location && temporal > semantic) {
    return "temporal";
  }
  if (location > temporal && location > semantic) {
    return "location";
  }
  if (semantic > 0) {
    return "semantic";
  }

  // Check for category chains
  const categoryScore = getCategoryScore(r1, r2);
  if (categoryScore > 0) {
    return "category_chain";
  }

  return "temporal"; // Default
}

export function detectConnections(receipts: Receipt[], minScore: number = 15): Connection[] {
  const connections: Connection[] = [];
  const connectionMap = new Map<string, Connection>();

  // O(n²) comparison - optimized with indexing for large datasets
  for (let i = 0; i < receipts.length; i++) {
    for (let j = i + 1; j < receipts.length; j++) {
      const r1 = receipts[i];
      const r2 = receipts[j];

      const score = scoreConnection(r1, r2);

      if (score >= minScore) {
        const type = getConnectionType(r1, r2);
        const strength = score > 70 ? "strong" : score > 40 ? "moderate" : "weak";

        const connection: Connection = {
          id: `conn_${r1.id}_${r2.id}`,
          receiptId1: r1.id,
          receiptId2: r2.id,
          type,
          score,
          reason: generateConnectionReason(r1, r2, type),
          details: {
            temporal: getTemporalScore(r1, r2),
            location: getLocationScore(r1, r2),
            semantic: getSemanticScore(r1, r2),
            category: getCategoryScore(r1, r2),
          },
          strength,
        };

        connectionMap.set(connection.id, connection);
        connections.push(connection);
      }
    }
  }

  return Array.from(connectionMap.values());
}

function generateConnectionReason(r1: Receipt, r2: Receipt, type: ConnectionType): string {
  switch (type) {
    case "temporal": {
      const diffMs = Math.abs(r1.date.getTime() - r2.date.getTime());
      const diffHours = Math.round(diffMs / (1000 * 60 * 60));
      return `Within ${diffHours} hours of each other`;
    }

    case "location": {
      if (r1.location?.city && r2.location?.city && r1.location.city === r2.location.city) {
        return `Both in ${r1.location.city}`;
      }
      if (r1.location?.state && r2.location?.state && r1.location.state === r2.location.state) {
        return `Both in ${r1.location.state}`;
      }
      return "At nearby locations";
    }

    case "semantic":
      return "Share similar context or keywords";

    case "category_chain":
      return `${r1.type} → ${r2.type} activity sequence`;

    case "recurrence":
      return "Part of recurring pattern";

    default:
      return "Connected";
  }
}

// ============================================================================
// CONNECTION INDEXING & RETRIEVAL
// ============================================================================

export function buildConnectionIndex(connections: Connection[]): Map<string, Connection[]> {
  const index = new Map<string, Connection[]>();

  for (const conn of connections) {
    // Index by receipt1
    if (!index.has(conn.receiptId1)) {
      index.set(conn.receiptId1, []);
    }
    index.get(conn.receiptId1)!.push(conn);

    // Index by receipt2
    if (!index.has(conn.receiptId2)) {
      index.set(conn.receiptId2, []);
    }
    index.get(conn.receiptId2)!.push(conn);
  }

  return index;
}

export function getConnectationsForReceipt(receiptId: string, connections: Connection[]): Connection[] {
  return connections.filter((c) => c.receiptId1 === receiptId || c.receiptId2 === receiptId);
}

export function getConnectedReceiptIds(receiptId: string, connections: Connection[]): string[] {
  const connectedIds = new Set<string>();
  const relevantConnections = getConnectationsForReceipt(receiptId, connections);

  for (const conn of relevantConnections) {
    if (conn.receiptId1 === receiptId) {
      connectedIds.add(conn.receiptId2);
    } else {
      connectedIds.add(conn.receiptId1);
    }
  }

  return Array.from(connectedIds);
}

// ============================================================================
// PATTERN DETECTION
// ============================================================================

export function detectRecurrencePatterns(receipts: Receipt[]): Map<string, number> {
  const patterns = new Map<string, number>();

  for (const receipt of receipts) {
    // Location recurrence
    if (receipt.location?.normalized) {
      const key = `loc_${receipt.location.normalized}`;
      patterns.set(key, (patterns.get(key) || 0) + 1);
    }

    // Category recurrence
    const catKey = `cat_${receipt.type}`;
    patterns.set(catKey, (patterns.get(catKey) || 0) + 1);

    // Title/artist recurrence (for Spotify)
    if (receipt.type === "music" && receipt.title) {
      const musicKey = `music_${receipt.title}`;
      patterns.set(musicKey, (patterns.get(musicKey) || 0) + 1);
    }
  }

  return patterns;
}
