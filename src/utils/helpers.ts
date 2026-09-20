/**
 * Helper Utilities
 * Common functions used throughout the application
 */

import type { Receipt, ReceiptType } from "../types/index";

// ============================================================================
// DATE FORMATTING
// ============================================================================

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// ============================================================================
// TEXT UTILITIES
// ============================================================================

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function sanitizeSearchInput(input: string): string {
  return input.trim().slice(0, 100);
}

// ============================================================================
// CATEGORY UTILITIES
// ============================================================================

export function getCategoryColor(type: ReceiptType): string {
  const colors: Record<ReceiptType, string> = {
    music: "rgb(168, 85, 247)", // Purple
    place: "rgb(34, 197, 94)", // Green
    purchase: "rgb(251, 191, 36)", // Amber
    event: "rgb(244, 63, 94)", // Rose
  };
  return colors[type] || "rgb(156, 163, 175)"; // Gray fallback
}

export function getCategoryIcon(type: ReceiptType): string {
  const icons: Record<ReceiptType, string> = {
    music: "music",
    place: "map-pin",
    purchase: "shopping-bag",
    event: "calendar",
  };
  return icons[type] || "file";
}

export function getCategoryLabel(type: ReceiptType): string {
  const labels: Record<ReceiptType, string> = {
    music: "Music",
    place: "Place",
    purchase: "Purchase",
    event: "Event",
  };
  return labels[type] || type;
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

export function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const key = keyFn(item);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }

  return groups;
}

export function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

// ============================================================================
// DEBOUNCE
// ============================================================================

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// ============================================================================
// RECEIPT STATISTICS
// ============================================================================

export interface ReceiptStats {
  total: number;
  byType: Record<string, number>;
  dateRange: {
    earliest: Date | null;
    latest: Date | null;
  };
  locations: string[];
}

export function calculateReceiptStats(receipts: Receipt[]): ReceiptStats {
  const byType: Record<string, number> = {};
  let earliest: Date | null = null;
  let latest: Date | null = null;
  const locationSet = new Set<string>();

  for (const receipt of receipts) {
    // Count by type
    byType[receipt.type] = (byType[receipt.type] || 0) + 1;

    // Track date range
    if (!earliest || receipt.date < earliest) {
      earliest = receipt.date;
    }
    if (!latest || receipt.date > latest) {
      latest = receipt.date;
    }

    // Collect locations
    if (receipt.location?.normalized) {
      locationSet.add(receipt.location.normalized);
    }
  }

  return {
    total: receipts.length,
    byType,
    dateRange: { earliest, latest },
    locations: Array.from(locationSet),
  };
}
