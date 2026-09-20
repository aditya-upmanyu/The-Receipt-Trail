/**
 * Timeline Page
 * Chronological discovery view of moments and receipts alongside Life Insights & Patterns
 */

import { useState, useMemo } from "react";
import {
  Calendar,
  TrendingUp,
  Zap,
  Sparkles,
  Layers,
  ChevronDown,
} from "lucide-react";
import type { Receipt, LifeMoment, Chapter } from "../types/index";
import { groupReceiptsByDate, analyzePatterns, getMomentsForDate } from "../utils/timeline";
import { ReceiptCard } from "../components/ReceiptCard";
import { ReceiptDetail } from "../components/ReceiptDetail";
import { PatternInsights } from "../components/PatternInsights";
import { LifeRecapModal } from "../components/LifeRecapModal";
import { useFavorites } from "../hooks/useFavorites";

interface TimelineProps {
  receipts: Receipt[];
  moments: LifeMoment[];
  chapters?: Chapter[];
}

const DATES_PER_PAGE = 15;

export function Timeline({ receipts, moments, chapters = [] }: TimelineProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [view, setView] = useState<"timeline" | "insights">("timeline");
  const [dateCount, setDateCount] = useState(DATES_PER_PAGE);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [showRecapModal, setShowRecapModal] = useState(false);

  const { isFavorite, toggleFavorite } = useFavorites();

  // Group receipts by date
  const groupedReceipts = useMemo(() => groupReceiptsByDate(receipts), [receipts]);

  // Analyze patterns
  const patterns = useMemo(() => analyzePatterns(receipts, moments), [receipts, moments]);

  // Sort dates descending (most recent first)
  const allSortedDates = useMemo(
    () => Object.keys(groupedReceipts).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()),
    [groupedReceipts]
  );

  // Available years for quick timeline jumping
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    for (const d of allSortedDates) {
      years.add(d.split("-")[0]);
    }
    return Array.from(years).sort().reverse();
  }, [allSortedDates]);

  // Filter dates by selected year
  const filteredDates = useMemo(() => {
    if (selectedYear === "all") return allSortedDates;
    return allSortedDates.filter((d) => d.startsWith(selectedYear));
  }, [allSortedDates, selectedYear]);

  // Paginated/batched dates for 60fps scrolling performance
  const visibleDates = useMemo(() => {
    return filteredDates.slice(0, dateCount);
  }, [filteredDates, dateCount]);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#05070B]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#080B12]/95 backdrop-blur-sm border-b border-[#2e303a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#E8F1FF]">Life Timeline</h1>
                <button
                  type="button"
                  onClick={() => setShowRecapModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-semibold transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Life Recap</span>
                </button>
              </div>
              <p className="text-xs text-[#94A3B8] mt-1">
                Chronological sequence & evidence-based behavioral patterns
              </p>
            </div>

            {/* View toggle */}
            <div className="flex gap-1.5 bg-[#0D111A] rounded-xl p-1 border border-[#2e303a]">
              <button
                type="button"
                onClick={() => setView("timeline")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  view === "timeline"
                    ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                    : "text-[#94A3B8] hover:text-[#E8F1FF]"
                }`}
                aria-pressed={view === "timeline"}
              >
                Chronological Timeline
              </button>
              <button
                type="button"
                onClick={() => setView("insights")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  view === "insights"
                    ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
                    : "text-[#94A3B8] hover:text-[#E8F1FF]"
                }`}
                aria-pressed={view === "insights"}
              >
                Life Insights & Patterns
              </button>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0D111A] rounded-xl p-3 border border-[#2e303a]">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] text-[#94A3B8] font-medium">Logged Days</span>
              </div>
              <p className="text-lg font-black text-[#E8F1FF]">{allSortedDates.length.toLocaleString()}</p>
            </div>

            <div className="bg-[#0D111A] rounded-xl p-3 border border-[#2e303a]">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-[11px] text-[#94A3B8] font-medium">Life Moments</span>
              </div>
              <p className="text-lg font-black text-[#E8F1FF]">{moments.length}</p>
            </div>

            <div className="bg-[#0D111A] rounded-xl p-3 border border-[#2e303a]">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                <span className="text-[11px] text-[#94A3B8] font-medium">Patterns</span>
              </div>
              <p className="text-lg font-black text-[#E8F1FF]">{patterns.length}</p>
            </div>

            <div className="bg-[#0D111A] rounded-xl p-3 border border-[#2e303a]">
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px] text-[#94A3B8] font-medium">Total Receipts</span>
              </div>
              <p className="text-lg font-black text-[#E8F1FF]">{receipts.length.toLocaleString()}</p>
            </div>
          </div>

          {/* Year Navigator (only for timeline view) */}
          {view === "timeline" && availableYears.length > 1 && (
            <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs text-[#94A3B8] font-semibold shrink-0">Year:</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedYear("all");
                  setDateCount(DATES_PER_PAGE);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
                  selectedYear === "all"
                    ? "bg-cyan-500 text-white"
                    : "bg-[#0D111A] text-[#94A3B8] hover:text-[#E8F1FF]"
                }`}
              >
                All Years
              </button>
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => {
                    setSelectedYear(yr);
                    setDateCount(DATES_PER_PAGE);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
                    selectedYear === yr
                      ? "bg-cyan-500 text-white"
                      : "bg-[#0D111A] text-[#94A3B8] hover:text-[#E8F1FF]"
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === "timeline" ? (
          /* Timeline view */
          <div className="space-y-8">
            {visibleDates.length > 0 ? (
              <>
                <div className="space-y-8">
                  {visibleDates.map((dateStr) => {
                    const receiptsForDate = groupedReceipts[dateStr] || [];
                    const momentsForDate = getMomentsForDate(dateStr, moments);

                    return (
                      <div key={dateStr} className="relative">
                        {/* Date header line */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex-shrink-0 w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-cyan-500/20" />
                          <div className="flex-1 h-px bg-[#2e303a]" />
                          <div className="text-right">
                            <h2 className="text-base sm:text-lg font-bold text-[#E8F1FF]">
                              {formatDate(dateStr)}
                            </h2>
                            <p className="text-xs text-[#94A3B8]">
                              {receiptsForDate.length} logged event{receiptsForDate.length !== 1 ? "s" : ""}
                              {momentsForDate.length > 0 && (
                                <span className="text-yellow-400 ml-1.5 font-semibold">
                                  · {momentsForDate.length} Life Moment{momentsForDate.length > 1 ? "s" : ""}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Associated Moment Highlights for this date */}
                        {momentsForDate.length > 0 && (
                          <div className="pl-7 mb-4 space-y-2">
                            {momentsForDate.map((m) => (
                              <div
                                key={m.id}
                                className="bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/30 rounded-xl p-3 text-xs"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                                  <span className="font-bold text-[#E8F1FF]">{m.title}</span>
                                  <span className="text-[10px] text-yellow-400 bg-yellow-400/20 px-1.5 py-0.5 rounded font-semibold">
                                    MOMENT
                                  </span>
                                </div>
                                <p className="text-[#94A3B8]">{m.summary}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Receipts grid */}
                        <div className="pl-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {receiptsForDate.map((receipt) => (
                            <ReceiptCard
                              key={receipt.id}
                              receipt={receipt}
                              onClick={() => setSelectedReceipt(receipt)}
                              isFavorite={isFavorite(receipt.id)}
                              onToggleFavorite={toggleFavorite}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load More Days Button */}
                {visibleDates.length < filteredDates.length && (
                  <div className="text-center pt-6">
                    <button
                      type="button"
                      onClick={() => setDateCount((prev) => prev + DATES_PER_PAGE)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0D111A] hover:bg-[#16171d] text-cyan-400 border border-cyan-500/40 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <ChevronDown className="w-4 h-4" />
                      <span>Load More Dates ({filteredDates.length - visibleDates.length} remaining)</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-[#080B12] border border-[#2e303a] rounded-xl p-8">
                <Calendar className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#E8F1FF] mb-2">No Timeline Entries for this Period</h3>
                <p className="text-xs text-[#94A3B8]">Select "All Years" or clear search filters to view recorded activity.</p>
              </div>
            )}
          </div>
        ) : (
          /* Insights view */
          <PatternInsights receipts={receipts} moments={moments} patterns={patterns} />
        )}
      </div>

      {/* Receipt detail modal with Connected Memories */}
      {selectedReceipt && (
        <ReceiptDetail
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          allReceipts={receipts}
          moments={moments}
          chapters={chapters}
          isFavorite={isFavorite(selectedReceipt.id)}
          onToggleFavorite={toggleFavorite}
          onSelectReceipt={(r) => setSelectedReceipt(r)}
        />
      )}

      {/* Life Recap Modal */}
      <LifeRecapModal
        receipts={receipts}
        moments={moments}
        isOpen={showRecapModal}
        onClose={() => setShowRecapModal(false)}
      />
    </div>
  );
}
