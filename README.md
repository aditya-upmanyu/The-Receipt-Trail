# Your Life, In Receipts

> **A digital life discovery engine that transforms disconnected receipts into an interactive storytelling experience.**

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-24%20passing-success.svg)](./src/tests)
[![Accessibility](https://img.shields.io/badge/a11y-WCAG%202.1-green.svg)](https://www.w3.org/WAI/WCAG21/quickref/)

## 🎯 Overview

**Your Life, In Receipts** is a hackathon project that turns raw digital-life data into a narrative journey. It moves beyond traditional data visualization to create an **immersive archive experience** where users can explore their digital footprint, discover hidden connections, and understand their life story through evidence-based patterns.

### The Challenge

Transform hundreds of disconnected digital receipts (music played, purchases made, places visited) into a cohesive story that reveals:
- **Connections** between seemingly unrelated activities
- **Moments** where multiple activities cluster together
- **Patterns** that emerge over time
- **Chapters** that structure the narrative

## ✨ Key Features

### 1. **Explore Mode** 
Primary data investigation interface with:
- **Real-time search** with 250ms debouncing
- **Multi-category filtering** (Music, Places, Purchases, Events)
- **Responsive grid layout** adapting to all screen sizes
- **Receipt cards** with category-specific styling and metadata

### 2. **Story Mode**
Evidence-based narrative storytelling featuring:
- **Chapters** grouped by time periods and activity patterns
- **Pattern detection** (location clustering, recurrence, activity shifts)
- **Evidence tracking** for every narrative claim
- **Chapter navigation** with progress indicators

### 3. **Connections Graph**
Visual network visualization showing:
- **Moment-based nodes** (not raw data dump)
- **Connection edges** weighted by relationship strength
- **Interactive selection** with context display
- **Performance-optimized** rendering (limited to 30 nodes)

### 4. **Landing Experience**
Immersive entry point with:
- **Animated particle background** (respects `prefers-reduced-motion`)
- **Gradient typography** and smooth transitions
- **Clear call-to-action** to enter the archive

## 🏗️ Architecture

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ErrorBoundary.tsx       # Global error handling
│   ├── ReceiptCard.tsx         # Compact receipt display
│   └── ReceiptDetail.tsx       # Modal with full receipt info
│
├── pages/               # Main application views
│   ├── Landing.tsx             # Entry experience
│   ├── Explore.tsx             # Search & filter interface
│   ├── Story.tsx               # Chapter-based narrative
│   └── Connections.tsx         # Graph visualization
│
├── services/            # Data loading & management
│   └── receiptService.ts       # Dataset loading & indexing
│
├── utils/               # Core business logic
│   ├── parsing.ts              # CSV/JSON parsing & normalization
│   ├── connections.ts          # Relationship detection & scoring
│   ├── moments.ts              # Temporal clustering
│   ├── chapters.ts             # Narrative grouping
│   └── helpers.ts              # Utility functions
│
├── hooks/               # React hooks
│   └── useReceipts.ts          # Global data state management
│
├── types/               # TypeScript definitions
│   └── index.ts                # Discriminated union types
│
├── constants/           # Configuration
│   └── index.ts                # App-wide constants
│
└── tests/               # Test suites
    ├── parsing.test.ts
    ├── connections.test.ts
    ├── moments.test.ts
    └── helpers.test.ts
```

### Data Architecture

#### Type System (Discriminated Unions)

```typescript
type ReceiptType = "music" | "place" | "purchase" | "event";

type Receipt = 
  | MusicReceipt 
  | PlaceReceipt 
  | PurchaseReceipt 
  | EventReceipt;
```

Each receipt type has:
- **Base properties**: `id`, `type`, `timestamp`, `date`, `title`, `description`, `location`, `tags`, `source`
- **Type-specific properties**: e.g., `artist` for music, `amount` for purchases

#### Data Flow

```
Raw Datasets (CSV/JSON)
       ↓
  Parser Layer
       ↓
  Validator
       ↓
  Normalizer
       ↓
  Deduplicator
       ↓
Unified Receipt[]
       ↓
Connection Engine → Connections
       ↓
Moment Detection → LifeMoments
       ↓
Chapter Generation → Chapters
       ↓
    UI Layer
```

## 🔍 Core Engines

### 1. Connection Engine (`utils/connections.ts`)

**Purpose**: Detect relationships between receipts using multiple signals.

**Scoring System**:
```typescript
CONNECTION_WEIGHTS = {
  location: 30,    // Same city/coordinates
  temporal: 25,    // Within 2 hours
  keyword: 20,     // Shared terms
  tag: 15,         // Common tags
  category: 10,    // Related types
  recurrence: 10,  // Repeated patterns
}
```

**Connection Types**:
- `temporal`: Close in time (< 2 hours)
- `location`: Same city or < 5km apart
- `semantic`: Shared keywords/themes
- `category_chain`: Related activity sequence (e.g., music → place → purchase)
- `recurrence`: Repeated patterns

**Performance Optimization**:
- Minimum score threshold (15) to filter weak connections
- Limited to 5000 receipts for O(n²) comparison
- Connection indexing for O(1) lookups

### 2. Moment Detection Engine (`utils/moments.ts`)

**Purpose**: Group temporally-clustered receipts into meaningful moments.

**Algorithm**:
1. Sort receipts by timestamp
2. For each receipt, find all receipts within 180-minute window
3. Check if they're connected (score ≥ 20)
4. Cluster connected receipts into moments
5. Generate evidence-based titles and summaries

**Moment Structure**:
```typescript
{
  receipts: Receipt[];
  startTime: Date;
  endTime: Date;
  connections: Connection[];
  title: string;          // Evidence-based (e.g., "Activity in Mumbai")
  summary: string;        // Neutral description
  evidence: string[];     // Why this is a moment
}
```

### 3. Chapter Generation Engine (`utils/chapters.ts`)

**Purpose**: Group moments into larger narrative chapters.

**Logic**:
- Time-based grouping (30-day windows)
- Minimum 3 moments per chapter
- Pattern detection within chapters:
  - **Location clustering**: Repeated locations (≥5 occurrences)
  - **Recurrence patterns**: Repeated artists/themes
  - **Activity shifts**: Category distribution changes

**Chapter Metadata**:
- Dominant activity categories
- Activity level (low/moderate/high)
- Detected patterns with evidence
- Date range and moment count

## 📊 Datasets

### Three Real Datasets Included:

1. **Spotify Listening History** (`spotify_history.csv`)
   - **~149,000+ records**
   - Fields: track name, artist, album, timestamp, play duration, platform
   - Captures music listening behavior over time

2. **Daily Household Transactions** (`Daily Household Transactions.csv`)
   - **~2,400+ records**
   - Fields: date, category, subcategory, amount, payment mode, notes
   - Personal expense tracking across categories

3. **India Transaction Dataset** (`Augmented_IndiaTransactMultiFacet2024.json`)
   - **~8,000+ records**
   - Fields: merchant, amount, location (city/state/coordinates), category, fraud indicator
   - Commercial transaction data with geographic information

### Data Normalization Pipeline

**Handles**:
- ✅ Multiple date formats (ISO, US, DD/MM/YYYY)
- ✅ Missing/null fields
- ✅ CSV quoted fields and embedded commas
- ✅ Malformed timestamps
- ✅ Duplicate records (by timestamp + title)
- ✅ Invalid amounts or zero-duration tracks

**Process**:
```typescript
parseCSV/JSON → validate → normalize → deduplicate → sort by date
```

## 🎨 Design System

### Color Palette (Dark Theme)

```css
/* Backgrounds */
--bg-darkest:  #05070B
--bg-darker:   #080B12
--bg-dark:     #0D111A

/* Text */
--text-primary:   #E8F1FF
--text-secondary: #94A3B8

/* Accents */
--cyan:   #06B6D4
--blue:   #3B82F6
--purple: #A855F7
--amber:  #FBBF24
--green:  #22C55E
--rose:   #F43F5E
```

### Category Colors

- **Music**: Purple (`#A855F7`)
- **Places**: Green (`#22C55E`)
- **Purchases**: Amber (`#FBBF24`)
- **Events**: Rose (`#F43F5E`)

### Typography

- **Font**: System UI stack (native fonts for performance)
- **Headings**: Bold, tight tracking
- **Body**: Regular weight, 1.5 line height

## 🚀 Performance Optimizations

### 1. **Large Dataset Handling**

- **Problem**: 149K+ Spotify records would overwhelm the UI
- **Solution**:
  - Limit connection detection to 5,000 receipt subset
  - Build indexes (by ID, type, date, location) for O(1) lookups
  - Use memoization for expensive computations
  - Implement pagination/virtualization where needed

### 2. **Search Optimization**

- **Debounced input**: 250ms delay prevents excessive filtering
- **Sanitized queries**: Limited to 100 characters, trimmed
- **Indexed filtering**: Pre-computed category breakdowns

### 3. **Connection Graph**

- **Strategy**: Show moments (30 max), not all receipts
- **Benefit**: Reduces 149K nodes to manageable 30-node graph
- **Trade-off**: Loses granularity but gains clarity

### 4. **React Optimizations**

- `useMemo` for filtered results and statistics
- `useCallback` for event handlers
- Lazy loading for routes (Story, Connections)

## ♿ Accessibility Features

### Keyboard Navigation

- ✅ All interactive elements keyboard-accessible
- ✅ Focus visible on all controls
- ✅ Tab order follows logical flow
- ✅ Escape key closes modals
- ✅ Enter/Space activates buttons

### ARIA Support

- ✅ `role="dialog"` with `aria-modal="true"` on modals
- ✅ `aria-label` on icon-only buttons
- ✅ `aria-labelledby` for dialog titles
- ✅ Focus trap in modals
- ✅ Focus restoration after modal close

### Motion

- ✅ Respects `prefers-reduced-motion`
- ✅ Animations can be disabled via system settings
- ✅ No auto-playing videos or flashing content

### Color

- ✅ Never uses color as sole information carrier
- ✅ Icons + labels for categories
- ✅ Text labels for all data points
- ✅ High contrast ratios (WCAG AA compliant)

## 🧪 Testing

### Test Coverage

**24 tests across 4 suites** — all passing ✅

1. **Parsing Tests** (`parsing.test.ts`)
   - Spotify CSV parsing
   - Household transaction parsing
   - India JSON parsing
   - Deduplication logic
   - Date sorting

2. **Connection Tests** (`connections.test.ts`)
   - Connection scoring algorithm
   - Temporal proximity detection
   - Location matching
   - Connection indexing
   - Graph traversal

3. **Moment Tests** (`moments.test.ts`)
   - Moment detection from connections
   - Clustering algorithm
   - Title generation
   - Evidence tracking

4. **Helper Tests** (`helpers.test.ts`)
   - Date formatting
   - Currency formatting
   - Text truncation
   - Search input sanitization
   - Receipt statistics

### Running Tests

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode
```

## 🛠️ Tech Stack

### Core

- **React 19** - UI framework
- **TypeScript 6** - Type safety with strict mode
- **Vite 8** - Build tool & dev server
- **Tailwind CSS 4** - Utility-first styling

### Libraries

- **Framer Motion** - Animations (Landing page)
- **Lucide React** - Icon system
- **Vitest** - Testing framework
- **React Testing Library** - Component testing

### Tooling

- **ESLint** - Linting with strict rules
- **TypeScript ESLint** - TypeScript-specific rules
- **Netlify** - Deployment platform

## 🔒 Security

### Input Validation

- ✅ Search queries sanitized and length-limited
- ✅ No `eval()` or `Function()` constructors
- ✅ No `dangerouslySetInnerHTML`
- ✅ All external links use safe attributes

### Data Handling

- ✅ Frontend-only (no backend = no server vulnerabilities)
- ✅ No API keys or secrets
- ✅ No user authentication (public demo)
- ✅ Malformed data gracefully skipped

## 📦 Installation & Setup

### Prerequisites

- **Node.js** 18+ 
- **npm** 9+

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Building for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

## 🚢 Deployment

### Netlify Configuration

The project includes `netlify.toml` for seamless deployment:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Deploy Steps

1. **Push to GitHub** (public repository)
2. **Connect to Netlify**
3. **Deploy** (automatic on push)
4. **Verify** in incognito mode

The SPA redirect ensures client-side routing works correctly.

## 📋 Challenge Requirement Mapping

| Requirement | Implementation | Evidence |
|-------------|----------------|----------|
| **Explore receipts** | Explore Mode with search & filters | `src/pages/Explore.tsx` |
| **Search/filter/navigation** | Debounced search, category filters, responsive nav | `src/pages/Explore.tsx`, `src/App.tsx` |
| **Relationship discovery** | Connection Engine with 6 scoring dimensions | `src/utils/connections.ts` |
| **Interactive storytelling** | Story Mode with chapters & patterns | `src/pages/Story.tsx` |
| **Visual digital journey** | Connections graph & moment visualization | `src/pages/Connections.tsx` |
| **Responsive design** | Mobile-first Tailwind layouts (320px-1440px+) | All pages |
| **Accessibility** | Semantic HTML, ARIA, keyboard nav | All components |
| **Security** | Input sanitization, safe rendering | `src/utils/helpers.ts` |
| **Performance** | Memoization, indexing, lazy loading | `src/hooks/useReceipts.ts` |
| **Code Quality** | TypeScript strict, ESLint clean | Zero errors |
| **Testing** | 24 tests with Vitest | `src/tests/` |
| **Deployment** | Netlify-ready with SPA config | `netlify.toml` |

## 🎯 Design Principles

### 1. **Evidence-First**

Every narrative claim is traceable to actual data:
- Moment titles based on location/activity evidence
- Pattern detection shows why patterns exist
- Connection reasons explain relationship scores

### 2. **No Fabrication**

The application does NOT:
- Generate fake AI insights
- Infer emotions or mental states
- Claim personality analysis
- Invent events not in data

### 3. **Progressive Disclosure**

Information hierarchy:
```
Receipt → Connection → Moment → Pattern → Chapter → Story
```

Users can dive deeper at each level.

### 4. **Performance Over Decoration**

- Particles respect `prefers-reduced-motion`
- Graph shows 30 moments, not 149K records
- Animations are purposeful, not gratuitous

## 🐛 Known Limitations

1. **Date Format Assumptions**: Parser expects specific formats; exotic formats may fail
2. **Location Matching**: Uses simple string comparison; doesn't handle aliases
3. **Graph Scalability**: Limited to 30 nodes for visual clarity
4. **No Persistence**: State resets on page reload (by design - demo app)
5. **Timezone Handling**: Timestamps assumed to be consistent timezone

## 🔮 Future Improvements

### Data & Intelligence

- [ ] Add more receipt types (photos, messages, searches)
- [ ] Implement semantic analysis (NLP for description matching)
- [ ] Multi-dataset cross-referencing
- [ ] User-generated tags and annotations

### Visualization

- [ ] Timeline view with density visualization
- [ ] Heat maps for location activity
- [ ] Network graph with force-directed layout
- [ ] 3D temporal visualization

### Interaction

- [ ] Receipt bookmarking and collections
- [ ] Custom moment creation
- [ ] Story export (PDF, markdown)
- [ ] Share individual chapters

### Technical

- [ ] IndexedDB for client-side caching
- [ ] Web Workers for heavy computation
- [ ] Virtual scrolling for large lists
- [ ] PWA support for offline use

## 📄 License

This project was created for a hackathon challenge. Datasets are provided for demonstration purposes only.

## 🙏 Acknowledgments

- **Challenge organizers** for the creative prompt
- **Spotify** for API data format inspiration
- **Tailwind CSS** for rapid styling
- **React community** for excellent tooling

---

**Built with ❤️ for the "Your Life, In Receipts" hackathon challenge**

*Transform your digital footprint into a story worth exploring.*
