/**
 * Application Constants
 */

export const APP_NAME = "Your Life, In Receipts";

export const ROUTES = {
  HOME: "/",
  EXPLORE: "/explore",
  TIMELINE: "/timeline",
  STORY: "/story",
  CONNECTIONS: "/connections",
} as const;

export const COLORS = {
  primary: "#06B6D4", // Cyan
  secondary: "#3B82F6", // Blue
  accent: "#F59E0B", // Amber
  purple: "#A855F7",
  green: "#22C55E",
  rose: "#F43F5E",
  background: {
    dark: "#05070B",
    darker: "#080B12",
    darkest: "#0D111A",
  },
  text: {
    primary: "#E8F1FF",
    secondary: "#94A3B8",
  },
} as const;

export const CATEGORY_COLORS = {
  music: "#A855F7", // Purple
  place: "#22C55E", // Green
  purchase: "#FBBF24", // Amber
  event: "#F43F5E", // Rose
} as const;

export const CONNECTION_WEIGHTS = {
  location: 30,
  temporal: 25,
  keyword: 20,
  tag: 15,
  category: 10,
  recurrence: 10,
} as const;

export const THRESHOLDS = {
  connection: {
    min: 15,
    moderate: 40,
    strong: 70,
  },
  moment: {
    minReceipts: 2,
    timeWindowMinutes: 180,
    minConnectionScore: 20,
  },
  chapter: {
    minMoments: 3,
    timeWindowDays: 30,
  },
} as const;

export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeOut: "cubic-bezier(0.33, 1, 0.68, 1)",
    easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  },
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;
