# 🧾 YOUR LIFE, IN RECEIPTS

## Enhanced Production Build Prompt — Hackathon Evaluation Edition

---

# 0. ROLE

You are a senior frontend engineer, TypeScript architect, data-visualization engineer, interaction designer, UX designer, accessibility engineer, and hackathon product engineer.

Your task is to **finish and productionize the existing project** for the hackathon challenge:

> **Your Life, In Receipts**

You are NOT being asked to create a concept, wireframe, mockup, or explanation.

You must inspect the existing repository and then **implement the complete working application**.

The final application must be:

* visually distinctive
* data-driven
* genuinely interactive
* evidence-based
* responsive
* accessible
* performant
* secure
* TypeScript strict
* ESLint-clean
* testable
* GitHub-ready
* Netlify-ready
* deployable without manual code modifications

The application must feel like a **digital-life discovery experience**, not a generic dashboard.

---

# 1. NON-NEGOTIABLE RULE

## DO NOT BUILD A RECEIPT VIEWER.

Build:

> **A LIFE-STORY DISCOVERY ENGINE**

The core transformation must be:

```text
RAW DATA
   ↓
INFORMATION
   ↓
CONNECTIONS
   ↓
MOMENTS
   ↓
PATTERNS
   ↓
CHAPTERS
   ↓
STORY
```

The user should be able to start with one receipt and progressively discover:

```text
Receipt
   ↓
Related Receipt
   ↓
Connection
   ↓
Moment
   ↓
Pattern
   ↓
Chapter
   ↓
Life Story
```

---

# 2. OFFICIAL CHALLENGE

## Your Life, In Receipts

A digital life consists of hundreds of tiny moments:

* a song played at 2 AM
* a place visited
* a photo captured
* something purchased
* a movie watched
* a message saved
* a search performed
* an event attended
* a personal note written

Individually, these records may appear meaningless.

Together, they can reveal a story.

The challenge is to transform disconnected digital-life receipts into an experience that allows users to:

> **Explore → Connect → Discover → Understand → Feel the Story**

The application must move beyond:

```text
Raw Data → Information
```

towards:

```text
Raw Data → Insights → Connections → Story
```

---

# 3. OFFICIAL MINIMUM REQUIREMENTS

The final application MUST provide:

### 1. Explore

A meaningful way to explore the provided receipts.

### 2. Search / Filter / Navigation

Users must be able to find relevant records efficiently.

### 3. Relationship Discovery

At least one meaningful mechanism must identify relationships or patterns.

### 4. Interactive Storytelling

The user must be able to experience the data as a story rather than only records.

### 5. Visual Digital Journey

The application must visually communicate relationships, activity, moments, or chapters.

### 6. Responsive Design

The complete experience must work across desktop, tablet, and mobile.

Do not merely satisfy these mechanically.

Make each requirement part of one connected product experience.

---

# 4. EVALUATION RUBRIC — OPTIMIZE FOR THIS

The application will be evaluated on:

## Code Quality

* clean component structure
* TypeScript strictness
* zero ESLint errors

## Security

* safe dependencies
* input sanitization
* protection against common web vulnerabilities

## Efficiency

* fast First Contentful Paint
* minimal layout shifts
* lightweight bundle
* efficient data processing

## Accessibility

* semantic HTML
* ARIA compliance
* keyboard navigation

## Functional Challenge Requirements

* exploration
* meaningful filtering/search/navigation
* relationship discovery
* interactive storytelling
* visual journey
* responsive design

## Deployment

GitHub repository:

* public
* accessible without authentication

Deployment:

* live
* HTTPS
* works in incognito

There are a maximum of:

> **3 evaluation attempts**

Therefore, do not leave obvious bugs for the evaluator to discover.

---

# 5. CRITICAL: REAL DATASETS ARE AVAILABLE

The actual datasets are located at:

```text
/home/claude/life-in-receipts/public/data/
```

Available files:

```text
spotify_history.csv
Daily Household Transactions.csv
Augmented_IndiaTransactMultiFacet2024.json
```

Approximate sizes:

```text
Spotify:
149K+ records

Daily Household Transactions:
2.4K+ records

India Transaction Dataset:
8K+ records
```

These are the REAL organizer-provided datasets.

## ABSOLUTE RULE

DO NOT replace them with fake data.

DO NOT generate fake records to make the UI look populated.

DO NOT hardcode fake insights.

DO NOT fabricate personal history.

The application must derive its experience from the actual datasets.

---

# 6. FIRST ACTION — INSPECT BEFORE CODING

Before changing code:

1. inspect the repository
2. inspect package.json
3. inspect tsconfig
4. inspect Tailwind configuration
5. inspect existing components
6. inspect existing types
7. inspect receiptService
8. inspect connection engine
9. inspect moment detection
10. inspect hooks
11. inspect Explore page
12. inspect all three datasets
13. determine actual CSV/JSON schemas
14. identify timestamp fields
15. identify categorical fields
16. identify location information
17. identify useful metadata
18. identify missing/null patterns
19. identify duplicate records
20. identify data volume

Do NOT assume the dataset schema from filenames.

Adapt the normalization layer to the actual files.

---

# 7. EXISTING PROJECT STATE

The project is already initialized with:

```text
Vite
React
TypeScript
Tailwind CSS
```

Existing pieces include:

```text
src/types/index.ts
src/services/receiptService.ts
src/utils/connections.ts
src/utils/moments.ts
src/hooks/useReceipts.ts
src/components/Layout.tsx
src/components/ReceiptCard.tsx
src/utils/helpers.ts
src/pages/Explore.tsx
```

Some implementation is incomplete.

Expected remaining work includes:

* TypeScript fixes
* complete Explore
* receipt detail modal
* Story / Chapters
* Connections graph
* Error Boundary
* testing
* responsive polish
* accessibility
* performance optimization
* Netlify configuration
* README
* final verification

Do NOT blindly rewrite working code.

First understand what already exists.

Reuse good existing architecture.

Refactor only where necessary.

---

# 8. DATA ARCHITECTURE

Create a strongly typed normalized data model.

Use discriminated unions.

Example:

```ts
type ReceiptType =
  | "music"
  | "movie"
  | "place"
  | "purchase"
  | "photo"
  | "message"
  | "search"
  | "event"
  | "note";
```

Base:

```ts
interface BaseReceipt {
  id: string;
  type: ReceiptType;
  timestamp: string;
  title?: string;
  description?: string;
  location?: Location;
  tags?: string[];
}
```

Category-specific models:

```text
MusicReceipt
MovieReceipt
PlaceReceipt
PurchaseReceipt
PhotoReceipt
MessageReceipt
SearchReceipt
EventReceipt
NoteReceipt
```

Use:

```ts
type Receipt =
  | MusicReceipt
  | MovieReceipt
  | PlaceReceipt
  | PurchaseReceipt
  | PhotoReceipt
  | MessageReceipt
  | SearchReceipt
  | EventReceipt
  | NoteReceipt;
```

Do NOT use `any` unless absolutely unavoidable.

---

# 9. DATA NORMALIZATION

Create a robust normalization pipeline:

```text
Raw Dataset
    ↓
Parser
    ↓
Validator
    ↓
Normalizer
    ↓
Deduplicator
    ↓
Timestamp Normalizer
    ↓
Unified Receipt[]
    ↓
Connection Engine
```

Handle:

* missing fields
* null
* undefined
* empty strings
* malformed timestamps
* missing locations
* malformed rows
* unexpected values
* duplicate IDs
* quoted CSV fields
* commas inside CSV values
* JSON inconsistencies

Malformed records should NOT crash the application.

Skip invalid records gracefully while tracking useful diagnostics in development.

---

# 10. DATA VOLUME / PERFORMANCE

The Spotify dataset alone contains 149K+ records.

DO NOT render 149K DOM elements.

DO NOT calculate every connection against every record.

Avoid:

```text
O(n²)
```

relationship processing across the entire dataset where possible.

Use indexing strategies.

Create indexes such as:

```text
timestamp index
date index
category index
location index
keyword/tag index
```

Use:

* memoization
* precomputed derived structures
* efficient grouping
* lazy computation
* pagination or virtualization where appropriate
* debounced search

The UI should remain responsive.

---

# 11. DATA PROCESSING STRATEGY

For large datasets:

### Global data

Keep the normalized data available.

### Derived data

Calculate expensive structures once and memoize them.

### Explore

Use filtered subsets.

### Graph

DO NOT put every Spotify record into the graph.

Instead create a meaningful graph subset containing:

* important receipts
* moments
* representative nodes
* strongly connected records
* recurring entities

The graph must communicate relationships, not dump the entire database onto the screen.

---

# 12. CONNECTION ENGINE

Create or improve:

```text
src/utils/connections.ts
```

Connections MUST be derived from real data.

Never hardcode fake relationships.

Connection types:

### TEMPORAL

Records occurring close together.

Example:

```text
19:05 Music
19:28 Place
20:02 Purchase
20:15 Photo
21:00 Event
```

### LOCATION

Shared:

* location
* venue
* city
* coordinates
* normalized location name

### SEMANTIC / THEMATIC

Shared:

* keywords
* tags
* titles
* search terms
* topics

Use neutral language.

Never infer emotions or personality without evidence.

### CATEGORY CHAIN

Examples:

```text
Music → Place → Purchase
```

```text
Search → Note → Event
```

### RECURRENCE

Repeated:

* locations
* artists
* topics
* categories
* activity periods

---

# 13. CONNECTION SCORING

Use a transparent scoring model.

Example:

```text
same location        +30
close timestamp      +25
shared keyword       +20
shared tag           +15
related category     +10
recurrence           +10
```

Normalize:

```text
0 → 100
```

Use constants rather than unexplained magic numbers.

Example:

```ts
const CONNECTION_WEIGHTS = {
  location: 30,
  temporal: 25,
  keyword: 20,
  tag: 15,
  category: 10,
  recurrence: 10,
} as const;
```

The score should determine whether a relationship is strong enough to expose.

Do not show every weak relationship.

---

# 14. MOMENT ENGINE

Implement:

```text
detectMoments()
```

A Moment is a group of receipts that form a meaningful local cluster.

Example:

```text
Music
   ↓
Place
   ↓
Purchase
   ↓
Photo
   ↓
Event
```

A moment should contain:

```ts
interface LifeMoment {
  id: string;
  receipts: Receipt[];
  startTime: string;
  endTime: string;
  categories: ReceiptType[];
  locations: Location[];
  connections: Connection[];
  title: string;
  summary: string;
}
```

Titles must be evidence-based.

Good:

> "An Evening Around Connaught Place"

if location evidence supports it.

Good:

> "A Cluster of Evening Activity"

if only temporal evidence exists.

Bad:

> "A Romantic Evening"

unless explicit dataset evidence supports such a statement.

---

# 15. CHAPTER ENGINE

Group moments into larger chapters.

Possible signals:

* time periods
* activity density
* dominant categories
* recurring locations
* repeated topics
* significant clusters
* changes in activity distribution

Do not invent life events.

Instead of:

> "The user started a new career."

Use:

> "Career-related searches and notes become more frequent during this period."

Every chapter should expose its evidence.

---

# 16. STORY ENGINE

Story Mode should answer four questions:

## WHAT HAPPENED?

Show actual receipts.

## WHAT CONNECTS THEM?

Explain actual relationship signals.

## WHAT PATTERN APPEARS?

Show recurrence or change.

## WHAT CAN WE OBSERVE?

Give a neutral evidence-based interpretation.

Use labels such as:

```text
DATA
CONNECTION
PATTERN
OBSERVATION
```

This prevents fabricated storytelling.

---

# 17. IMPORTANT — DO NOT MAKE PSYCHOLOGICAL CLAIMS

Never infer:

* emotions
* mental health
* personality
* intentions
* motivations
* relationships
* private circumstances

from weak evidence.

Do not say:

> "The user was anxious."

Say:

> "Search activity around this topic increased during this period."

Do not say:

> "The user was lonely."

Say:

> "Messaging activity appears lower during this period."

The application is a data story, not a psychological profiler.

---

# 18. PRODUCT EXPERIENCE

The experience must feel like:

```text
Digital Memory Archive
+
Interactive Documentary
+
Data Visualization
+
Personal Museum
+
Memory Map
```

It should NOT feel like:

```text
Admin Dashboard
Analytics SaaS
Spreadsheet
CRUD Application
Database Viewer
```

---

# 19. VISUAL IDENTITY

Theme:

> **DIGITAL MEMORY / DARK ARCHIVE**

Foundation:

```text
#05070B
#080B12
#0D111A
```

Text:

```text
#E8F1FF
#94A3B8
```

Accent:

```text
Cyan
Electric Blue
```

Supporting accents:

```text
Amber
Violet
Rose
Green
```

Use accent colors intentionally.

Do not create rainbow UI.

---

# 20. RECEIPT CATEGORY VISUAL LANGUAGE

Suggested:

```text
Music       → Purple
Movie       → Pink
Place       → Green
Purchase    → Amber
Photo       → Blue
Message     → Cyan
Search      → Orange
Event       → Rose
Note        → Lime
```

But never communicate meaning exclusively through color.

Use:

* icons
* labels
* text
* shapes
* patterns

as supporting signals.

---

# 21. LANDING EXPERIENCE

Create an immersive entry screen.

Primary copy:

```text
YOUR LIFE,
IN RECEIPTS.

Hundreds of moments.
One story waiting to be discovered.
```

Primary CTA:

```text
ENTER THE ARCHIVE
```

Secondary:

```text
DISCOVER THE STORY
```

Background:

* subtle data particles
* timestamp fragments
* category signals
* faint connections
* receipt metadata
* constellation-like movement

Do NOT sacrifice performance for effects.

Respect:

```css
prefers-reduced-motion
```

---

# 22. GLOBAL NAVIGATION

Use:

```text
LIFE ARCHIVE

Explore
Story
Connections

Search
Filters
```

Navigation must be persistent on desktop.

On mobile:

* compact header
* bottom navigation or accessible drawer
* touch-friendly controls

Keyboard accessible.

---

# 23. EXPLORE MODE

Explore is the primary data investigation interface.

Must support:

### Search

Search:

* title
* description
* tags
* location
* category
* relevant metadata

Debounce:

```text
250–300ms
```

### Filters

```text
All
Music
Movies
Places
Purchases
Photos
Messages
Searches
Events
Notes
```

Additional:

* date range
* location
* tags
* connected only
* moments only
* patterns only

---

# 24. SEARCH SHOULD CREATE CONTEXT

If searching:

```text
Paris
```

do not simply show:

```text
12 cards
```

Show:

```text
12 RECEIPTS FOUND

3 places
2 photos
4 purchases
1 event
2 messages
```

Then expose:

```text
Related moments
Related connections
Recurring patterns
```

This demonstrates that the application understands the dataset.

---

# 25. RECEIPT CARD

Cards should be compact and useful.

Display:

```text
CATEGORY

TITLE

timestamp

location / relevant metadata

short description

Connected to X receipts
```

Primary action:

```text
VIEW RECEIPT
```

Secondary contextual actions where appropriate:

```text
Explore Connections
View Moment
```

Every action must work.

---

# 26. RECEIPT DETAIL

Create:

```text
src/components/ReceiptDetail.tsx
```

The modal/drawer must show:

* complete receipt information
* timestamp
* category
* metadata
* location
* tags
* related receipts
* connection score
* why it is connected
* related Moment
* related Chapter
* nearby activity

Connection chain example:

```text
THIS RECEIPT CONNECTS TO

Music
   ↓
Place
   ↓
Purchase
   ↓
Event
```

Every connected item must be clickable.

---

# 27. ACCESSIBLE MODAL

The receipt detail modal must implement:

```text
role="dialog"
aria-modal="true"
```

Also:

* focus trap
* initial focus
* restore focus
* Escape to close
* keyboard navigation
* accessible close button
* correct heading hierarchy

---

# 28. STORY MODE

Create:

```text
src/pages/Story.tsx
```

Story Mode is the emotional centerpiece.

Example:

```text
CHAPTER 01 / 04

A NEW RHYTHM

A cluster of evening activity
appears around the same location.

────────────────────

5 connected receipts

Music
Place
Purchase
Photo
Event

[ Explore This Moment ]

[ ← Previous ]
[ Next → ]
```

Include:

* chapter progress
* chapter navigation
* moment exploration
* receipt previews
* connection evidence
* visual representation
* animated transitions
* keyboard navigation

---

# 29. STORY MODE MUST REMAIN EXPLORABLE

Never create a dead-end slideshow.

Navigation must allow:

```text
Chapter
 ↓
Moment
 ↓
Receipt
 ↓
Connection
 ↓
Related Moment
 ↓
Another Chapter
```

The story is an entry point into the data, not a replacement for exploration.

---

# 30. CONNECTIONS MODE

Create:

```text
src/pages/Connections.tsx
```

Build a visually meaningful network.

Possible architecture:

```text
                PHOTO
                  |
                  |
MUSIC —— MOMENT —— PURCHASE
                  |
                  |
                EVENT
```

or a constellation-style network.

Use:

* SVG
* CSS
* Canvas

Prefer lightweight custom implementation over unnecessarily heavy libraries.

---

# 31. GRAPH REQUIREMENTS

Support:

* click node
* keyboard focus
* hover
* selected state
* connected-node highlighting
* unrelated-node dimming
* connection explanation
* navigation to receipt
* navigation to moment
* reset view

When selected:

```text
CONCERT NIGHT

5 connected receipts
2 locations
3 categories
1 related pattern
```

---

# 32. GRAPH PERFORMANCE

Never render all 159K+ records as graph nodes.

Create graph summaries.

Prioritize:

1. moments
2. strong connections
3. recurring entities
4. representative receipts

Allow the user to drill down.

This provides both:

> scalability

and:

> visual clarity.

---

# 33. DISCOVERY SYSTEM

Create evidence-based discovery cards.

Examples:

```text
PATTERN FOUND

This location appears
5 times across 3 months.
```

```text
CONNECTION FOUND

4 receipts occurred
within 90 minutes.
```

```text
RECURRING THEME

The same topic appears
across multiple searches.
```

```text
ACTIVITY SHIFT

Music-related activity
became more frequent
during this period.
```

Never fabricate.

---

# 34. AHA MOMENTS

Use sparingly.

Examples:

```text
YOU'VE SEEN THESE SEPARATELY.

NOW SEE HOW THEY CONNECT.
```

or:

```text
4 RECEIPTS.
1 MOMENT.
```

or:

```text
THIS PATTERN REPEATS.
```

The user should feel that they discovered something.

---

# 35. DATA VISUALIZATION

Only use visualizations that answer questions.

Useful views:

### Activity density

When was activity concentrated?

### Category distribution

What types of records dominate a period?

### Connection graph

What records relate?

### Chapter progression

How does activity change?

### Recurrence

Which locations/topics/categories repeat?

Do NOT add charts just for decoration.

---

# 36. RESPONSIVE DESIGN

Must work at:

```text
320px
375px
390px
768px
1024px
1280px
1440px+
```

Mobile requirements:

* no horizontal scrolling
* readable typography
* touch-friendly controls
* filters become drawer/sheet
* graph remains usable
* story becomes vertical
* navigation simplifies
* modals fit viewport
* buttons remain accessible

---

# 37. ACCESSIBILITY

Use semantic HTML:

```html
<header>
<nav>
<main>
<section>
<article>
<button>
<footer>
```

Avoid:

```html
<div onClick="">
```

for primary interactions.

Implement:

* keyboard navigation
* visible focus
* correct tab order
* Escape behavior
* Enter/Space controls
* ARIA labels
* aria-expanded
* aria-controls
* aria-live where needed
* accessible dialogs
* alt text
* reduced motion

Never rely solely on color.

---

# 38. PERFORMANCE REQUIREMENTS

Optimize for evaluation.

Implement:

* lazy-loaded Story and Connections views
* memoized expensive computations
* debounced search
* efficient indexes
* virtualized/paginated large lists if required
* no unnecessary renders
* fixed image dimensions
* no unnecessary network calls
* minimal dependencies
* code splitting
* optimized bundle

Do NOT load huge datasets repeatedly.

Do NOT parse the same file every render.

Cache normalized data appropriately.

---

# 39. SECURITY

Frontend-only does NOT mean security can be ignored.

Never use:

```text
eval()
new Function()
dangerouslySetInnerHTML
```

unless absolutely unavoidable.

All search input should be:

```text
trimmed
length-limited
validated
safely rendered
```

Create:

```text
sanitizeSearchInput()
```

No:

```text
API keys
tokens
passwords
credentials
private secrets
```

Do not expose environment secrets.

External links should use safe attributes where appropriate.

---

# 40. ERROR BOUNDARY

Create:

```text
src/components/ErrorBoundary.tsx
```

Recovery screen:

```text
SOMETHING INTERRUPTED THE ARCHIVE.

The memories are still here.

[ TRY AGAIN ]
```

Handle:

* parsing failures
* malformed records
* unexpected rendering errors
* missing dataset
* invalid timestamps

The application must never degrade into a blank page.

---

# 41. EMPTY STATES

Create intentional empty states.

Example:

```text
NOTHING FOUND

No receipts match these filters.

Try another search
or clear your filters.

[ CLEAR FILTERS ]
```

Also handle:

```text
No connections found
No moments found
No story chapters available
Dataset unavailable
```

---

# 42. LOADING STATES

Use lightweight skeleton/loading states.

Do NOT create fake delays.

Loading should represent actual work.

---

# 43. MICRO-INTERACTIONS

Use motion for:

* modal opening
* chapter transitions
* graph selection
* filter changes
* card expansion
* story progression
* node highlighting

Avoid:

* constant bouncing
* excessive parallax
* animation everywhere
* distracting effects

Respect:

```text
prefers-reduced-motion
```

---

# 44. TECH STACK

Use:

```text
React
Vite
TypeScript
Tailwind CSS
```

Recommended only where useful:

```text
Framer Motion
Lucide React
Vitest
React Testing Library
ESLint
Prettier
```

Do not add dependencies just because they are popular.

Every dependency should justify its presence.

---

# 45. PROJECT ARCHITECTURE

Use:

```text
src/
├── components/
│   ├── ui/
│   ├── layout/
│   └── features/
│
├── pages/
│   ├── Explore.tsx
│   ├── Story.tsx
│   └── Connections.tsx
│
├── hooks/
│   ├── useReceipts.ts
│   ├── useFilters.ts
│   ├── useConnections.ts
│   └── useStory.ts
│
├── services/
│   └── receiptService.ts
│
├── utils/
│   ├── connections.ts
│   ├── moments.ts
│   ├── grouping.ts
│   ├── scoring.ts
│   ├── dates.ts
│   └── sanitize.ts
│
├── constants/
│
├── data/
│
├── types/
│
├── tests/
│
├── App.tsx
└── main.tsx
```

Avoid giant components.

Avoid giant `App.tsx`.

Keep:

```text
data logic
UI logic
state
visualization
```

reasonably separated.

---

# 46. TYPESCRIPT STRICTNESS

Because:

```text
verbatimModuleSyntax = true
```

use type-only imports:

```ts
import type { Receipt } from "../types";
```

not:

```ts
import { Receipt } from "../types";
```

Fix existing files including:

```text
receiptService.ts
connections.ts
moments.ts
Explore.tsx
ReceiptCard.tsx
useReceipts.ts
```

Also remove:

* unused imports
* unused variables
* implicit any
* unsafe casts
* unreachable code

Do not disable strict TypeScript rules just to make the build pass.

---

# 47. APP.TSX

Create or complete:

```text
src/App.tsx
```

Responsibilities:

* initialize receipt data
* loading state
* error state
* global view state
* navigation
* shared selected receipt state
* story state
* connection state

Do not put all business logic here.

---

# 48. MAIN.TSX

Ensure:

```text
index.css
```

is imported.

Mount the application correctly.

Verify production entry point.

---

# 49. TESTING

Use:

```text
Vitest
React Testing Library
jest-dom
```

Create at least **8 meaningful tests**.

Prefer 10+.

Test:

```text
1. CSV parsing
2. JSON parsing
3. receipt normalization
4. malformed receipt handling
5. connection scoring
6. connection detection
7. moment detection
8. chapter generation
9. filtering
10. search
11. ReceiptCard
12. ReceiptDetail
13. empty state
14. story navigation
15. graph interaction
```

Tests must test real behavior.

Never create meaningless:

```ts
expect(true).toBe(true)
```

tests.

---

# 50. NETLIFY

Create:

```text
netlify.toml
```

Use:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

If client-side routing is used, configure SPA fallback.

Example:

```text
/* /index.html 200
```

The deployed application must work when directly visiting a route.

---

# 51. GITHUB READINESS

Repository must contain:

```text
README.md
.gitignore
package.json
package-lock.json
netlify.toml
src/
public/data/
```

Never commit:

```text
node_modules/
dist/
.env
.env.*
secrets
credentials
private tokens
```

The GitHub repository must be public-ready.

---

# 52. README

Create a professional README containing:

```text
# Your Life, In Receipts

## Overview

## Challenge

## Problem

## Solution

## Product Concept

## Key Features

## Dataset

## Data Normalization

## Connection Engine

## Moment Detection

## Story Engine

## Connections Visualization

## Architecture

## Data Flow

## Tech Stack

## Installation

## Local Development

## Testing

## Production Build

## Deployment

## Accessibility

## Performance

## Security

## Known Limitations

## Future Improvements

## Evaluation Requirement Mapping
```

Do not document features that do not actually exist.

---

# 53. REQUIREMENT MAPPING

README must contain:

| Requirement              | Actual Implementation                 |
| ------------------------ | ------------------------------------- |
| Explore receipts         | Explore Mode                          |
| Search/filter/navigation | Search + Filter Engine                |
| Relationship discovery   | Connection Engine                     |
| Interactive storytelling | Story Mode                            |
| Visual digital journey   | Connections + Chapters                |
| Responsive design        | Tailwind responsive layouts           |
| Accessibility            | Semantic HTML + ARIA + keyboard       |
| Security                 | Sanitization + safe rendering         |
| Performance              | Memoization + indexing + lazy loading |
| Testing                  | Vitest + React Testing Library        |

Only claim genuinely implemented functionality.

---

# 54. CROSS-MODE NAVIGATION

The application must feel like ONE product.

Required loop:

```text
LANDING
   ↓
EXPLORE
   ↓
RECEIPT
   ↓
CONNECTION
   ↓
MOMENT
   ↓
STORY
   ↓
CHAPTER
   ↓
CONNECTION MAP
   ↓
ANOTHER RECEIPT
```

Do not create three disconnected pages.

---

# 55. PROGRESSIVE DISCLOSURE

Do not reveal everything immediately.

Use:

```text
Level 1
A glimpse

Level 2
Receipt

Level 3
Connection

Level 4
Moment

Level 5
Pattern

Level 6
Chapter
```

This is the core interaction philosophy.

---

# 56. EVIDENCE-FIRST STORYTELLING

Every insight should be traceable to actual data.

For important insights expose:

```text
WHY THIS APPEARS
```

Example:

```text
WHY THIS CONNECTION EXISTS

+25 close timestamps
+30 same location
+15 shared category
```

This makes the system feel trustworthy.

Do NOT present unexplained "AI" conclusions.

---

# 57. DO NOT FAKE AI

If no actual AI/ML model is required, do not label deterministic analytics as AI.

The application can legitimately use:

```text
connection scoring
pattern detection
recurrence detection
clustering
temporal analysis
```

Call it:

> Connection Engine

or:

> Pattern Engine

rather than pretending it is an AI model.

Trust is more valuable than buzzwords.

---

# 58. DATASET-SPECIFIC EXPERIENCE

Because the available datasets include large Spotify history and transaction datasets, intelligently expose their relationships.

For example, if timestamps allow:

```text
Spotify activity
       ↓
same-day transaction
       ↓
same-period activity cluster
```

This may create a meaningful cross-dataset moment.

But only show such relationships if actual data supports them.

Do NOT invent locations or activities that are absent.

---

# 59. LARGE-DATASET STRATEGY

Spotify has 149K+ records.

Do NOT:

```text
map()
render()
```

149K cards simultaneously.

Instead:

```text
dataset
 ↓
indexes
 ↓
filters
 ↓
visible subset
 ↓
UI
```

For graph:

```text
149K records
 ↓
candidate connections
 ↓
strong relationships
 ↓
moments
 ↓
representative nodes
 ↓
graph
```

---

# 60. SIX-HOUR PRIORITY ORDER

The hackathon allows exactly six hours.

Optimize implementation order:

## Phase 1 — 0:00–0:20

Inspect:

* repository
* existing code
* package configuration
* all datasets

Fix architecture before visual polish.

---

## Phase 2 — 0:20–1:10

Data foundation:

* normalization
* parsing
* validation
* indexing
* filtering
* search
* connection scoring

---

## Phase 3 — 1:10–2:15

Explore:

* search
* filters
* receipt grid
* receipt detail
* connected records

---

## Phase 4 — 2:15–3:30

Story:

* moments
* chapters
* story engine
* navigation
* evidence

---

## Phase 5 — 3:30–4:30

Connections:

* graph
* nodes
* edges
* interaction
* highlighting
* navigation

---

## Phase 6 — 4:30–5:00

Visual polish:

* typography
* spacing
* hierarchy
* responsive design
* motion
* empty states

---

## Phase 7 — 5:00–5:30

Accessibility + testing:

* keyboard
* ARIA
* focus
* modal
* tests
* error boundary

---

## Phase 8 — 5:30–5:50

Performance:

* production build
* bundle inspection
* memoization
* large dataset behavior
* mobile verification

---

## Phase 9 — 5:50–6:00

Submission:

* README
* Netlify
* GitHub
* final build
* final smoke test

---

# 61. PRIORITY IF TIME RUNS OUT

Use this exact priority:

```text
1. Functional requirements
2. Real dataset correctness
3. Connection engine
4. Story experience
5. Explore
6. Visual journey
7. Responsive design
8. Accessibility
9. Testing
10. Visual polish
11. Extra features
```

Never sacrifice core functionality for decorative effects.

---

# 62. ANTI-GENERIC DESIGN CHECK

Before finalizing:

Ask:

> Could this be mistaken for a generic SaaS analytics dashboard?

If yes:

REDESIGN.

The user should immediately understand:

> This is a digital-life exploration experience.

---

# 63. ANTI-FAKE-INTERACTION CHECK

Every interactive element must have a real outcome.

Bad:

```text
View Story
```

with static fake text.

Bad:

```text
AI Insights
```

with hardcoded insights.

Bad:

```text
Explore Connections
```

opening a decorative image.

Good:

```text
Receipt
 ↓
actual connections
 ↓
actual moment
 ↓
actual story
 ↓
related chapter
```

Everything should connect.

---

# 64. PERFORMANCE QUALITY BAR

Before completion verify:

```text
Fast initial render
No unnecessary loading delay
No huge synchronous computation blocking UI
No 149K DOM nodes
No graph explosion
No repeated CSV parsing
No unnecessary network requests
No obvious layout shifts
```

Use lazy loading where appropriate.

---

# 65. SECURITY QUALITY BAR

Verify:

```text
No eval
No new Function
No unsafe HTML
No secrets
No credentials
Search input sanitized
External URLs safe
Dependencies reasonable
User-provided text safely rendered
```

---

# 66. ACCESSIBILITY QUALITY BAR

Verify:

```text
Keyboard navigation works
Tab order makes sense
Focus visible
Escape closes modal
Modal focus is managed
ARIA labels exist where needed
Buttons are real buttons
Headings are structured
Color isn't the only signal
Reduced motion supported
```

---

# 67. FINAL RESPONSIVE QA

Test:

```text
320px
375px
390px
768px
1024px
1280px
1440px
```

Check:

```text
No horizontal overflow
No clipped text
No overlapping content
No broken modal
No unusable graph
No broken navigation
No tiny touch targets
```

---

# 68. FINAL BUILD COMMANDS

Run:

```bash
npm install
npm run lint
npm run test
npm run build
npm run preview
```

Fix EVERYTHING before declaring completion.

Do not ignore:

* TypeScript errors
* ESLint errors
* ESLint warnings
* unused variables
* unused imports
* React key warnings
* accessibility warnings
* console errors

---

# 69. FINAL SMOKE TEST

Manually verify this exact journey:

```text
OPEN APPLICATION
      ↓
LANDING LOADS
      ↓
ENTER ARCHIVE
      ↓
EXPLORE LOADS REAL DATA
      ↓
SEARCH SOMETHING
      ↓
FILTER RESULTS
      ↓
OPEN RECEIPT
      ↓
SEE REAL CONNECTIONS
      ↓
OPEN RELATED RECEIPT
      ↓
OPEN MOMENT
      ↓
ENTER STORY
      ↓
MOVE BETWEEN CHAPTERS
      ↓
OPEN CONNECTION MAP
      ↓
SELECT NODE
      ↓
RETURN TO RECEIPT
```

If any transition is broken, fix it.

---

# 70. FINAL QUALITY CHECKLIST

## FUNCTIONAL

```text
[ ] Real datasets load
[ ] CSV parsing works
[ ] JSON parsing works
[ ] Normalization works
[ ] Explore works
[ ] Search works
[ ] Filters work
[ ] Receipt detail works
[ ] Connections work
[ ] Moments generated
[ ] Chapters generated
[ ] Story works
[ ] Graph works
[ ] Cross-navigation works
```

## ENGINEERING

```text
[ ] Strict TypeScript
[ ] No unnecessary any
[ ] No dead code
[ ] No giant components
[ ] No duplicated logic
[ ] Clean architecture
[ ] Type-only imports
```

## SECURITY

```text
[ ] No secrets
[ ] No unsafe HTML
[ ] No eval
[ ] Input sanitized
[ ] Safe external links
[ ] Dependencies reviewed
```

## PERFORMANCE

```text
[ ] Large dataset handled efficiently
[ ] Search debounced
[ ] Derived data memoized
[ ] No 149K DOM nodes
[ ] Graph summarized
[ ] Lazy loading where useful
[ ] Minimal layout shifts
[ ] Reasonable bundle
```

## ACCESSIBILITY

```text
[ ] Semantic HTML
[ ] Keyboard navigation
[ ] Focus states
[ ] ARIA
[ ] Accessible modal
[ ] Escape support
[ ] Reduced motion
[ ] Color not sole signal
```

## RESPONSIVE

```text
[ ] 320px
[ ] 375px
[ ] 390px
[ ] 768px
[ ] 1024px
[ ] 1280px
[ ] 1440px
```

## DEPLOYMENT

```text
[ ] npm install
[ ] npm run dev
[ ] npm run lint
[ ] npm run test
[ ] npm run build
[ ] npm run preview
[ ] netlify.toml
[ ] GitHub-ready
[ ] HTTPS-ready
[ ] Incognito-ready
```

---

# 71. FINAL EXECUTION INSTRUCTION

DO NOT merely explain the implementation.

DO NOT stop after scaffolding.

DO NOT create mockups.

DO NOT create fake data.

DO NOT create fake AI insights.

DO NOT ask unnecessary questions.

DO NOT rewrite working functionality without reason.

DO NOT spend excessive time on decorative effects before core functionality works.

Instead execute:

```text
INSPECT
   ↓
UNDERSTAND DATA
   ↓
AUDIT EXISTING CODE
   ↓
FIX TYPES
   ↓
NORMALIZE REAL DATA
   ↓
BUILD CONNECTION ENGINE
   ↓
BUILD MOMENTS
   ↓
BUILD CHAPTERS
   ↓
COMPLETE EXPLORE
   ↓
BUILD STORY
   ↓
BUILD CONNECTION MAP
   ↓
CONNECT EVERYTHING
   ↓
ACCESSIBILITY
   ↓
PERFORMANCE
   ↓
TEST
   ↓
POLISH
   ↓
BUILD
   ↓
VERIFY
```

---

# 72. THE FINAL PRODUCT SHOULD FEEL LIKE THIS

The evaluator opens the application.

They do NOT feel:

> "This is a dashboard showing CSV data."

They should feel:

> "This is someone's digital archive."

They see fragments.

They explore.

They notice a connection.

They open it.

They discover a Moment.

They discover that the Moment is part of a recurring Pattern.

They enter a Chapter.

They then see the larger Story.

And they can still dive back into the underlying receipts.

That is the product.

---

# FINAL PRODUCT PRINCIPLE

```text
RECEIPTS
    ↓
THE RAW MATERIAL

CONNECTIONS
    ↓
THE DISCOVERY

MOMENTS
    ↓
THE CONTEXT

PATTERNS
    ↓
THE SIGNAL

CHAPTERS
    ↓
THE STRUCTURE

STORY
    ↓
THE EXPERIENCE
```

## ONE DATASET.

## HUNDREDS OF MOMENTS.

## THOUSANDS OF POSSIBLE CONNECTIONS.

## ONE STORY WAITING TO BE DISCOVERED.

---

# BUILD IT NOW.

Inspect the actual repository and datasets first.

Then implement the complete production-ready application.

Do not return a plan instead of implementation.

Do not stop until the project is:

**functional + tested + accessible + performant + responsive + GitHub-ready + Netlify-ready.**
