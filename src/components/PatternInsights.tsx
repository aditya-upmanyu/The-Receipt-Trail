/**
 * Pattern Insights Component
 * Displays evidence-based life patterns and behavioral discoveries
 */

import { useState } from "react";
import {
  Clock,
  Music,
  MapPin,
  ShoppingBag,
  TrendingUp,
  Flame,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Award,
} from "lucide-react";
import type { Receipt, LifeMoment, Pattern } from "../types/index";
import { useInsights } from "../hooks/useInsights";

interface PatternInsightsProps {
  receipts: Receipt[];
  moments?: LifeMoment[];
  patterns?: Pattern[];
}

export function PatternInsights({ receipts, moments = [] }: PatternInsightsProps) {
  const insights = useInsights(receipts, moments);
  const [activeTab, setActiveTab] = useState<"all" | "time" | "recurring" | "cross">("all");

  if (!insights) {
    return (
      <div className="text-center py-16 bg-[#080B12] border border-[#2e303a] rounded-xl p-8">
        <TrendingUp className="w-12 h-12 text-[#94A3B8] mx-auto mb-4" />
        <h3 className="text-xl font-bold text-[#E8F1FF] mb-2">Analyzing Patterns...</h3>
        <p className="text-[#94A3B8]">Collecting evidence-based insights across your receipts archive.</p>
      </div>
    );
  }

  const { activeTime, categories, recurring, busiestPeriods, streaks, crossCategoryPatterns } = insights;

  return (
    <div className="space-y-8" role="region" aria-label="Life Insights and Behavioral Patterns">
      {/* Category distribution hero */}
      <div className="bg-gradient-to-r from-[#0D111A] to-[#080B12] border border-[#2e303a] rounded-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-semibold text-cyan-400 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% EVIDENCE-BASED DISCOVERY</span>
            </div>
            <h2 className="text-2xl font-bold text-[#E8F1FF]">Life Insights & Behavioral Patterns</h2>
            <p className="text-sm text-[#94A3B8]">
              Grounded in {receipts.length.toLocaleString()} verified receipts and {moments.length} detected life moments.
            </p>
          </div>

          {/* Quick tab filter */}
          <div className="flex flex-wrap gap-1.5 bg-[#05070B] p-1.5 rounded-lg border border-[#2e303a]">
            {(
              [
                { id: "all", label: "All Insights" },
                { id: "time", label: "Time Rhythms" },
                { id: "recurring", label: "Top Anchors" },
                { id: "cross", label: "Cross-Patterns" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-cyan-500 text-white shadow-sm"
                    : "text-[#94A3B8] hover:text-[#E8F1FF] hover:bg-[#0D111A]"
                }`}
                aria-pressed={activeTab === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category progress bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-semibold text-[#94A3B8]">
            <span className="flex items-center gap-1.5 text-purple-400">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
              Music ({categories.percentages.music}%)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Purchases ({categories.percentages.purchase}%)
            </span>
            <span className="flex items-center gap-1.5 text-green-400">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
              Places ({categories.percentages.place}%)
            </span>
          </div>

          <div className="h-3 w-full bg-[#1A1F2C] rounded-full overflow-hidden flex">
            <div
              style={{ width: `${categories.percentages.music}%` }}
              className="bg-purple-500 h-full transition-all duration-500"
              title={`Music: ${categories.percentages.music}%`}
            />
            <div
              style={{ width: `${categories.percentages.purchase}%` }}
              className="bg-amber-500 h-full transition-all duration-500"
              title={`Purchases: ${categories.percentages.purchase}%`}
            />
            <div
              style={{ width: `${categories.percentages.place}%` }}
              className="bg-green-500 h-full transition-all duration-500"
              title={`Places: ${categories.percentages.place}%`}
            />
          </div>
        </div>
      </div>

      {/* Grid: Most Active Time + Activity Streaks */}
      {(activeTab === "all" || activeTab === "time") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Most Active Time */}
          <div className="bg-[#080B12] border border-[#2e303a] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#E8F1FF]">Most Active Time</h3>
                <p className="text-xs text-[#94A3B8]">Temporal rhythm analysis across 24-hour cycle</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#0D111A] p-3 rounded-lg border border-[#2e303a]">
                <span className="text-xs text-[#94A3B8] block mb-1">Peak Hour Window</span>
                <span className="text-base font-bold text-cyan-400">{activeTime.peakHourLabel}</span>
                <span className="text-xs text-[#94A3B8] block mt-0.5">
                  {activeTime.peakHourCount.toLocaleString()} events
                </span>
              </div>

              <div className="bg-[#0D111A] p-3 rounded-lg border border-[#2e303a]">
                <span className="text-xs text-[#94A3B8] block mb-1">Peak Day of Week</span>
                <span className="text-base font-bold text-[#E8F1FF]">{activeTime.peakDayOfWeek}</span>
                <span className="text-xs text-[#94A3B8] block mt-0.5">
                  {activeTime.dayOfWeekCounts[activeTime.peakDayOfWeek]?.toLocaleString() || 0} events
                </span>
              </div>
            </div>

            {/* Time of Day Distribution */}
            <div className="space-y-2 mb-4">
              <span className="text-xs font-semibold text-[#94A3B8]">Daypart Activity Distribution</span>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-[#0D111A] p-2 rounded border border-[#2e303a]">
                  <span className="text-[#94A3B8] block">Morning</span>
                  <span className="font-bold text-[#E8F1FF]">{activeTime.timeOfDay.morning.toLocaleString()}</span>
                </div>
                <div className="bg-[#0D111A] p-2 rounded border border-[#2e303a]">
                  <span className="text-[#94A3B8] block">Afternoon</span>
                  <span className="font-bold text-[#E8F1FF]">{activeTime.timeOfDay.afternoon.toLocaleString()}</span>
                </div>
                <div className="bg-[#0D111A] p-2 rounded border border-[#2e303a]">
                  <span className="text-[#94A3B8] block">Evening</span>
                  <span className="font-bold text-cyan-400">{activeTime.timeOfDay.evening.toLocaleString()}</span>
                </div>
                <div className="bg-[#0D111A] p-2 rounded border border-[#2e303a]">
                  <span className="text-[#94A3B8] block">Night</span>
                  <span className="font-bold text-[#E8F1FF]">{activeTime.timeOfDay.night.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Evidence List */}
            <div className="border-t border-[#2e303a] pt-3">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-1.5">
                Data Evidence
              </span>
              <ul className="space-y-1">
                {activeTime.evidence.map((item, idx) => (
                  <li key={idx} className="text-xs text-[#94A3B8] flex items-start gap-1.5">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Activity Streaks & Busiest Periods */}
          <div className="bg-[#080B12] border border-[#2e303a] rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#E8F1FF]">Activity Streaks</h3>
                  <p className="text-xs text-[#94A3B8]">Continuous daily engagement records</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#0D111A] p-3 rounded-lg border border-[#2e303a]">
                  <span className="text-xs text-[#94A3B8] block mb-1">Longest Daily Streak</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-orange-400">{streaks.longestStreakDays}</span>
                    <span className="text-xs text-[#94A3B8]">days</span>
                  </div>
                  <span className="text-xs text-[#94A3B8] block mt-1 truncate">
                    {streaks.streakStartDate} → {streaks.streakEndDate}
                  </span>
                </div>

                <div className="bg-[#0D111A] p-3 rounded-lg border border-[#2e303a]">
                  <span className="text-xs text-[#94A3B8] block mb-1">Total Active Days</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-[#E8F1FF]">{streaks.totalActiveDays}</span>
                    <span className="text-xs text-[#94A3B8]">calendar days</span>
                  </div>
                  <span className="text-xs text-[#94A3B8] block mt-1">Logged with receipts</span>
                </div>
              </div>

              {/* Busiest Single Days */}
              <div className="mb-4">
                <span className="text-xs font-semibold text-[#94A3B8] block mb-2">Busiest Recorded Days</span>
                <div className="space-y-1.5">
                  {busiestPeriods.slice(0, 3).map((bp, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-[#0D111A] px-3 py-2 rounded-lg border border-[#2e303a] text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-[#E8F1FF] font-medium">{bp.formattedDate}</span>
                      </div>
                      <span className="font-bold text-cyan-400">{bp.eventCount} events</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Evidence List */}
            <div className="border-t border-[#2e303a] pt-3">
              <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider block mb-1.5">
                Streak Proof
              </span>
              <ul className="space-y-1">
                {streaks.evidence.map((item, idx) => (
                  <li key={idx} className="text-xs text-[#94A3B8] flex items-start gap-1.5">
                    <span className="text-orange-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Recurring Anchors (Artists, Locations, Merchants) */}
      {(activeTab === "all" || activeTab === "recurring") && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Artists */}
          <div className="bg-[#080B12] border border-[#2e303a] rounded-xl p-6">
            <div className="flex items-center gap-2.5 mb-4 text-purple-400">
              <Music className="w-5 h-5" />
              <h3 className="font-bold text-[#E8F1FF]">Recurring Artists</h3>
            </div>
            <div className="space-y-2.5">
              {recurring.artists.slice(0, 5).map((artist, idx) => (
                <div
                  key={idx}
                  className="bg-[#0D111A] p-2.5 rounded-lg border border-[#2e303a] flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <span className="font-semibold text-[#E8F1FF] block truncate">{artist.name}</span>
                    <span className="text-[#94A3B8]">{artist.details}</span>
                  </div>
                  <span className="bg-purple-500/20 text-purple-400 font-bold px-2 py-0.5 rounded">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recurring Merchants */}
          <div className="bg-[#080B12] border border-[#2e303a] rounded-xl p-6">
            <div className="flex items-center gap-2.5 mb-4 text-amber-400">
              <ShoppingBag className="w-5 h-5" />
              <h3 className="font-bold text-[#E8F1FF]">Recurring Merchants</h3>
            </div>
            <div className="space-y-2.5">
              {recurring.merchants.slice(0, 5).map((merchant, idx) => (
                <div
                  key={idx}
                  className="bg-[#0D111A] p-2.5 rounded-lg border border-[#2e303a] flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <span className="font-semibold text-[#E8F1FF] block truncate">{merchant.name}</span>
                    <span className="text-[#94A3B8]">{merchant.details}</span>
                  </div>
                  <span className="bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recurring Locations */}
          <div className="bg-[#080B12] border border-[#2e303a] rounded-xl p-6">
            <div className="flex items-center gap-2.5 mb-4 text-green-400">
              <MapPin className="w-5 h-5" />
              <h3 className="font-bold text-[#E8F1FF]">Recurring Locations</h3>
            </div>
            <div className="space-y-2.5">
              {recurring.locations.length > 0 ? (
                recurring.locations.slice(0, 5).map((loc, idx) => (
                  <div
                    key={idx}
                    className="bg-[#0D111A] p-2.5 rounded-lg border border-[#2e303a] flex items-center justify-between text-xs"
                  >
                    <div className="truncate pr-2">
                      <span className="font-semibold text-[#E8F1FF] block truncate">{loc.name}</span>
                      <span className="text-[#94A3B8]">{loc.details}</span>
                    </div>
                    <span className="bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-[#94A3B8]">
                  Location metadata recorded implicitly across transactions.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Meaningful Cross-Category Patterns */}
      {(activeTab === "all" || activeTab === "cross") && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-[#E8F1FF]">Meaningful Cross-Category Patterns</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crossCategoryPatterns.map((pattern) => (
              <div
                key={pattern.id}
                className="bg-[#080B12] border border-[#2e303a] hover:border-cyan-500/40 rounded-xl p-5 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-[#E8F1FF] text-base">{pattern.title}</h4>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <Award className="w-3 h-3" />
                    {pattern.confidenceScore}% confidence
                  </span>
                </div>

                <p className="text-xs text-[#94A3B8] mb-3 leading-relaxed">{pattern.description}</p>

                <div className="flex items-center gap-2 mb-3">
                  {pattern.categoriesInvolved.map((c) => (
                    <span
                      key={c}
                      className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#0D111A] text-[#94A3B8] border border-[#2e303a]"
                    >
                      {c}
                    </span>
                  ))}
                  <span className="text-xs text-[#94A3B8] ml-auto">
                    {pattern.occurrences.toLocaleString()} occurrences
                  </span>
                </div>

                <div className="bg-[#0D111A] rounded-lg p-2.5 border border-[#2e303a]">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-1">Direct Proof</span>
                  <ul className="space-y-1">
                    {pattern.evidence.map((ev, i) => (
                      <li key={i} className="text-xs text-[#94A3B8] flex items-start gap-1">
                        <ChevronRight className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
