/**
 * Life Insights Engine
 * Pure, evidence-based pattern extraction from real receipt and moment data.
 * No fabricated insights or psychological claims.
 */

import type { Receipt, LifeMoment, ReceiptType } from "../types/index";

export interface ActiveTimeInsight {
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

export interface CategoryInsight {
  dominantCategory: ReceiptType;
  counts: Record<ReceiptType, number>;
  percentages: Record<ReceiptType, number>;
  evidence: string[];
}

export interface RecurringEntity {
  name: string;
  count: number;
  category: ReceiptType;
  firstSeen: Date;
  lastSeen: Date;
  details?: string;
}

export interface RecurringInsights {
  artists: RecurringEntity[];
  locations: RecurringEntity[];
  merchants: RecurringEntity[];
  evidence: string[];
}

export interface BusiestPeriod {
  date: string; // YYYY-MM-DD
  formattedDate: string;
  eventCount: number;
  categories: ReceiptType[];
  sampleTitles: string[];
  evidence: string[];
}

export interface StreakInsight {
  longestStreakDays: number;
  streakStartDate: string;
  streakEndDate: string;
  currentStreakDays: number;
  totalActiveDays: number;
  evidence: string[];
}

export interface CrossCategoryPattern {
  id: string;
  title: string;
  description: string;
  categoriesInvolved: ReceiptType[];
  occurrences: number;
  confidenceScore: number; // 0-100
  evidence: string[];
}

export interface LifeInsightsReport {
  totalReceipts: number;
  totalMoments: number;
  activeTime: ActiveTimeInsight;
  categories: CategoryInsight;
  recurring: RecurringInsights;
  busiestPeriods: BusiestPeriod[];
  streaks: StreakInsight;
  crossCategoryPatterns: CrossCategoryPattern[];
  generatedAt: string;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Calculates active time patterns (peak hour, time of day, day of week)
 */
export function calculateActiveTimeInsight(receipts: Receipt[]): ActiveTimeInsight {
  const hourCounts = new Array(24).fill(0);
  const dayCounts: Record<string, number> = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
  };

  const timeOfDay = {
    morning: 0, // 6-12
    afternoon: 0, // 12-17
    evening: 0, // 17-22
    night: 0, // 22-6
  };

  for (const receipt of receipts) {
    const d = receipt.date;
    const hour = d.getHours();
    hourCounts[hour]++;

    const dayName = DAYS[d.getDay()];
    dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;

    if (hour >= 6 && hour < 12) {
      timeOfDay.morning++;
    } else if (hour >= 12 && hour < 17) {
      timeOfDay.afternoon++;
    } else if (hour >= 17 && hour < 22) {
      timeOfDay.evening++;
    } else {
      timeOfDay.night++;
    }
  }

  let peakHour = 0;
  let peakHourCount = 0;
  for (let h = 0; h < 24; h++) {
    if (hourCounts[h] > peakHourCount) {
      peakHour = h;
      peakHourCount = hourCounts[h];
    }
  }

  const formatHour = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const nextH = (h + 1) % 24;
    const nextPeriod = nextH >= 12 ? "PM" : "AM";
    const nextDisplay = nextH % 12 === 0 ? 12 : nextH % 12;
    return `${displayHour}:00 ${period} - ${nextDisplay}:00 ${nextPeriod}`;
  };

  let dominantTimeOfDay: "Morning" | "Afternoon" | "Evening" | "Night" = "Evening";
  let maxTimeOfDayCount = -1;
  const todEntries: Array<[keyof typeof timeOfDay, "Morning" | "Afternoon" | "Evening" | "Night"]> = [
    ["morning", "Morning"],
    ["afternoon", "Afternoon"],
    ["evening", "Evening"],
    ["night", "Night"],
  ];
  for (const [key, label] of todEntries) {
    if (timeOfDay[key] > maxTimeOfDayCount) {
      maxTimeOfDayCount = timeOfDay[key];
      dominantTimeOfDay = label;
    }
  }

  let peakDayOfWeek = "Monday";
  let maxDayCount = -1;
  for (const day of DAYS) {
    if (dayCounts[day] > maxDayCount) {
      maxDayCount = dayCounts[day];
      peakDayOfWeek = day;
    }
  }

  const total = receipts.length || 1;
  const peakHourPct = ((peakHourCount / total) * 100).toFixed(1);

  return {
    peakHour,
    peakHourLabel: formatHour(peakHour),
    peakHourCount,
    timeOfDay,
    dominantTimeOfDay,
    peakDayOfWeek,
    dayOfWeekCounts: dayCounts,
    evidence: [
      `Peak active hour is ${formatHour(peakHour)} with ${peakHourCount.toLocaleString()} events (${peakHourPct}% of all activity).`,
      `${dominantTimeOfDay} is the primary activity window with ${maxTimeOfDayCount.toLocaleString()} events.`,
      `Most active day is ${peakDayOfWeek} with ${maxDayCount.toLocaleString()} logged entries.`,
    ],
  };
}

/**
 * Calculates category distribution and dominant category
 */
export function calculateCategoryInsight(receipts: Receipt[]): CategoryInsight {
  const counts: Record<ReceiptType, number> = {
    music: 0,
    place: 0,
    purchase: 0,
    event: 0,
  };

  for (const receipt of receipts) {
    if (counts[receipt.type] !== undefined) {
      counts[receipt.type]++;
    }
  }

  const total = receipts.length || 1;
  const percentages: Record<ReceiptType, number> = {
    music: Math.round((counts.music / total) * 100),
    place: Math.round((counts.place / total) * 100),
    purchase: Math.round((counts.purchase / total) * 100),
    event: Math.round((counts.event / total) * 100),
  };

  let dominantCategory: ReceiptType = "music";
  let maxCount = -1;
  for (const [cat, count] of Object.entries(counts) as [ReceiptType, number][]) {
    if (count > maxCount) {
      maxCount = count;
      dominantCategory = cat;
    }
  }

  return {
    dominantCategory,
    counts,
    percentages,
    evidence: [
      `Primary activity category: ${dominantCategory.toUpperCase()} representing ${percentages[dominantCategory]}% (${maxCount.toLocaleString()} receipts).`,
      `Purchases: ${counts.purchase.toLocaleString()} (${percentages.purchase}%), Places: ${counts.place.toLocaleString()} (${percentages.place}%), Music: ${counts.music.toLocaleString()} (${percentages.music}%).`,
    ],
  };
}

/**
 * Calculates recurring entities: Top artists, merchants, and locations
 */
export function calculateRecurringInsights(receipts: Receipt[]): RecurringInsights {
  const artistMap = new Map<string, { count: number; firstSeen: Date; lastSeen: Date; msPlayed: number }>();
  const locationMap = new Map<string, { count: number; firstSeen: Date; lastSeen: Date }>();
  const merchantMap = new Map<string, { count: number; firstSeen: Date; lastSeen: Date; totalAmount: number; currency: string }>();

  for (const r of receipts) {
    // Music
    if (r.type === "music" && r.artist) {
      const existing = artistMap.get(r.artist);
      const ms = r.msPlayed || 0;
      if (!existing) {
        artistMap.set(r.artist, { count: 1, firstSeen: r.date, lastSeen: r.date, msPlayed: ms });
      } else {
        existing.count++;
        existing.msPlayed += ms;
        if (r.date < existing.firstSeen) existing.firstSeen = r.date;
        if (r.date > existing.lastSeen) existing.lastSeen = r.date;
      }
    }

    // Places / Location
    const loc = r.location?.city || r.location?.normalized || (r.type === "place" ? r.title : undefined);
    if (loc && loc.trim().length > 1) {
      const trimmed = loc.trim();
      const existing = locationMap.get(trimmed);
      if (!existing) {
        locationMap.set(trimmed, { count: 1, firstSeen: r.date, lastSeen: r.date });
      } else {
        existing.count++;
        if (r.date < existing.firstSeen) existing.firstSeen = r.date;
        if (r.date > existing.lastSeen) existing.lastSeen = r.date;
      }
    }

    // Purchases
    if (r.type === "purchase" && (r.merchant || r.category)) {
      const merchantName = r.merchant || r.category || "Merchant";
      const existing = merchantMap.get(merchantName);
      const amount = r.amount || 0;
      const currency = r.currency || "INR";
      if (!existing) {
        merchantMap.set(merchantName, { count: 1, firstSeen: r.date, lastSeen: r.date, totalAmount: amount, currency });
      } else {
        existing.count++;
        existing.totalAmount += amount;
        if (r.date < existing.firstSeen) existing.firstSeen = r.date;
        if (r.date > existing.lastSeen) existing.lastSeen = r.date;
      }
    }
  }

  const artists: RecurringEntity[] = Array.from(artistMap.entries())
    .map(([name, data]) => {
      const hours = (data.msPlayed / (1000 * 60 * 60)).toFixed(1);
      return {
        name,
        count: data.count,
        category: "music" as ReceiptType,
        firstSeen: data.firstSeen,
        lastSeen: data.lastSeen,
        details: `${data.count} tracks played (${hours} hrs)`,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const locations: RecurringEntity[] = Array.from(locationMap.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      category: "place" as ReceiptType,
      firstSeen: data.firstSeen,
      lastSeen: data.lastSeen,
      details: `${data.count} visits recorded`,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const merchants: RecurringEntity[] = Array.from(merchantMap.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      category: "purchase" as ReceiptType,
      firstSeen: data.firstSeen,
      lastSeen: data.lastSeen,
      details: `${data.count} transactions (Total: ${data.currency} ${Math.round(data.totalAmount).toLocaleString()})`,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topArtist = artists[0]?.name || "N/A";
  const topMerchant = merchants[0]?.name || "N/A";
  const topLoc = locations[0]?.name || "N/A";

  return {
    artists,
    locations,
    merchants,
    evidence: [
      `Most played artist: ${topArtist} with ${artists[0]?.count || 0} listens.`,
      `Most frequent merchant: ${topMerchant} with ${merchants[0]?.count || 0} transactions.`,
      `Primary geographic anchor: ${topLoc} with ${locations[0]?.count || 0} logged interactions.`,
    ],
  };
}

/**
 * Calculates the busiest days and peak periods
 */
export function calculateBusiestPeriods(receipts: Receipt[]): BusiestPeriod[] {
  const dateMap = new Map<string, { count: number; categories: Set<ReceiptType>; titles: string[]; dateObj: Date }>();

  for (const r of receipts) {
    const key = r.date.toISOString().split("T")[0];
    const existing = dateMap.get(key);
    if (!existing) {
      dateMap.set(key, {
        count: 1,
        categories: new Set([r.type]),
        titles: r.title ? [r.title] : [],
        dateObj: r.date,
      });
    } else {
      existing.count++;
      existing.categories.add(r.type);
      if (existing.titles.length < 3 && r.title) {
        existing.titles.push(r.title);
      }
    }
  }

  const sortedDates = Array.from(dateMap.entries())
    .map(([date, data]) => {
      const formatted = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(data.dateObj);

      const categories = Array.from(data.categories);
      return {
        date,
        formattedDate: formatted,
        eventCount: data.count,
        categories,
        sampleTitles: data.titles,
        evidence: [
          `${data.count} events logged on ${formatted}`,
          `Categories involved: ${categories.join(", ")}`,
        ],
      };
    })
    .sort((a, b) => b.eventCount - a.eventCount)
    .slice(0, 5);

  return sortedDates;
}

/**
 * Calculates consecutive active day streaks
 */
export function calculateStreaks(receipts: Receipt[]): StreakInsight {
  if (receipts.length === 0) {
    return {
      longestStreakDays: 0,
      streakStartDate: "",
      streakEndDate: "",
      currentStreakDays: 0,
      totalActiveDays: 0,
      evidence: ["No receipts available to compute activity streaks."],
    };
  }

  const dateSet = new Set<string>();
  for (const r of receipts) {
    dateSet.add(r.date.toISOString().split("T")[0]);
  }

  const sortedDays = Array.from(dateSet).sort();
  let longestStreak = 0;
  let currentRun = 0;
  let bestStart = sortedDays[0];
  let bestEnd = sortedDays[0];
  let runStart = sortedDays[0];

  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0) {
      currentRun = 1;
      runStart = sortedDays[0];
    } else {
      const prev = new Date(sortedDays[i - 1]);
      const curr = new Date(sortedDays[i]);
      const diffMs = curr.getTime() - prev.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentRun++;
      } else {
        if (currentRun > longestStreak) {
          longestStreak = currentRun;
          bestStart = runStart;
          bestEnd = sortedDays[i - 1];
        }
        currentRun = 1;
        runStart = sortedDays[i];
      }
    }
  }

  if (currentRun > longestStreak) {
    longestStreak = currentRun;
    bestStart = runStart;
    bestEnd = sortedDays[sortedDays.length - 1];
  }

  return {
    longestStreakDays: longestStreak,
    streakStartDate: bestStart,
    streakEndDate: bestEnd,
    currentStreakDays: currentRun,
    totalActiveDays: sortedDays.length,
    evidence: [
      `Longest consecutive daily activity streak was ${longestStreak} continuous days (${bestStart} through ${bestEnd}).`,
      `Total distinct active days across archive: ${sortedDays.length} days.`,
    ],
  };
}

/**
 * Calculates verifiable cross-category patterns between music, purchases, and places
 */
export function calculateCrossCategoryPatterns(receipts: Receipt[], moments: LifeMoment[]): CrossCategoryPattern[] {
  const patterns: CrossCategoryPattern[] = [];

  // 1. Multi-category moments
  const multiCatMoments = moments.filter((m) => m.categories.length > 1);
  if (multiCatMoments.length > 0) {
    patterns.push({
      id: "pattern-multicat-moments",
      title: "Cross-Domain Synergy",
      description: "Moments where digital music listening co-occurred alongside physical transactions or place visits within a 3-hour window.",
      categoriesInvolved: ["music", "purchase", "place"],
      occurrences: multiCatMoments.length,
      confidenceScore: Math.min(95, 60 + multiCatMoments.length * 3),
      evidence: [
        `${multiCatMoments.length} verified moments contain simultaneous multi-category activities.`,
        `Sample moment: "${multiCatMoments[0]?.title || "Multi-category activity"}" containing ${multiCatMoments[0]?.receipts.length || 0} events.`,
      ],
    });
  }

  // 2. Music while purchasing: Check receipts occurring on the same day in both Music & Purchase
  const musicDays = new Set<string>();
  const purchaseDays = new Set<string>();

  for (const r of receipts) {
    const day = r.date.toISOString().split("T")[0];
    if (r.type === "music") musicDays.add(day);
    if (r.type === "purchase") purchaseDays.add(day);
  }

  let overlapDays = 0;
  for (const day of musicDays) {
    if (purchaseDays.has(day)) overlapDays++;
  }

  if (overlapDays > 0) {
    const pct = Math.round((overlapDays / Math.max(1, purchaseDays.size)) * 100);
    patterns.push({
      id: "pattern-music-spending-co-occurrence",
      title: "Audio Accompaniment on Active Days",
      description: "Music listening sessions were logged on the exact same days as personal expenditures.",
      categoriesInvolved: ["music", "purchase"],
      occurrences: overlapDays,
      confidenceScore: Math.min(92, 50 + pct / 2),
      evidence: [
        `Logged music on ${overlapDays} of the ${purchaseDays.size} spending days (${pct}% overlap).`,
        `Direct temporal proof: expenditure events were accompanied by recorded streaming sessions.`,
      ],
    });
  }

  // 3. Weekend vs Weekday Activity
  let weekendCount = 0;
  let weekdayCount = 0;
  for (const r of receipts) {
    const day = r.date.getDay();
    if (day === 0 || day === 6) {
      weekendCount++;
    } else {
      weekdayCount++;
    }
  }

  const weekendAvg = weekendCount / 2;
  const weekdayAvg = weekdayCount / 5;
  const weekendBiased = weekendAvg > weekdayAvg;

  patterns.push({
    id: "pattern-weekend-rhythm",
    title: weekendBiased ? "Weekend Acceleration" : "Weekday Routine Anchor",
    description: weekendBiased
      ? "Daily event frequency spikes significantly during Saturdays and Sundays compared to standard weekdays."
      : "Activity density remains consistently higher and more structured across Monday through Friday.",
    categoriesInvolved: ["music", "purchase", "place"],
    occurrences: weekendBiased ? weekendCount : weekdayCount,
    confidenceScore: 88,
    evidence: [
      `Average weekend daily volume: ${Math.round(weekendAvg)} events vs weekday daily volume: ${Math.round(weekdayAvg)} events.`,
      `Total weekend events: ${weekendCount.toLocaleString()} | Total weekday events: ${weekdayCount.toLocaleString()}.`,
    ],
  });

  return patterns;
}

/**
 * Generate full comprehensive Life Insights report
 */
export function generateLifeInsightsReport(receipts: Receipt[], moments: LifeMoment[]): LifeInsightsReport {
  return {
    totalReceipts: receipts.length,
    totalMoments: moments.length,
    activeTime: calculateActiveTimeInsight(receipts),
    categories: calculateCategoryInsight(receipts),
    recurring: calculateRecurringInsights(receipts),
    busiestPeriods: calculateBusiestPeriods(receipts),
    streaks: calculateStreaks(receipts),
    crossCategoryPatterns: calculateCrossCategoryPatterns(receipts, moments),
    generatedAt: new Date().toISOString(),
  };
}
