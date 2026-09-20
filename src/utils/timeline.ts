/**
 * Timeline Utilities
 * Grouping, sorting, and pattern utilities for the chronological discovery view
 */

import type { Receipt, LifeMoment, Pattern } from "../types/index";

export interface DateGroupedReceipts {
  [dateStr: string]: Receipt[];
}

/**
 * Groups receipts by calendar date (YYYY-MM-DD)
 */
export function groupReceiptsByDate(receipts: Receipt[]): DateGroupedReceipts {
  const grouped: DateGroupedReceipts = {};

  for (const receipt of receipts) {
    const key = receipt.date.toISOString().split("T")[0];
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(receipt);
  }

  // Sort receipts within each date descending by time
  for (const key in grouped) {
    grouped[key].sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  return grouped;
}

/**
 * Filter moments occurring on or spanning a specific date
 */
export function getMomentsForDate(dateStr: string, moments: LifeMoment[]): LifeMoment[] {
  return moments.filter((m) => {
    const startStr = m.startTime.toISOString().split("T")[0];
    const endStr = m.endTime.toISOString().split("T")[0];
    return dateStr >= startStr && dateStr <= endStr;
  });
}

/**
 * Analyzes recurring patterns across receipts and moments for the timeline
 */
export function analyzePatterns(receipts: Receipt[], moments: LifeMoment[]): Pattern[] {
  const patterns: Pattern[] = [];

  // Pattern 1: High activity clustering
  if (moments.length > 0) {
    const largestMoment = moments.reduce((prev, curr) =>
      curr.receipts.length > prev.receipts.length ? curr : prev
    );

    patterns.push({
      id: "pattern-activity-cluster",
      type: "clustering",
      title: "Concentrated Activity Clusters",
      description: `Identified ${moments.length} distinct life moments with temporal and geographic convergence.`,
      evidence: [
        `Largest cluster: "${largestMoment.title}" with ${largestMoment.receipts.length} events spanning ${largestMoment.timeSpanMinutes} minutes.`,
        `${moments.filter((m) => m.categories.length > 1).length} moments bridge multiple categories.`,
      ],
      strength: 85,
      receipts: largestMoment.receipts,
      receiptIds: largestMoment.receiptIds,
    });
  }

  // Pattern 2: Category distribution recurrence
  const categoryCounts = receipts.reduce<Record<string, number>>((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});

  const sortedCats = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  if (sortedCats.length > 0) {
    patterns.push({
      id: "pattern-category-dominance",
      type: "recurrence",
      title: `Dominant ${sortedCats[0][0].toUpperCase()} Cadence`,
      description: `Primary life log activity is heavily anchored in ${sortedCats[0][0]} logs, accounting for ${sortedCats[0][1]} recorded points.`,
      evidence: sortedCats.map(
        ([cat, count]) => `${cat.toUpperCase()}: ${count.toLocaleString()} logged entries`
      ),
      strength: 90,
      receipts: receipts.slice(0, 10),
      receiptIds: receipts.slice(0, 10).map((r) => r.id),
    });
  }

  return patterns;
}
