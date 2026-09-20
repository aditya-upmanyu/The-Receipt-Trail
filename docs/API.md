# API Reference

## Core Services

### Receipt Service

#### `loadAllReceipts(): Promise<Receipt[]>`

Loads and normalizes all receipt data from multiple sources.

**Returns**: Promise resolving to array of normalized receipts

**Example**:
```typescript
const receipts = await loadAllReceipts();
console.log(`Loaded ${receipts.length} receipts`);
```

#### `buildReceiptIndexes(receipts: Receipt[]): ReceiptIndexes`

Creates optimized indexes for fast lookups.

**Parameters**:
- `receipts`: Array of receipts to index

**Returns**: Object containing 4 indexes (byId, byType, byDate, byLocation)

**Example**:
```typescript
const indexes = buildReceiptIndexes(receipts);
const receipt = indexes.byId.get('receipt-123');
```

#### `searchReceipts(receipts: Receipt[], options: SearchOptions): Receipt[]`

Searches receipts with multiple filters.

**Parameters**:
- `receipts`: Array to search
- `options`: Search options
  - `query?: string` - Search term
  - `categories?: string[]` - Filter by categories
  - `dateRange?: { start: Date; end: Date }` - Date filter
  - `limit?: number` - Max results

**Returns**: Filtered receipts array

**Example**:
```typescript
const results = searchReceipts(receipts, {
  query: 'spotify',
  categories: ['music'],
  dateRange: {
    start: new Date('2023-01-01'),
    end: new Date('2023-12-31')
  },
  limit: 100
});
```

---

## Connection Detection

### `detectConnections(receipts: Receipt[], maxConnections?: number): Connection[]`

Detects meaningful connections between receipts using 6-dimensional scoring.

**Parameters**:
- `receipts`: Receipts to analyze
- `maxConnections`: Maximum connections per receipt (default: 15)

**Returns**: Array of connections with scores

**Scoring Dimensions**:
- Temporal proximity (30%)
- Geospatial overlap (25%)
- Category matching (20%)
- Financial correlation (15%)
- Metadata similarity (5%)
- Type matching (5%)

**Example**:
```typescript
const connections = detectConnections(receipts, 10);
const strongConnections = connections.filter(c => c.score > 0.8);
```

---

## Moment Detection

### `detectMoments(receipts: Receipt[], connections: Connection[]): LifeMoment[]`

Clusters receipts into significant life moments.

**Parameters**:
- `receipts`: Source receipts
- `connections`: Detected connections

**Returns**: Array of life moments

**Example**:
```typescript
const moments = detectMoments(receipts, connections);
moments.forEach(moment => {
  console.log(`${moment.title}: ${moment.receipts.length} receipts`);
});
```

---

## Chapter Generation

### `generateChapters(moments: LifeMoment[], receipts: Receipt[]): Chapter[]`

Generates narrative chapters from moments using pattern recognition.

**Parameters**:
- `moments`: Detected moments
- `receipts`: Full receipt dataset

**Returns**: Array of chapters

**Example**:
```typescript
const chapters = generateChapters(moments, receipts);
console.log(`Generated ${chapters.length} chapters`);
```

---

## Error Logger Service

### `errorLogger.logError(error: Error | string, severity: ErrorSeverity, context?: Record<string, unknown>)`

Logs an error with context.

**Parameters**:
- `error`: Error object or message
- `severity`: LOW | MEDIUM | HIGH | CRITICAL
- `context`: Additional metadata

**Example**:
```typescript
import { errorLogger, ErrorSeverity } from './services/errorLogger.service';

try {
  await riskyOperation();
} catch (error) {
  errorLogger.logError(error, ErrorSeverity.HIGH, {
    operation: 'riskyOperation',
    userId: 'user-123'
  });
}
```

### `errorLogger.getLogs(): ErrorLog[]`

Returns all logged errors.

### `errorLogger.getStats(): Record<ErrorSeverity, number>`

Returns error count by severity.

---

## Performance Service

### `performanceService.measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T>`

Measures execution time of async function.

**Example**:
```typescript
import { performanceService } from './services/performance.service';

const data = await performanceService.measureAsync(
  'fetchData',
  async () => {
    return await fetch('/api/data').then(r => r.json());
  }
);
```

### `performanceService.getSummary()`

Returns performance statistics by operation name.

---

## Types Reference

### Receipt

```typescript
interface Receipt {
  id: string;
  type: 'music' | 'purchase' | 'activity';
  timestamp: string;
  date: Date;
  title: string;
  description?: string;
  amount?: number;
  currency?: string;
  category?: string;
  location?: Location;
  metadata?: Record<string, unknown>;
  source: string;
}
```

### MusicReceipt

```typescript
interface MusicReceipt extends Receipt {
  type: 'music';
  artist: string;
  album?: string;
  duration?: number;
}
```

### PurchaseReceipt

```typescript
interface PurchaseReceipt extends Receipt {
  type: 'purchase';
  merchant?: string;
  amount: number;
  currency: string;
  category: string;
  isFraud?: boolean;
}
```

### Connection

```typescript
interface Connection {
  id: string;
  receiptId1: string;
  receiptId2: string;
  score: number;
  dimensions: {
    temporal: number;
    location: number;
    category: number;
    amount: number;
    metadata: number;
    type: number;
  };
}
```

### LifeMoment

```typescript
interface LifeMoment {
  id: string;
  title: string;
  receipts: Receipt[];
  connections: Connection[];
  startTime: Date;
  endTime: Date;
  dominantCategory: string;
  dominantLocation?: string;
  totalAmount?: number;
  insights: string[];
}
```

### Chapter

```typescript
interface Chapter {
  id: string;
  number: number;
  title: string;
  description: string;
  moments: LifeMoment[];
  startDate: Date;
  endDate: Date;
  receiptCount: number;
  patterns: Pattern[];
  insights: string[];
}
```
