/**
 * Connected Memories Component
 * Explains and displays the semantic and temporal linkages between:
 * Receipt -> Moment -> Pattern -> Chapter
 */

import { useMemo } from "react";
import { Network, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import type { Receipt, LifeMoment, Chapter, Connection } from "../types/index";
import { getCategoryColor } from "../utils/helpers";

interface ConnectedMemoriesProps {
  receipt: Receipt;
  allReceipts?: Receipt[];
  moments?: LifeMoment[];
  chapters?: Chapter[];
  onSelectReceipt?: (receipt: Receipt) => void;
}

export function ConnectedMemories({
  receipt,
  allReceipts = [],
  moments = [],
  chapters = [],
  onSelectReceipt,
}: ConnectedMemoriesProps) {
  // 1. Find all moments that contain this receipt
  const parentMoments = useMemo(() => {
    return moments.filter((m) => m.receiptIds.includes(receipt.id));
  }, [moments, receipt.id]);

  // 2. Find the chapter containing this receipt / moment
  const parentChapter = useMemo(() => {
    return (
      chapters.find((c) => c.receiptIds.includes(receipt.id)) ||
      (parentMoments.length > 0
        ? chapters.find((c) => parentMoments.some((m) => c.momentIds.includes(m.id)))
        : undefined)
    );
  }, [chapters, receipt.id, parentMoments]);

  // 3. Find connected receipts and explain connection reasons
  const connectedReceiptsWithReasons = useMemo(() => {
    const results: Array<{
      receipt: Receipt;
      reason: string;
      score: number;
      type: string;
    }> = [];

    const currentLoc = receipt.location?.city || receipt.location?.normalized;
    const currentTime = receipt.date.getTime();

    // Check parent moments connections first
    const momentConnections: Connection[] = [];
    for (const m of parentMoments) {
      momentConnections.push(...m.connections);
    }

    const seenIds = new Set<string>([receipt.id]);

    for (const conn of momentConnections) {
      const otherId = conn.receiptId1 === receipt.id ? conn.receiptId2 : conn.receiptId1;
      if (!seenIds.has(otherId)) {
        seenIds.add(otherId);
        const otherReceipt = allReceipts.find((r) => r.id === otherId);
        if (otherReceipt) {
          results.push({
            receipt: otherReceipt,
            reason: conn.reason || "Close temporal and behavioral co-occurrence",
            score: conn.score,
            type: conn.type,
          });
        }
      }
    }

    // If few found, find receipts within 3 hours or same location
    if (results.length < 3) {
      for (const other of allReceipts) {
        if (seenIds.has(other.id)) continue;
        const diffMinutes = Math.abs(other.date.getTime() - currentTime) / (1000 * 60);

        if (diffMinutes <= 180) {
          seenIds.add(other.id);
          const sameLoc = currentLoc && (other.location?.city === currentLoc || other.location?.normalized === currentLoc);
          results.push({
            receipt: other,
            reason: sameLoc
              ? `Occurred in ${currentLoc} within ${Math.round(diffMinutes)} mins`
              : `Logged within ${Math.round(diffMinutes)} mins (${other.type.toUpperCase()})`,
            score: Math.max(30, 80 - Math.round(diffMinutes / 3)),
            type: "temporal",
          });
          if (results.length >= 4) break;
        }
      }
    }

    return results.slice(0, 4);
  }, [receipt, parentMoments, allReceipts]);

  const primaryMoment = parentMoments[0];

  return (
    <div className="space-y-6" role="region" aria-label="Connected Memories Trail">
      {/* Narrative Trail breadcrumb: Receipt -> Moment -> Chapter */}
      <div className="bg-[#05070B] border border-[#2e303a] rounded-xl p-4">
        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-3">
          Narrative Trail Hierarchy
        </span>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Receipt */}
          <div className="flex items-center gap-1.5 bg-[#0D111A] px-3 py-1.5 rounded-lg border border-cyan-500/40 text-cyan-300 font-medium">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: getCategoryColor(receipt.type) }}
            />
            <span>This Receipt</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8]" />

          {/* Moment */}
          <div className="flex items-center gap-1.5 bg-[#0D111A] px-3 py-1.5 rounded-lg border border-[#2e303a] text-[#E8F1FF]">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span className="font-medium">
              {primaryMoment ? primaryMoment.title : "Standalone Moment"}
            </span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8]" />

          {/* Chapter */}
          <div className="flex items-center gap-1.5 bg-[#0D111A] px-3 py-1.5 rounded-lg border border-[#2e303a] text-[#E8F1FF]">
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-medium">
              {parentChapter ? `Chapter ${parentChapter.number}: ${parentChapter.title}` : "Uncharted Chapter"}
            </span>
          </div>
        </div>

        {primaryMoment && (
          <p className="text-xs text-[#94A3B8] mt-3 leading-relaxed border-t border-[#2e303a] pt-2">
            <strong className="text-[#E8F1FF]">Moment Summary:</strong> {primaryMoment.summary}
          </p>
        )}
      </div>

      {/* Related Moments */}
      {parentMoments.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <h4 className="text-sm font-bold text-[#E8F1FF]">Associated Life Moments</h4>
          </div>

          <div className="space-y-2">
            {parentMoments.map((moment) => (
              <div
                key={moment.id}
                className="bg-[#0D111A] border border-[#2e303a] rounded-lg p-3 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-cyan-400">{moment.title}</span>
                  <span className="text-[#94A3B8] text-[10px]">
                    {moment.receipts.length} receipts · {moment.timeSpanMinutes} mins
                  </span>
                </div>
                <p className="text-[#94A3B8] leading-relaxed">{moment.summary}</p>
                {moment.evidence.length > 0 && (
                  <div className="text-[11px] text-yellow-500/90 font-medium">
                    Evidence: {moment.evidence[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connected Receipts & Reason Why */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Network className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-[#E8F1FF]">Connected Memories & Relationships</h4>
        </div>

        {connectedReceiptsWithReasons.length > 0 ? (
          <div className="space-y-2.5">
            {connectedReceiptsWithReasons.map(({ receipt: rel, reason, score }, idx) => (
              <div
                key={idx}
                className="bg-[#0D111A] border border-[#2e303a] hover:border-cyan-500/50 rounded-lg p-3 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: getCategoryColor(rel.type) }}
                    />
                    <span className="font-semibold text-[#E8F1FF] truncate">
                      {rel.title || "Connected Event"}
                    </span>
                    <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded font-bold">
                      {score}% Match
                    </span>
                  </div>

                  <p className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                    <span className="text-cyan-400 font-medium">Why connected:</span>
                    <span>{reason}</span>
                  </p>
                </div>

                {onSelectReceipt && (
                  <button
                    type="button"
                    onClick={() => onSelectReceipt(rel)}
                    className="shrink-0 px-3 py-1.5 bg-[#16171d] hover:bg-cyan-500 hover:text-white text-[#94A3B8] rounded text-xs transition-colors"
                  >
                    View
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-[#94A3B8] bg-[#0D111A] rounded-lg border border-[#2e303a]">
            No tightly coupled receipts in the immediate temporal vicinity.
          </div>
        )}
      </div>
    </div>
  );
}
