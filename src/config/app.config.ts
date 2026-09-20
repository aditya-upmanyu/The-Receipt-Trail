/**
 * Application Configuration
 * Centralized config management with environment variable support
 */

export const AppConfig = {
  // App metadata
  app: {
    name: "Your Life, In Receipts",
    version: "1.0.0",
    environment: import.meta.env.MODE || "production",
  },

  // Data settings
  data: {
    maxReceiptsToLoad: 25000,
    chunkSize: 10000,
    spotifyLimit: 20000,
    householdLimit: 5000,
    indiaLimit: 0, // Disabled for now
    maxFileSizeMB: 50,
  },

  // Performance settings
  performance: {
    searchDebounceMs: 250,
    lazyLoadThreshold: 0.5,
    enableCodeSplitting: true,
    enableMemoization: true,
  },

  // Connection detection settings
  connections: {
    temporalWeight: 0.3,
    locationWeight: 0.25,
    categoryWeight: 0.2,
    amountWeight: 0.15,
    metadataWeight: 0.05,
    typeWeight: 0.05,
    minScore: 0.5,
    maxConnections: 15,
  },

  // Moment detection settings
  moments: {
    minReceipts: 3,
    maxTimeWindowHours: 24,
    minConnectionStrength: 0.6,
  },

  // UI settings
  ui: {
    breakpoints: {
      mobile: 640,
      tablet: 768,
      desktop: 1024,
      wide: 1280,
    },
    gridColumns: {
      mobile: 1,
      tablet: 2,
      desktop: 3,
      wide: 4,
    },
  },

  // Feature flags
  features: {
    enableSearch: true,
    enableFilters: true,
    enableConnections: true,
    enableStoryMode: true,
    enableAnalytics: false,
  },
} as const;

export type AppConfigType = typeof AppConfig;
