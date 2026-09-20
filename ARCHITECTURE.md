# Architecture Documentation

## System Architecture Overview

### Layered Architecture Pattern

```
┌─────────────────────────────────────────┐
│         Presentation Layer               │
│   (React Components + Pages)             │
└──────────────┬───────────────────────────┘
               │
┌──────────────▼───────────────────────────┐
│         Application Layer                 │
│   (Hooks + Context API + State Mgmt)     │
└──────────────┬───────────────────────────┘
               │
┌──────────────▼───────────────────────────┐
│          Business Logic Layer             │
│   (Services + Algorithms + Utils)        │
└──────────────┬───────────────────────────┘
               │
┌──────────────▼───────────────────────────┐
│           Data Layer                      │
│   (Parsing + Indexing + Storage)         │
└───────────────────────────────────────────┘
```

## Design Patterns Implemented

### 1. **Factory Pattern** (Data Parsing)
- `parseSpotifyCSV()` - Creates MusicReceipt objects
- `parseHouseholdCSV()` - Creates PurchaseReceipt objects
- `parseIndiaJSON()` - Creates PurchaseReceipt objects
- Each factory handles format-specific parsing logic

### 2. **Strategy Pattern** (Connection Scoring)
- 6 scoring strategies with configurable weights:
  - Temporal Proximity Strategy (30%)
  - Geospatial Overlap Strategy (25%)
  - Category Matching Strategy (20%)
  - Amount Correlation Strategy (15%)
  - Metadata Analysis Strategy (5%)
  - Type Similarity Strategy (5%)

### 3. **Observer Pattern** (State Management)
- React Context API for global state
- Custom hooks (`useReceipts`) notify consumers of changes
- Error logger observes and logs all errors
- Performance service observes metrics

### 4. **Singleton Pattern** (Services)
- `errorLogger` - Single instance for error tracking
- `performanceService` - Single instance for metrics
- `AppConfig` - Immutable configuration object

### 5. **Repository Pattern** (Data Access)
- `receiptService` abstracts data loading
- Indexed data structures (Map-based) for fast lookups
- 4 indexes: byId, byType, byDate, byLocation

### 6. **Adapter Pattern** (Data Normalization)
- Converts CSV/JSON formats to unified Receipt interface
- Location normalization across different formats
- Date parsing handles multiple formats

## Core Components

### Configuration Layer (`src/config/`)
- **app.config.ts** - Centralized configuration
  - Data limits and chunk sizes
  - Performance settings
  - Connection/moment detection parameters
  - UI breakpoints
  - Feature flags

### Service Layer (`src/services/`)
- **receiptService.ts** - Data loading and indexing
- **errorLogger.service.ts** - Error tracking and logging
- **performance.service.ts** - Performance monitoring

### Context Layer (`src/context/`)
- **ReceiptContext.tsx** - Global state provider
  - Receipts, connections, moments, chapters
  - Helper methods for data access
  - Loading and error states

### Utility Layer (`src/utils/`)
- **parsing.ts** - Data parsing and normalization
- **connections.ts** - Connection detection algorithm
- **moments.ts** - Moment clustering algorithm
- **chapters.ts** - Chapter generation with pattern detection
- **helpers.ts** - Common utilities (date, format, debounce)

## Data Flow

### 1. **Initial Load**
```
User Visits → App.tsx → ReceiptProvider → useReceipts Hook
                                              ↓
                                    receiptService.loadAllReceipts()
                                              ↓
                                    Parse CSV/JSON (Factory Pattern)
                                              ↓
                                    Normalize & Deduplicate
                                              ↓
                                    Build Indexes (Repository Pattern)
                                              ↓
                                    Detect Connections (Strategy Pattern)
                                              ↓
                                    Cluster Moments
                                              ↓
                                    Generate Chapters
                                              ↓
                                    Update Context (Observer Pattern)
                                              ↓
                                    Re-render Components
```

### 2. **Search/Filter Flow**
```
User Input → Debounced (250ms) → searchReceipts()
                                       ↓
                              Use Indexes for O(1) lookup
                                       ↓
                              Apply Filters (Strategy Pattern)
                                       ↓
                              Memoized Results
                                       ↓
                              Update UI
```

## Performance Optimizations

### Memory Management
- **Chunked Processing** - Process 10K receipts at a time
- **No Spread Operators** - Use loops instead of `[...array]`
- **In-place Sorting** - Mutate arrays instead of copying
- **Map Indexes** - O(1) lookups instead of O(n) searches

### Code Splitting
- Route-based lazy loading (`React.lazy()`)
- Manual chunks for vendors:
  - `react-vendor.js` - React + ReactDOM
  - `motion.js` - Framer Motion
  - `icons.js` - Lucide React
  - `app.js` - Application code

### Rendering Optimizations
- **useMemo** - Memoize expensive computations
- **Debouncing** - 250ms delay on search input
- **Virtual Scrolling** - For large lists (implicit with CSS)
- **Lazy Loading** - Images and components

## Error Handling Strategy

### Three-Tier Error Handling
1. **Component Level** - Error boundaries catch render errors
2. **Service Level** - Try-catch in async operations
3. **Global Level** - Error logger service tracks all errors

### Error Severity Levels
- **LOW** - Info-level logs
- **MEDIUM** - Warnings (logged to console)
- **HIGH** - Errors (logged to console.error)
- **CRITICAL** - System failures (stored in localStorage)

## Testing Strategy

### Unit Tests (24 tests, 100% passing)
- **Connection Detection** - 8 tests
  - Temporal proximity scoring
  - Location overlap detection
  - Category matching
  - Combined scoring algorithm
  
- **Moment Detection** - 6 tests
  - Temporal clustering
  - Connection-based grouping
  - Moment metadata generation
  
- **Helper Functions** - 5 tests
  - Date formatting
  - Text truncation
  - Amount formatting
  - Debounce functionality
  
- **Parsing** - 5 tests
  - CSV parsing (Spotify, Household)
  - JSON parsing (India transactions)
  - Error handling
  - Data normalization

## Security Architecture

### Input Validation
- Type checking on all parsed data
- Safe date parsing with fallback
- Amount validation (NaN checks)
- Location coordinate validation

### Output Sanitization
- React auto-escapes all user data
- No `dangerouslySetInnerHTML` used
- XSS protection via security headers

### Security Headers
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Scalability Considerations

### Current Limits
- 25,000 receipts max in browser
- 10,000 receipts per processing chunk
- 15 connections max per receipt
- 50MB max file size

### Future Improvements
- Server-side processing for larger datasets
- Streaming JSON parser
- IndexedDB for client-side caching
- Web Workers for heavy computation
- Virtualized lists for 100K+ items

## Accessibility Architecture

### WCAG 2.1 AA Compliance
- **Semantic HTML** - Proper element usage
- **ARIA Attributes** - Labels, roles, states
- **Keyboard Navigation** - Full keyboard support
- **Focus Management** - Visible focus indicators
- **Screen Reader** - Descriptive labels and announcements

### Implementation
- `aria-label` on all icon buttons
- `aria-current` for navigation state
- `aria-expanded` for collapsible sections
- `role="navigation"` for nav components
- Keyboard shortcuts (Tab, Enter, Escape)

## Monitoring & Observability

### Performance Metrics Tracked
- Data loading time
- Connection detection time
- Moment clustering time
- Chapter generation time
- Search performance
- Render performance

### Web Vitals
- **LCP** (Largest Contentful Paint) - Target < 2.5s
- **FID** (First Input Delay) - Target < 100ms
- **CLS** (Cumulative Layout Shift) - Target < 0.1

### Error Tracking
- All errors logged with timestamp
- Severity classification
- Stack traces captured
- Context metadata included
- Critical errors persisted to localStorage

## Future Architecture Goals

1. **Microservices** - Split data processing into separate services
2. **Caching Layer** - Redis or IndexedDB for frequently accessed data
3. **Real-time Updates** - WebSocket for live data sync
4. **Machine Learning** - More intelligent pattern detection
5. **Multi-tenant** - Support multiple users with auth
