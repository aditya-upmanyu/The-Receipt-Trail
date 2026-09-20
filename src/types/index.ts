/**
 * Your Life, In Receipts - Type Definitions
 * Comprehensive type system using discriminated unions for all receipt types
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export type ReceiptType =
  | "music"
  | "place"
  | "purchase"
  | "event";

export interface Location {
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  normalized?: string;
}

export interface BaseReceipt {
  id: string;
  type: ReceiptType;
  timestamp: string; // ISO string
  date: Date; // Parsed date for sorting
  title?: string;
  description?: string;
  location?: Location;
  tags?: string[];
  metadata?: Record<string, string | number | boolean | null>;
  source: "spotify" | "household" | "india_transaction";
}

// ============================================================================
// RECEIPT TYPE VARIANTS (Discriminated Unions)
// ============================================================================

export interface MusicReceipt extends BaseReceipt {
  type: "music";
  artist?: string;
  albumName?: string;
  trackUri?: string;
  msPlayed?: number;
  platform?: string;
  reasonStart?: string;
  reasonEnd?: string;
  skipped?: boolean;
}

export interface PlaceReceipt extends BaseReceipt {
  type: "place";
  venue?: string;
  address?: string;
  mode?: string;
}

export interface PurchaseReceipt extends BaseReceipt {
  type: "purchase";
  merchant?: string;
  amount: number;
  currency?: string;
  category?: string;
  subcategory?: string;
  paymentMode?: string;
  isFraud?: boolean;
}

export interface EventReceipt extends BaseReceipt {
  type: "event";
  eventName?: string;
  attendees?: number;
}

// Union type of all receipt variants
export type Receipt = MusicReceipt | PlaceReceipt | PurchaseReceipt | EventReceipt;

// ============================================================================
// CONNECTION TYPES
// ============================================================================

export type ConnectionType =
  | "temporal"
  | "location"
  | "semantic"
  | "category_chain"
  | "recurrence";

export interface Connection {
  id: string;
  receiptId1: string;
  receiptId2: string;
  type: ConnectionType;
  score: number; // 0-100
  reason: string;
  details: Record<string, string | number>;
  strength: "weak" | "moderate" | "strong";
}

export interface ConnectionsByReceipt {
  [receiptId: string]: Connection[];
}

// ============================================================================
// MOMENT TYPES
// ============================================================================

export interface LifeMoment {
  id: string;
  receipts: Receipt[];
  receiptIds: string[];
  startTime: Date;
  endTime: Date;
  categories: ReceiptType[];
  locations: Location[];
  connections: Connection[];
  title: string;
  summary: string;
  evidence: string[]; // Why this is a moment
  timeSpanMinutes: number;
}

// ============================================================================
// CHAPTER TYPES
// ============================================================================

export interface Chapter {
  id: string;
  number: number;
  title: string;
  description: string;
  moments: LifeMoment[];
  momentIds: string[];
  startDate: Date;
  endDate: Date;
  receipts: Receipt[];
  receiptIds: string[];
  patterns: Pattern[];
  evidence: string[]; // Why this is a chapter
  dominantCategories: ReceiptType[];
  activityLevel: "low" | "moderate" | "high";
}

// ============================================================================
// PATTERN TYPES
// ============================================================================

export interface Pattern {
  id: string;
  type: "recurrence" | "clustering" | "activity_shift" | "location_cluster";
  title: string;
  description: string;
  evidence: string[];
  strength: number; // 0-100
  receipts: Receipt[];
  receiptIds: string[];
}

// ============================================================================
// STORY TYPES
// ============================================================================

export interface Story {
  chapters: Chapter[];
  totalReceipts: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  insights: string[];
}

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

export interface FilterOptions {
  categories?: ReceiptType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  locations?: string[];
  tags?: string[];
  connectedOnly?: boolean;
  momentsOnly?: boolean;
  patternsOnly?: boolean;
}

export interface SearchResult {
  receipts: Receipt[];
  total: number;
  categoryBreakdown: Record<ReceiptType, number>;
  relatedMoments: LifeMoment[];
  relatedConnections: Connection[];
  patterns: Pattern[];
}

// ============================================================================
// VISUALIZATION TYPES
// ============================================================================

export interface GraphNode {
  id: string;
  label: string;
  type: ReceiptType | "moment" | "pattern";
  x?: number;
  y?: number;
  size: number;
  color: string;
  data: Receipt | LifeMoment | Pattern;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  type: ConnectionType;
  label: string;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ============================================================================
// STATE TYPES
// ============================================================================

export interface AppState {
  receipts: Receipt[];
  connections: Connection[];
  moments: LifeMoment[];
  chapters: Chapter[];
  patterns: Pattern[];
  selectedReceipt?: Receipt;
  selectedMoment?: LifeMoment;
  selectedChapter?: Chapter;
  filters: FilterOptions;
  searchQuery: string;
  loading: boolean;
  error?: string;
}

// ============================================================================
// PARSING & NORMALIZATION TYPES
// ============================================================================

export interface ParseResult<T> {
  data: T[];
  errors: ParseError[];
  skipped: number;
  total: number;
}

export interface ParseError {
  row: number;
  error: string;
  rawData?: string;
}

export interface NormalizationOptions {
  deduplicateBy?: (r1: Receipt, r2: Receipt) => boolean;
  validateTimestamps?: boolean;
  fillMissingLocations?: boolean;
}

// ============================================================================
// API/SERVICE TYPES
// ============================================================================

export interface ReceiptService {
  getAllReceipts: () => Promise<Receipt[]>;
  getReceiptById: (id: string) => Promise<Receipt | null>;
  getReceiptsByType: (type: ReceiptType) => Promise<Receipt[]>;
  searchReceipts: (query: string, options?: FilterOptions) => Promise<SearchResult>;
}

export interface ConnectionService {
  detectConnections: (receipts: Receipt[]) => Promise<Connection[]>;
  getConnectionsForReceipt: (receiptId: string) => Promise<Connection[]>;
  scoreConnection: (r1: Receipt, r2: Receipt) => number;
}

export interface MomentService {
  detectMoments: (receipts: Receipt[], connections: Connection[]) => Promise<LifeMoment[]>;
  getMomentForReceipt: (receiptId: string) => Promise<LifeMoment | null>;
}

export interface ChapterService {
  generateChapters: (moments: LifeMoment[]) => Promise<Chapter[]>;
  generateStory: (chapters: Chapter[], receipts: Receipt[]) => Promise<Story>;
}
