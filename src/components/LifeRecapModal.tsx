/**
 * Life Recap Modal Component
 * Visual, evidence-based digital life archive summary generated from real dataset
 */

import { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Award,
  Music,
  ShoppingBag,
  Clock,
  Copy,
  Check,
} from "lucide-react";
import type { Receipt, LifeMoment } from "../types/index";
import { useInsights } from "../hooks/useInsights";
import { formatDate } from "../utils/helpers";

interface LifeRecapModalProps {
  receipts: Receipt[];
  moments: LifeMoment[];
  isOpen: boolean;
  onClose: () => void;
}

export function LifeRecapModal({ receipts, moments, isOpen, onClose }: LifeRecapModalProps) {
  const [copied, setCopied] = useState(false);
  const insights = useInsights(receipts, moments);

  // Focus trap & Escape listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !insights) return null;

  const { activeTime, recurring, busiestPeriods, streaks } = insights;
  const topArtist = recurring.artists[0];
  const topMerchant = recurring.merchants[0];
  const busiestDay = busiestPeriods[0];
  const spotlightMoment = moments.find((m) => m.categories.length > 1) || moments[0];

  // Calculate total music hours
  const totalMusicMs = receipts.reduce((acc, r) => (r.type === "music" ? acc + (r.msPlayed || 0) : acc), 0);
  const totalMusicHours = (totalMusicMs / (1000 * 60 * 60)).toFixed(1);

  // Earliest and latest date
  const sortedDates = receipts.map((r) => r.date.getTime()).sort((a, b) => a - b);
  const earliestStr = sortedDates.length ? formatDate(new Date(sortedDates[0])) : "Archive Start";
  const latestStr = sortedDates.length ? formatDate(new Date(sortedDates[sortedDates.length - 1])) : "Archive End";

  const handleCopySummary = async () => {
    const summaryText = `📊 MY DIGITAL LIFE IN RECEIPTS RECAP (${earliestStr} - ${latestStr})
• Total Digital Footprint: ${receipts.length.toLocaleString()} verified receipts across ${moments.length} moments
• Top Music Artist: ${topArtist ? `${topArtist.name} (${topArtist.count} plays)` : "N/A"}
• Audio Footprint: ${totalMusicHours} hours logged
• Primary Merchant: ${topMerchant ? `${topMerchant.name} (${topMerchant.count} visits)` : "N/A"}
• Peak Rhythm: ${activeTime.dominantTimeOfDay} (${activeTime.peakHourLabel})
• Longest Active Streak: ${streaks.longestStreakDays} days continuous
• Busiest Day: ${busiestDay ? `${busiestDay.formattedDate} with ${busiestDay.eventCount} logged events` : "N/A"}
— Generated with Evidence-Based Grounding via Web Rush`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn("Failed to copy recap:", e);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="recap-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#080B12] border border-cyan-500/40 rounded-2xl shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-[#0D111A] hover:bg-[#16171d] text-[#94A3B8] hover:text-[#E8F1FF] rounded-lg transition-colors"
          aria-label="Close recap modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-semibold text-cyan-400 mb-3">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>VERIFIED DIGITAL LIFE ARCHIVE</span>
          </div>
          <h2 id="recap-title" className="text-2xl sm:text-3xl font-black text-[#E8F1FF] tracking-tight">
            Your Life, In Receipts Recap
          </h2>
          <p className="text-sm text-[#94A3B8] mt-1">
            {earliestStr} — {latestStr}
          </p>
        </div>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-[#0D111A] border border-[#2e303a] rounded-xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8] block mb-1">Total Events</span>
            <span className="text-xl font-extrabold text-cyan-400">{receipts.length.toLocaleString()}</span>
          </div>

          <div className="bg-[#0D111A] border border-[#2e303a] rounded-xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8] block mb-1">Music Time</span>
            <span className="text-xl font-extrabold text-purple-400">{totalMusicHours}h</span>
          </div>

          <div className="bg-[#0D111A] border border-[#2e303a] rounded-xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8] block mb-1">Life Moments</span>
            <span className="text-xl font-extrabold text-yellow-400">{moments.length}</span>
          </div>

          <div className="bg-[#0D111A] border border-[#2e303a] rounded-xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8] block mb-1">Max Streak</span>
            <span className="text-xl font-extrabold text-orange-400">{streaks.longestStreakDays}d</span>
          </div>
        </div>

        {/* Highlight Cards */}
        <div className="space-y-4 mb-8">
          {/* Soundtrack */}
          {topArtist && (
            <div className="flex items-center gap-4 bg-[#0D111A] border border-[#2e303a] rounded-xl p-4">
              <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                <Music className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs uppercase font-bold text-[#94A3B8]">Soundtrack Anchor</span>
                <h4 className="text-base font-bold text-[#E8F1FF] truncate">{topArtist.name}</h4>
                <p className="text-xs text-[#94A3B8]">{topArtist.details}</p>
              </div>
            </div>
          )}

          {/* Primary Merchant */}
          {topMerchant && (
            <div className="flex items-center gap-4 bg-[#0D111A] border border-[#2e303a] rounded-xl p-4">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs uppercase font-bold text-[#94A3B8]">Primary Spending Anchor</span>
                <h4 className="text-base font-bold text-[#E8F1FF] truncate">{topMerchant.name}</h4>
                <p className="text-xs text-[#94A3B8]">{topMerchant.details}</p>
              </div>
            </div>
          )}

          {/* Peak Temporal Rhythm */}
          <div className="flex items-center gap-4 bg-[#0D111A] border border-[#2e303a] rounded-xl p-4">
            <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs uppercase font-bold text-[#94A3B8]">Peak Daily Rhythm</span>
              <h4 className="text-base font-bold text-[#E8F1FF]">{activeTime.dominantTimeOfDay} Cadence</h4>
              <p className="text-xs text-[#94A3B8]">
                Highest activity recorded between {activeTime.peakHourLabel} ({activeTime.peakHourCount} events)
              </p>
            </div>
          </div>

          {/* Spotlight Moment */}
          {spotlightMoment && (
            <div className="bg-[#05070B] border border-cyan-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-bold text-[#E8F1FF] uppercase tracking-wider">
                  Spotlight Connected Moment
                </span>
              </div>
              <h4 className="text-sm font-bold text-cyan-400 mb-1">{spotlightMoment.title}</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">{spotlightMoment.summary}</p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#2e303a]">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-cyan-500/20"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Summary Copied to Clipboard!" : "Copy Evidence Summary"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-3 px-6 bg-[#0D111A] hover:bg-[#16171d] text-[#E8F1FF] font-medium rounded-xl border border-[#2e303a] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
