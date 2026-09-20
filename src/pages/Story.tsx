/**
 * Story Page
 * Evidence-based narrative storytelling through chapters
 */

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, FileText } from "lucide-react";
import type { Chapter } from "../types/index";
import { formatDate, getCategoryLabel } from "../utils/helpers";

interface StoryProps {
  chapters: Chapter[];
}

export function Story({ chapters }: StoryProps) {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  if (chapters.length === 0) {
    return (
      <div className="min-h-screen bg-[#05070B] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <FileText className="w-16 h-16 text-[#94A3B8] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#E8F1FF] mb-2">NO STORY YET</h2>
          <p className="text-[#94A3B8]">
            Not enough moments detected to create a story. Explore more receipts to discover
            connections.
          </p>
        </div>
      </div>
    );
  }

  const currentChapter = chapters[currentChapterIndex];

  const goToPrevious = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05070B] via-[#080B12] to-[#0D111A]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Chapter navigation */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#94A3B8] mb-1">
              CHAPTER {currentChapter.number.toString().padStart(2, "0")} / {chapters.length.toString().padStart(2, "0")}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#E8F1FF]">
              {currentChapter.title}
            </h1>
          </div>
        </div>

        {/* Chapter content */}
        <div className="bg-[#080B12]/50 backdrop-blur-sm border border-[#2e303a] rounded-lg p-6 md:p-8 mb-8">
          {/* Date range */}
          <div className="flex items-center gap-2 text-[#94A3B8] mb-6">
            <Calendar className="w-5 h-5" />
            <span>
              {formatDate(currentChapter.startDate)} — {formatDate(currentChapter.endDate)}
            </span>
          </div>

          {/* Description */}
          <p className="text-lg text-[#E8F1FF] mb-6 leading-relaxed">
            {currentChapter.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#0D111A] rounded-lg p-4 border border-[#2e303a]">
              <p className="text-2xl font-bold text-cyan-400">{currentChapter.moments.length}</p>
              <p className="text-sm text-[#94A3B8]">Moments</p>
            </div>
            <div className="bg-[#0D111A] rounded-lg p-4 border border-[#2e303a]">
              <p className="text-2xl font-bold text-cyan-400">{currentChapter.receipts.length}</p>
              <p className="text-sm text-[#94A3B8]">Activities</p>
            </div>
            <div className="bg-[#0D111A] rounded-lg p-4 border border-[#2e303a]">
              <p className="text-2xl font-bold text-cyan-400 capitalize">
                {currentChapter.activityLevel}
              </p>
              <p className="text-sm text-[#94A3B8]">Activity</p>
            </div>
            <div className="bg-[#0D111A] rounded-lg p-4 border border-[#2e303a]">
              <p className="text-2xl font-bold text-cyan-400">{currentChapter.patterns.length}</p>
              <p className="text-sm text-[#94A3B8]">Patterns</p>
            </div>
          </div>

          {/* Dominant categories */}
          {currentChapter.dominantCategories.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-[#94A3B8] mb-3">Dominant Activities</h3>
              <div className="flex flex-wrap gap-2">
                {currentChapter.dominantCategories.map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-full text-sm"
                  >
                    {getCategoryLabel(cat)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Patterns */}
          {currentChapter.patterns.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-[#94A3B8] mb-3">Notable Patterns</h3>
              <div className="space-y-3">
                {currentChapter.patterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    className="bg-[#0D111A] rounded-lg p-4 border border-[#2e303a]"
                  >
                    <h4 className="font-semibold text-[#E8F1FF] mb-1">{pattern.title}</h4>
                    <p className="text-sm text-[#94A3B8] mb-2">{pattern.description}</p>
                    {pattern.evidence.length > 0 && (
                      <ul className="text-xs text-[#94A3B8] space-y-1">
                        {pattern.evidence.map((ev, i) => (
                          <li key={i}>• {ev}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence */}
          <div>
            <h3 className="text-sm font-semibold text-[#94A3B8] mb-3">Evidence</h3>
            <ul className="space-y-2">
              {currentChapter.evidence.map((ev, i) => (
                <li key={i} className="flex items-start gap-2 text-[#94A3B8]">
                  <span className="text-cyan-400">→</span>
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goToPrevious}
            disabled={currentChapterIndex === 0}
            className="flex items-center gap-2 px-6 py-3 bg-[#080B12] hover:bg-[#0D111A] disabled:opacity-50 disabled:cursor-not-allowed text-[#E8F1FF] border border-[#2e303a] rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          <div className="flex gap-2">
            {chapters.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentChapterIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentChapterIndex ? "bg-cyan-400" : "bg-[#2e303a] hover:bg-[#94A3B8]"
                }`}
                aria-label={`Go to chapter ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goToNext}
            disabled={currentChapterIndex === chapters.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-[#080B12] hover:bg-[#0D111A] disabled:opacity-50 disabled:cursor-not-allowed text-[#E8F1FF] border border-[#2e303a] rounded-lg transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
