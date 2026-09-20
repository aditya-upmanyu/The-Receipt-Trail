/**
 * useInsights Hook
 * Memoized extraction of life insights and patterns from loaded receipts & moments
 */

import { useMemo } from "react";
import type { Receipt, LifeMoment } from "../types/index";
import { generateLifeInsightsReport, type LifeInsightsReport } from "../utils/insights";

export function useInsights(receipts: Receipt[], moments: LifeMoment[]): LifeInsightsReport | null {
  return useMemo(() => {
    if (receipts.length === 0) return null;
    return generateLifeInsightsReport(receipts, moments);
  }, [receipts, moments]);
}
