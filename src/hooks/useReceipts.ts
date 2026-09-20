/**
 * useReceipts Hook
 * Manages receipt data loading and state
 */

import { useState, useEffect, useMemo } from "react";
import type { Receipt, Connection, LifeMoment, Chapter } from "../types/index";
import { loadAllReceipts, buildReceiptIndexes } from "../services/receiptService";
import { detectConnections } from "../utils/connections";
import { detectMoments } from "../utils/moments";
import { generateChapters } from "../utils/chapters";
import { errorLogger, ErrorSeverity } from "../services/errorLogger.service";

interface UseReceiptsResult {
  receipts: Receipt[];
  connections: Connection[];
  moments: LifeMoment[];
  chapters: Chapter[];
  loading: boolean;
  error: string | null;
  indexes: ReturnType<typeof buildReceiptIndexes> | null;
}

export function useReceipts(): UseReceiptsResult {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [moments, setMoments] = useState<LifeMoment[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Load receipts
        const loadedReceipts = await loadAllReceipts();
        setReceipts(loadedReceipts);

        // Limit connection detection to manageable subset for large datasets
        const receiptSubset = loadedReceipts.length > 5000 ? loadedReceipts.slice(0, 5000) : loadedReceipts;

        // Detect connections
        const detectedConnections = detectConnections(receiptSubset, 15);
        setConnections(detectedConnections);

        // Detect moments
        const detectedMoments = detectMoments(receiptSubset, detectedConnections);
        setMoments(detectedMoments);

        // Generate chapters
        const generatedChapters = generateChapters(detectedMoments, receiptSubset);
        setChapters(generatedChapters);
      } catch (err) {
        errorLogger.logError(err as Error, ErrorSeverity.CRITICAL, {
          operation: "useReceipts",
        });
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const indexes = useMemo(() => {
    if (receipts.length === 0) return null;
    return buildReceiptIndexes(receipts);
  }, [receipts]);

  return {
    receipts,
    connections,
    moments,
    chapters,
    loading,
    error,
    indexes,
  };
}
