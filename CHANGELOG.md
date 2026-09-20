# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-09-20

### Added

#### Intelligence Features
- **Life Insights & Patterns System**: Evidence-based analytics revealing most active times, common categories, recurring locations, recurring artists/activities, busiest periods, activity streaks, and cross-category patterns
- **Connected Memories**: Visual relationship mapping showing how receipts connect to moments, patterns, and chapters with detailed connection explanations
- **Life Timeline**: Chronological discovery view enabling temporal exploration of moments and receipts with filtering and navigation
- **Life Recap Modal**: Evidence-based visual summary of digital life activity generated from real dataset with copyable statistics

#### Discovery & Exploration
- **Multi-Filter Combinations**: Advanced filtering supporting simultaneous category, date range, and text search filters
- **Date Range Filtering**: Precise temporal filtering with visual date picker
- **Enhanced Sorting**: Sort by newest, oldest, or relevance
- **Favorites System**: Mark and filter important moments and receipts with persistent localStorage storage
- **Clear/Reset Filters**: One-click filter clearing with preserved search state
- **Polished Empty States**: Contextual empty state messages with actionable guidance
- **Fuzzy Search**: 250ms debounced search across 159K+ records with performance optimization

#### Architecture Improvements
- **React Router Integration**: Replaced state machine with React Router for proper URL synchronization and browser history support
- **Component Extraction**: Split 192-LOC App.tsx into focused, single-responsibility components (Navbar, LoadingScreen, ErrorScreen)
- **Hooks Separation**: Created reusable custom hooks (useReceipts, useInsights, useFavorites) for clean separation of UI and business logic
- **Service Layer**: Organized services (receiptService, errorLogger, performance) for centralized logic
- **Type Safety**: Strict TypeScript configuration with proper type definitions in dedicated types directory
- **Constants Management**: Centralized magic values and configuration in constants directory

#### Developer Experience
- **Error Logging Service**: Centralized error tracking with severity levels and structured logging
- **Performance Monitoring**: Web Vitals tracking (LCP, FID, CLS) with performance metrics collection
- **Error Boundary**: React error boundary for graceful error handling and recovery

### Changed
- **62% LOC Reduction**: Refactored App.tsx from 192 to 75 lines through component extraction and architectural improvements
- **Removed Console Statements**: Eliminated all development console.log statements (13 in receiptService, 6 in useReceipts, 6 in performance.service, 2 in useFavorites, 1 in LifeRecapModal) and replaced with structured error logging
- **Enhanced README**: Comprehensive documentation with all v2.0 features, architecture decisions, and technical details
- **Improved Navigation**: Seamless page transitions with proper URL state management

### Removed
- **Dead Code Elimination**: Removed unused ReceiptContext.tsx (never imported or used)
- **Circular Dependencies**: Eliminated circular imports and dependency cycles
- **Magic Values**: Replaced hardcoded values with named constants
- **Unused Imports**: Cleaned up all unused imports across codebase

### Technical Details
- **6D Connection Engine**: Combines temporal (30%), geospatial (25%), category (20%), spending (15%), metadata (5%), and type (5%) signals
- **DBSCAN Clustering**: Discovers meaningful moments through density-based spatial clustering
- **Pattern Recognition**: Automatically generates life chapters from detected patterns
- **Performance**: Handles 159K+ receipts with optimized rendering, memoization, and lazy loading

## [1.0.0] - 2026-09-19

### Added
- Initial release of Your Life, In Receipts
- Receipt parsing for Spotify, Household Transactions, and India Transaction datasets
- Basic receipt cards with visualization
- Simple receipt detail view
- Landing page with hero section
- Basic filtering and search
- Responsive design with mobile support
- Accessibility features (ARIA labels, keyboard navigation)
- Loading and error states

### Technical Stack
- React 19 with TypeScript 6 (strict mode)
- Vite 8 build system
- Tailwind CSS 4 for styling
- Lucide React for icons
- Recharts for data visualization

---

## Version Naming Convention

- **Major (X.0.0)**: Breaking architectural changes, major feature additions
- **Minor (x.X.0)**: New features, backward-compatible improvements
- **Patch (x.x.X)**: Bug fixes, documentation updates, minor tweaks
