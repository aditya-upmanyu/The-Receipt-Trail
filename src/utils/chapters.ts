/**
 * Chapter Generation Engine — Synthesizes clustered moments into coherent macro-narrative chapters.
 * Inputs: Array of detected LifeMoments and corresponding source receipts.
 * Outputs: Chronological Chapter array with dominant activities, activity levels, patterns, and narrative summaries.
 */

import type { Chapter, LifeMoment, Receipt, Pattern, ReceiptType } from "../types/index";

const CHAPTER_MIN_MOMENTS = 3;
const CHAPTER_TIME_WINDOW_DAYS = 30;

// ============================================================================
// CHAPTER GENERATION
// ============================================================================

export function generateChapters(moments: LifeMoment[], allReceipts: Receipt[]): Chapter[] {
  if (moments.length < CHAPTER_MIN_MOMENTS) return [];

  const chapters: Chapter[] = [];
  // Sort in place to avoid spread operator stack overflow
  moments.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  const sortedMoments = moments;

  let currentChapter: LifeMoment[] = [];
  let chapterStart = sortedMoments[0].startTime;

  for (let i = 0; i < sortedMoments.length; i++) {
    const moment = sortedMoments[i];
    const daysSinceStart = (moment.startTime.getTime() - chapterStart.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceStart <= CHAPTER_TIME_WINDOW_DAYS) {
      currentChapter.push(moment);
    } else {
      // Finalize current chapter
      if (currentChapter.length >= CHAPTER_MIN_MOMENTS) {
        chapters.push(createChapter(currentChapter, chapters.length + 1, allReceipts));
      }

      // Start new chapter
      currentChapter = [moment];
      chapterStart = moment.startTime;
    }
  }

  // Finalize last chapter
  if (currentChapter.length >= CHAPTER_MIN_MOMENTS) {
    chapters.push(createChapter(currentChapter, chapters.length + 1, allReceipts));
  }

  return chapters;
}

function createChapter(moments: LifeMoment[], chapterNumber: number, allReceipts: Receipt[]): Chapter {
  // Sort in place to avoid spread operator stack overflow
  moments.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  const sortedMoments = moments;
  const startDate = sortedMoments[0].startTime;
  const endDate = sortedMoments[sortedMoments.length - 1].endTime;

  const receiptIds = new Set<string>();
  moments.forEach((m) => m.receiptIds.forEach((id) => receiptIds.add(id)));

  const receipts = allReceipts.filter((r) => receiptIds.has(r.id));
  const dominantCategories = findDominantCategories(receipts);
  const patterns = detectChapterPatterns(receipts);
  const activityLevel = calculateActivityLevel(receipts, startDate, endDate);

  const title = generateChapterTitle(chapterNumber, dominantCategories, startDate, endDate);
  const description = generateChapterDescription(receipts, moments, patterns);
  const evidence = generateChapterEvidence(receipts, moments, patterns);

  return {
    id: `chapter_${chapterNumber}`,
    number: chapterNumber,
    title,
    description,
    moments: sortedMoments,
    momentIds: moments.map((m) => m.id),
    startDate,
    endDate,
    receipts,
    receiptIds: Array.from(receiptIds),
    patterns,
    evidence,
    dominantCategories,
    activityLevel,
  };
}

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

function findDominantCategories(receipts: Receipt[]): ReceiptType[] {
  const counts = new Map<ReceiptType, number>();

  for (const receipt of receipts) {
    counts.set(receipt.type, (counts.get(receipt.type) || 0) + 1);
  }

  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);

  return sorted.slice(0, 2).map(([type]) => type);
}

function calculateActivityLevel(receipts: Receipt[], startDate: Date, endDate: Date): "low" | "moderate" | "high" {
  const days = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const receiptsPerDay = receipts.length / Math.max(1, days);

  if (receiptsPerDay > 10) return "high";
  if (receiptsPerDay > 3) return "moderate";
  return "low";
}

function detectChapterPatterns(receipts: Receipt[]): Pattern[] {
  const patterns: Pattern[] = [];

  // Location clustering
  const locationPattern = detectLocationClustering(receipts);
  if (locationPattern) patterns.push(locationPattern);

  // Recurrence patterns
  const recurrencePattern = detectRecurrence(receipts);
  if (recurrencePattern) patterns.push(recurrencePattern);

  // Activity shift
  const activityShift = detectActivityShift(receipts);
  if (activityShift) patterns.push(activityShift);

  return patterns;
}

function detectLocationClustering(receipts: Receipt[]): Pattern | null {
  const locationCounts = new Map<string, number>();

  for (const receipt of receipts) {
    if (receipt.location?.normalized) {
      locationCounts.set(receipt.location.normalized, (locationCounts.get(receipt.location.normalized) || 0) + 1);
    }
  }

  const entries = Array.from(locationCounts.entries()).sort((a, b) => b[1] - a[1]);
  const topLocation = entries[0];

  if (topLocation && topLocation[1] >= 5) {
    const locationReceipts = receipts.filter((r) => r.location?.normalized === topLocation[0]);

    return {
      id: `pattern_location_${topLocation[0]}`,
      type: "location_cluster",
      title: "Location Pattern",
      description: `${topLocation[0]} appears ${topLocation[1]} times`,
      evidence: [`${topLocation[1]} activities at the same location`, `${Math.round((topLocation[1] / receipts.length) * 100)}% of chapter activity`],
      strength: Math.min(100, (topLocation[1] / receipts.length) * 100),
      receipts: locationReceipts,
      receiptIds: locationReceipts.map((r) => r.id),
    };
  }

  return null;
}

function detectRecurrence(receipts: Receipt[]): Pattern | null {
  if (receipts.filter((r) => r.type === "music").length < 5) return null;

  const musicReceipts = receipts.filter((r) => r.type === "music");
  const artistCounts = new Map<string, number>();

  for (const receipt of musicReceipts) {
    if (receipt.type === "music" && receipt.artist) {
      artistCounts.set(receipt.artist, (artistCounts.get(receipt.artist) || 0) + 1);
    }
  }

  const entries = Array.from(artistCounts.entries()).sort((a, b) => b[1] - a[1]);
  const topArtist = entries[0];

  if (topArtist && topArtist[1] >= 5) {
    const artistReceipts = musicReceipts.filter((r) => r.type === "music" && r.artist === topArtist[0]);

    return {
      id: `pattern_recurrence_${topArtist[0]}`,
      type: "recurrence",
      title: "Recurring Theme",
      description: `${topArtist[0]} played ${topArtist[1]} times`,
      evidence: [`${topArtist[1]} tracks from the same artist`, `Consistent listening pattern`],
      strength: Math.min(100, (topArtist[1] / musicReceipts.length) * 100),
      receipts: artistReceipts,
      receiptIds: artistReceipts.map((r) => r.id),
    };
  }

  return null;
}

function detectActivityShift(receipts: Receipt[]): Pattern | null {
  // Sort in place to avoid spread operator stack overflow
  receipts.sort((a, b) => a.date.getTime() - b.date.getTime());
  const sorted = receipts;
  const midpoint = Math.floor(sorted.length / 2);

  const firstHalf = sorted.slice(0, midpoint);
  const secondHalf = sorted.slice(midpoint);

  const firstCategories = firstHalf.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const secondCategories = secondHalf.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Check for significant shift
  const firstDominant = Object.entries(firstCategories).sort((a, b) => b[1] - a[1])[0];
  const secondDominant = Object.entries(secondCategories).sort((a, b) => b[1] - a[1])[0];

  if (firstDominant && secondDominant && firstDominant[0] !== secondDominant[0]) {
    return {
      id: `pattern_shift_${firstDominant[0]}_${secondDominant[0]}`,
      type: "activity_shift",
      title: "Activity Shift",
      description: `Activity shifted from ${getCategoryLabel(firstDominant[0])} to ${getCategoryLabel(secondDominant[0])}`,
      evidence: [
        `First period: ${firstDominant[1]} ${getCategoryLabel(firstDominant[0])} activities`,
        `Later period: ${secondDominant[1]} ${getCategoryLabel(secondDominant[0])} activities`,
      ],
      strength: 70,
      receipts: secondHalf,
      receiptIds: secondHalf.map((r) => r.id),
    };
  }

  return null;
}

// ============================================================================
// TEXT GENERATION
// ============================================================================

function generateChapterTitle(
  chapterNumber: number,
  dominantCategories: ReceiptType[],
  startDate: Date,
  endDate: Date
): string {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const startMonth = monthNames[startDate.getMonth()];
  const endMonth = monthNames[endDate.getMonth()];
  const year = startDate.getFullYear();

  const period = startMonth === endMonth ? `${startMonth} ${year}` : `${startMonth} - ${endMonth} ${year}`;

  if (dominantCategories.length > 0) {
    const categoryLabel = dominantCategories.map(getCategoryLabel).join(" & ");
    return `Chapter ${chapterNumber}: ${categoryLabel} Period (${period})`;
  }

  return `Chapter ${chapterNumber}: ${period}`;
}

function generateChapterDescription(receipts: Receipt[], moments: LifeMoment[], patterns: Pattern[]): string {
  const parts: string[] = [];

  parts.push(`A period with ${moments.length} distinct moments and ${receipts.length} activities`);

  if (patterns.length > 0) {
    parts.push(`Notable patterns: ${patterns.map((p) => p.title.toLowerCase()).join(", ")}`);
  }

  return parts.join(". ");
}

function generateChapterEvidence(receipts: Receipt[], moments: LifeMoment[], patterns: Pattern[]): string[] {
  const evidence: string[] = [];

  evidence.push(`${moments.length} moments detected`);
  evidence.push(`${receipts.length} total activities`);

  const categories = Array.from(new Set(receipts.map((r) => r.type)));
  evidence.push(`${categories.length} activity type${categories.length !== 1 ? "s" : ""}`);

  if (patterns.length > 0) {
    evidence.push(`${patterns.length} pattern${patterns.length !== 1 ? "s" : ""} identified`);
  }

  return evidence;
}

function getCategoryLabel(type: string): string {
  const labels: Record<string, string> = {
    music: "Music",
    place: "Location",
    purchase: "Purchase",
    event: "Event",
  };
  return labels[type] || type;
}
