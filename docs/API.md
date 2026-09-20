# API Reference

This document provides comprehensive reference for all public APIs, services, hooks, and utilities in the Web Rush project.

## Table of Contents

- [Core Services](#core-services)
- [Custom Hooks](#custom-hooks)
- [Utilities](#utilities)
- [Types Reference](#types-reference)
- [Error Handling](#error-handling)
- [Performance Monitoring](#performance-monitoring)

---

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

## Custom Hooks

### `useReceipts()`

Main data hook providing receipts, connections, moments, and chapters.

**Returns**:
```typescript
{
  receipts: Receipt[];
  connections: Connection[];
  moments: LifeMoment[];
  chapters: Chapter[];
  indexes: ReceiptIndexes;
  loading: boolean;
  error: string | null;
}
```

**Example**:
```typescript
import { useReceipts } from './hooks/useReceipts';

function MyComponent() {
  const { receipts, moments, loading, error } = useReceipts();
  
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;
  
  return <div>{receipts.length} receipts loaded</div>;
}
```

### `useInsights(receipts: Receipt[], moments: LifeMoment[])`

Calculates life insights from receipts and moments.

**Parameters**:
- `receipts`: Receipt array
- `moments`: LifeMoment array

**Returns**: `LifeInsightsReport | null`

**Example**:
```typescript
import { useInsights } from './hooks/useInsights';

function InsightsPanel() {
  const { receipts, moments } = useReceipts();
  const insights = useInsights(receipts, moments);
  
  if (!insights) return null;
  
  return (
    <div>
      <h2>Most Active: {insights.activeTime.dominantTimeOfDay}</h2>
      <p>Peak Hour: {insights.activeTime.peakHourLabel}</p>
    </div>
  );
}
```

### `useFavorites()`

Manages favorite receipts with localStorage persistence.

**Returns**:
```typescript
{
  favoriteIds: Set<string>;
  favoritesCount: number;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  clearFavorites: () => void;
}
```

**Example**:
```typescript
import { useFavorites } from './hooks/useFavorites';

function ReceiptCard({ receipt }: { receipt: Receipt }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  
  return (
    <div>
      <h3>{receipt.title}</h3>
      <button onClick={() => toggleFavorite(receipt.id)}>
        {isFavorite(receipt.id) ? 'Unfavorite' : 'Favorite'}
      </button>
    </div>
  );
}
```

---

## Utilities

### Insights Engine

#### `generateLifeInsightsReport(receipts: Receipt[], moments: LifeMoment[]): LifeInsightsReport`

Generates comprehensive insights report.

**Returns**: `LifeInsightsReport` containing:
- `activeTime`: Time-of-day patterns
- `categories`: Category distribution
- `recurring`: Recurring artists, locations, merchants
- `busiestPeriods`: Top 10 busiest days
- `streaks`: Activity streak analysis
- `crossCategoryPatterns`: Multi-category patterns

**Example**:
```typescript
import { generateLifeInsightsReport } from './utils/insights';

const report = generateLifeInsightsReport(receipts, moments);

console.log(`Peak activity: ${report.activeTime.dominantTimeOfDay}`);
console.log(`Longest streak: ${report.streaks.longestStreakDays} days`);
```

#### `calculateActiveTimeInsight(receipts: Receipt[]): ActiveTimeInsight`

Analyzes time-of-day activity patterns.

#### `calculateCategoryInsight(receipts: Receipt[]): CategoryInsight`

Calculates category distribution and percentages.

#### `calculateRecurringInsights(receipts: Receipt[]): RecurringInsights`

Identifies recurring artists, locations, and merchants.

#### `calculateBusiestPeriods(receipts: Receipt[]): BusiestPeriod[]`

Finds top 10 busiest days with event counts.

#### `calculateStreaks(receipts: Receipt[]): StreakInsight`

Calculates longest and current activity streaks.

#### `calculateCrossCategoryPatterns(receipts: Receipt[], moments: LifeMoment[]): CrossCategoryPattern[]`

Detects meaningful multi-category patterns.

### Helper Functions

#### `formatDate(date: Date): string`

Formats date as "MMM DD, YYYY" (e.g., "Jan 15, 2024").

#### `formatTime(date: Date): string`

Formats time as "HH:MM AM/PM" (e.g., "3:45 PM").

#### `formatCurrency(amount: number, currency?: string): string`

Formats amount as currency (e.g., "₹1,234.56" or "$1,234.56").

#### `formatDuration(ms: number): string`

Formats milliseconds as human-readable duration (e.g., "3h 45m").

#### `truncateText(text: string, maxLength: number): string`

Truncates text with ellipsis if exceeds maxLength.

**Example**:
```typescript
import { formatDate, formatCurrency, formatDuration } from './utils/helpers';

const formatted = {
  date: formatDate(new Date()),
  price: formatCurrency(1234.56, 'USD'),
  duration: formatDuration(135000) // "2m 15s"
};
```

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


---

## Life Insights Types

### ActiveTimeInsight

```typescript
interface ActiveTimeInsight {
  peakHour: number; // 0-23
  peakHourLabel: string; // e.g. "8:00 PM - 9:00 PM"
  peakHourCount: number;
  timeOfDay: {
    morning: number; // 06:00 - 11:59
    afternoon: number; // 12:00 - 16:59
    evening: number; // 17:00 - 21:59
    night: number; // 22:00 - 05:59
  };
  dominantTimeOfDay: "Morning" | "Afternoon" | "Evening" | "Night";
  peakDayOfWeek: string;
  dayOfWeekCounts: Record<string, number>;
  evidence: string[];
}
```

### CategoryInsight

```typescript
interface CategoryInsight {
  dominantCategory: ReceiptType;
  counts: Record<ReceiptType, number>;
  percentages: Record<ReceiptType, number>;
  evidence: string[];
}
```

### RecurringInsights

```typescript
interface RecurringInsights {
  artists: RecurringEntity[];
  locations: RecurringEntity[];
  merchants: RecurringEntity[];
  evidence: string[];
}

interface RecurringEntity {
  name: string;
  count: number;
  category: ReceiptType;
  firstSeen: Date;
  lastSeen: Date;
  details?: string;
}
```

### BusiestPeriod

```typescript
interface BusiestPeriod {
  date: string; // YYYY-MM-DD
  formattedDate: string;
  eventCount: number;
  categories: ReceiptType[];
  sampleTitles: string[];
  evidence: string[];
}
```

### StreakInsight

```typescript
interface StreakInsight {
  longestStreakDays: number;
  streakStartDate: string;
  streakEndDate: string;
  currentStreakDays: number;
  totalActiveDays: number;
  evidence: string[];
}
```

### CrossCategoryPattern

```typescript
interface CrossCategoryPattern {
  id: string;
  title: string;
  description: string;
  categoriesInvolved: ReceiptType[];
  occurrences: number;
  confidenceScore: number; // 0-100
  evidence: string[];
}
```

### LifeInsightsReport

```typescript
interface LifeInsightsReport {
  totalReceipts: number;
  totalMoments: number;
  activeTime: ActiveTimeInsight;
  categories: CategoryInsight;
  recurring: RecurringInsights;
  busiestPeriods: BusiestPeriod[];
  streaks: StreakInsight;
  crossCategoryPatterns: CrossCategoryPattern[];
}
```

---

## Error Handling

### ErrorSeverity Enum

```typescript
enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}
```

### ErrorLog Interface

```typescript
interface ErrorLog {
  id: string;
  timestamp: Date;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}
```

### Usage Example

```typescript
import { errorLogger, ErrorSeverity } from './services/errorLogger.service';

try {
  const data = await fetchData();
} catch (error) {
  errorLogger.logError(error as Error, ErrorSeverity.HIGH, {
    operation: 'fetchData',
    attemptCount: 3,
    userId: 'user-123'
  });
  
  // Get recent errors
  const recentErrors = errorLogger.getLogs().slice(-10);
  
  // Get error statistics
  const stats = errorLogger.getStats();
  console.log(`Critical errors: ${stats[ErrorSeverity.CRITICAL]}`);
}
```

---

## Performance Monitoring

### PerformanceMetric Interface

```typescript
interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}
```

### Performance Service API

#### `startMeasure(name: string): void`

Starts a performance measurement.

#### `endMeasure(name: string, metadata?: Record<string, unknown>): number`

Ends measurement and returns duration in milliseconds.

#### `measureAsync<T>(name: string, fn: () => Promise<T>, metadata?): Promise<T>`

Measures async function execution time.

#### `measure<T>(name: string, fn: () => T, metadata?): T`

Measures synchronous function execution time.

#### `getMetrics(): PerformanceMetric[]`

Returns all recorded metrics.

#### `getSummary(): Record<string, { count: number; avg: number; max: number; min: number }>`

Returns aggregated performance statistics.

#### `getSlowestOperations(limit?: number): PerformanceMetric[]`

Returns slowest operations (default: top 10).

### Usage Example

```typescript
import { performanceService } from './services/performance.service';

// Measure async operation
const data = await performanceService.measureAsync(
  'loadReceipts',
  async () => await loadAllReceipts(),
  { source: 'initialLoad' }
);

// Measure sync operation
const filtered = performanceService.measure(
  'filterReceipts',
  () => receipts.filter(r => r.type === 'music'),
  { filterType: 'music' }
);

// Get performance report
const summary = performanceService.getSummary();
console.log('Load Receipts Avg:', summary['loadReceipts'].avg + 'ms');

// Find slowest operations
const slowest = performanceService.getSlowestOperations(5);
slowest.forEach(metric => {
  console.log(`${metric.name}: ${metric.duration.toFixed(2)}ms`);
});
```

---

## Component Props

### LoadingScreen Props

```typescript
interface LoadingScreenProps {
  message?: string; // Default: "Loading your receipts..."
}
```

### ErrorScreen Props

```typescript
interface ErrorScreenProps {
  message?: string; // Default: "Something went wrong"
  onRetry?: () => void; // Optional retry handler
}
```

### LifeRecapModal Props

```typescript
interface LifeRecapModalProps {
  receipts: Receipt[];
  moments: LifeMoment[];
  isOpen: boolean;
  onClose: () => void;
}
```

### PatternInsights Props

```typescript
interface PatternInsightsProps {
  receipts: Receipt[];
  moments: LifeMoment[];
}
```

### ConnectedMemories Props

```typescript
interface ConnectedMemoriesProps {
  receipt: Receipt;
  allReceipts: Receipt[];
  allConnections: Connection[];
  allMoments: LifeMoment[];
}
```

---

## Constants

### Receipt Types

```typescript
type ReceiptType = 'music' | 'purchase' | 'activity';
```

### Category Colors

```typescript
const CATEGORY_COLORS: Record<ReceiptType, string> = {
  music: '#3b82f6',      // blue
  purchase: '#10b981',   // green
  activity: '#f59e0b',   // amber
};
```

### Connection Score Thresholds

```typescript
const CONNECTION_THRESHOLDS = {
  STRONG: 0.8,   // Strong connection
  MEDIUM: 0.6,   // Medium connection
  WEAK: 0.4,     // Weak connection
};
```

### Time of Day Ranges

```typescript
const TIME_RANGES = {
  MORNING: { start: 6, end: 12 },
  AFTERNOON: { start: 12, end: 17 },
  EVENING: { start: 17, end: 22 },
  NIGHT: { start: 22, end: 6 },
};
```

---

## Routing

### Available Routes

```typescript
const routes = [
  { path: '/', component: Landing },
  { path: '/explore', component: Explore },
  { path: '/timeline', component: Timeline },
  { path: '/story', component: Story },
  { path: '/connections', component: Connections },
  { path: '/receipt/:id', component: ReceiptDetail }
];
```

### Navigation Example

```typescript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleExplore = () => {
    navigate('/explore');
  };
  
  const viewReceipt = (id: string) => {
    navigate(`/receipt/${id}`);
  };
  
  return <button onClick={handleExplore}>Explore</button>;
}
```

---

## Build & Configuration

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['./src/utils/parsing.ts', './src/utils/connections.ts']
        }
      }
    }
  }
});
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ESNext",
    "module": "ESNext",
    "jsx": "react-jsx",
    "moduleResolution": "bundler"
  }
}
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm test -- --coverage
```

### Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate, formatCurrency } from './utils/helpers';

describe('Helper Functions', () => {
  it('formats dates correctly', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('Jan 15, 2024');
  });
  
  it('formats currency correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
    expect(formatCurrency(1234.56, 'INR')).toBe('₹1,234.56');
  });
});
```

---

## License

MIT License - see [LICENSE](../LICENSE) for details.
