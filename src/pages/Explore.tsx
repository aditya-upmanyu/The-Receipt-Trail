/**
 * Explore Page
 * Primary investigation interface with multi-filter combinations, date range,
 * sorting, favorites system, optimized batch rendering, and polished empty states.
 */

import { useState, useMemo } from "react";
import {
  Search,
  Music,
  MapPin,
  ShoppingBag,
  Calendar,
  Filter,
  Star,
  ArrowDownUp,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { Receipt, ReceiptType, LifeMoment, Chapter } from "../types/index";
import { ReceiptCard } from "../components/ReceiptCard";
import { ReceiptDetail } from "../components/ReceiptDetail";
import { searchReceipts } from "../services/receiptService";
import { debounce, sanitizeSearchInput } from "../utils/helpers";
import { useFavorites } from "../hooks/useFavorites";

interface ExploreProps {
  receipts: Receipt[];
  moments?: LifeMoment[];
  chapters?: Chapter[];
}

type SortOption = "newest" | "oldest" | "amount" | "relevance";

const CATEGORIES: { type: ReceiptType; label: string; icon: typeof Music }[] = [
  { type: "music", label: "Music", icon: Music },
  { type: "place", label: "Places", icon: MapPin },
  { type: "purchase", label: "Purchases", icon: ShoppingBag },
  { type: "event", label: "Events", icon: Calendar },
];

const BATCH_SIZE = 36;

export function Explore({ receipts, moments = [], chapters = [] }: ExploreProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<ReceiptType[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [displayCount, setDisplayCount] = useState(BATCH_SIZE);

  const { favoriteIds, favoritesCount, toggleFavorite, isFavorite } = useFavorites();

  // Debounced search input handler
  const debouncedSearch = useMemo(
    () =>
      debounce((query: unknown) => {
        if (typeof query === "string") {
          setSearchQuery(sanitizeSearchInput(query));
          setDisplayCount(BATCH_SIZE); // Reset pagination on search
        }
      }, 250),
    []
  );

  // Quick date presets
  const applyDatePreset = (preset: "all" | "30d" | "1y") => {
    setDisplayCount(BATCH_SIZE);
    if (preset === "all") {
      setStartDate("");
      setEndDate("");
      return;
    }

    const now = new Date();
    const end = now.toISOString().split("T")[0];
    const start = new Date(now);

    if (preset === "30d") {
      start.setDate(start.getDate() - 30);
    } else if (preset === "1y") {
      start.setFullYear(start.getFullYear() - 1);
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end);
  };

  // Filter receipts
  const filteredReceipts = useMemo(() => {
    let results = receipts;

    // 1. Text search & categories using searchReceipts service
    results = searchReceipts(results, {
      query: searchQuery || undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      dateRange:
        startDate && endDate
          ? { start: new Date(startDate), end: new Date(endDate) }
          : undefined,
    });

    // 2. Favorites-only filter
    if (favoritesOnly) {
      results = results.filter((r) => favoriteIds.has(r.id));
    }

    // 3. Sorting
    const sorted = [...results];
    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => b.date.getTime() - a.date.getTime());
        break;
      case "oldest":
        sorted.sort((a, b) => a.date.getTime() - b.date.getTime());
        break;
      case "amount":
        sorted.sort((a, b) => {
          const aAmount = a.type === "purchase" ? a.amount : 0;
          const bAmount = b.type === "purchase" ? b.amount : 0;
          return bAmount - aAmount;
        });
        break;
      case "relevance":
        // Title / description presence prioritization
        sorted.sort((a, b) => {
          const aScore = (a.title ? 2 : 0) + (a.description ? 1 : 0);
          const bScore = (b.title ? 2 : 0) + (b.description ? 1 : 0);
          return bScore - aScore;
        });
        break;
    }

    return sorted;
  }, [receipts, searchQuery, selectedCategories, favoritesOnly, favoriteIds, sortBy, startDate, endDate]);

  // Category counts based on active query/dates but independent of category selection
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    for (const receipt of receipts) {
      breakdown[receipt.type] = (breakdown[receipt.type] || 0) + 1;
    }
    return breakdown;
  }, [receipts]);

  const toggleCategory = (category: ReceiptType) => {
    setDisplayCount(BATCH_SIZE);
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSearchQuery("");
    setFavoritesOnly(false);
    setStartDate("");
    setEndDate("");
    setSortBy("newest");
    setDisplayCount(BATCH_SIZE);
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    searchQuery.trim().length > 0 ||
    favoritesOnly ||
    Boolean(startDate || endDate) ||
    sortBy !== "newest";

  // Batched list for large dataset performance
  const visibleReceipts = useMemo(() => {
    return filteredReceipts.slice(0, displayCount);
  }, [filteredReceipts, displayCount]);

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + BATCH_SIZE);
  };

  return (
    <div className="min-h-screen bg-[#05070B]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#080B12]/95 backdrop-blur-sm border-b border-[#2e303a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#E8F1FF]">Explore Archive</h1>
              <p className="text-xs text-[#94A3B8]">
                Search, multi-filter, and correlate {receipts.length.toLocaleString()} verified receipts
              </p>
            </div>

            {/* Quick Favorites Toggle & Reset */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setDisplayCount(BATCH_SIZE);
                  setFavoritesOnly(!favoritesOnly);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  favoritesOnly
                    ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/50"
                    : "bg-[#0D111A] text-[#94A3B8] border border-[#2e303a] hover:text-[#E8F1FF]"
                }`}
                aria-pressed={favoritesOnly}
              >
                <Star className={`w-3.5 h-3.5 ${favoritesOnly ? "fill-yellow-400" : ""}`} />
                <span>Favorites ({favoritesCount})</span>
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#0D111A] hover:bg-[#16171d] text-cyan-400 border border-[#2e303a] rounded-lg text-xs font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
              )}
            </div>
          </div>

          {/* Search bar & Controls row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search receipts, artists, merchants, locations..."
                aria-label="Search receipts"
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#0D111A] border border-[#2e303a] rounded-lg text-sm text-[#E8F1FF] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 bg-[#0D111A] border border-[#2e303a] rounded-lg px-3 py-1.5 text-xs">
              <ArrowDownUp className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
              <label htmlFor="sort-select" className="text-[#94A3B8] shrink-0 font-medium">
                Sort:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => {
                  setDisplayCount(BATCH_SIZE);
                  setSortBy(e.target.value as SortOption);
                }}
                className="bg-transparent text-[#E8F1FF] font-medium focus:outline-none cursor-pointer"
              >
                <option value="newest" className="bg-[#0D111A]">Newest First</option>
                <option value="oldest" className="bg-[#0D111A]">Oldest First</option>
                <option value="amount" className="bg-[#0D111A]">Highest Spend</option>
                <option value="relevance" className="bg-[#0D111A]">Relevance</option>
              </select>
            </div>

            {/* Filters toggle (mobile) */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-4 py-2 bg-[#0D111A] border border-[#2e303a] rounded-lg text-xs font-semibold text-[#94A3B8] hover:text-[#E8F1FF]"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className={`md:w-64 shrink-0 ${showFilters ? "block" : "hidden md:block"}`}>
            <div className="sticky top-40 space-y-4">
              {/* Category Filters */}
              <div className="bg-[#080B12] rounded-xl p-4 border border-[#2e303a]">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-[#E8F1FF] uppercase tracking-wider">Categories</h2>
                  {selectedCategories.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategories([])}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {CATEGORIES.map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleCategory(type)}
                      aria-pressed={selectedCategories.includes(type)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors ${
                        selectedCategories.includes(type)
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 font-semibold"
                          : "bg-[#0D111A] text-[#94A3B8] hover:bg-[#16171d] hover:text-[#E8F1FF]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="flex-1 text-left">{label}</span>
                      <span className="text-[11px] font-mono opacity-80">
                        {categoryBreakdown[type] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range Filters */}
              <div className="bg-[#080B12] rounded-xl p-4 border border-[#2e303a] space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[#E8F1FF] uppercase tracking-wider">Date Range</h2>
                  {(startDate || endDate) && (
                    <button
                      type="button"
                      onClick={() => applyDatePreset("all")}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Quick presets */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyDatePreset("all")}
                    className={`px-2 py-1 rounded text-[11px] font-medium ${
                      !startDate && !endDate
                        ? "bg-cyan-500 text-white"
                        : "bg-[#0D111A] text-[#94A3B8] hover:bg-[#16171d]"
                    }`}
                  >
                    All Time
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDatePreset("30d")}
                    className="px-2 py-1 rounded text-[11px] font-medium bg-[#0D111A] text-[#94A3B8] hover:bg-[#16171d]"
                  >
                    Last 30d
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDatePreset("1y")}
                    className="px-2 py-1 rounded text-[11px] font-medium bg-[#0D111A] text-[#94A3B8] hover:bg-[#16171d]"
                  >
                    Past 1y
                  </button>
                </div>

                {/* Date Inputs */}
                <div className="space-y-2 text-xs">
                  <div>
                    <label htmlFor="start-date" className="text-[#94A3B8] block mb-1">
                      From Date
                    </label>
                    <input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setDisplayCount(BATCH_SIZE);
                        setStartDate(e.target.value);
                      }}
                      className="w-full bg-[#0D111A] border border-[#2e303a] rounded-lg px-2.5 py-1.5 text-[#E8F1FF] focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="end-date" className="text-[#94A3B8] block mb-1">
                      To Date
                    </label>
                    <input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setDisplayCount(BATCH_SIZE);
                        setEndDate(e.target.value);
                      }}
                      className="w-full bg-[#0D111A] border border-[#2e303a] rounded-lg px-2.5 py-1.5 text-[#E8F1FF] focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Results summary bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6 bg-[#080B12] p-3 rounded-lg border border-[#2e303a] text-xs">
              <p className="text-[#94A3B8]">
                Showing{" "}
                <span className="text-[#E8F1FF] font-bold">
                  {Math.min(visibleReceipts.length, filteredReceipts.length)}
                </span>{" "}
                of <span className="text-cyan-400 font-bold">{filteredReceipts.length.toLocaleString()}</span> receipts
                {favoritesOnly && <span className="text-yellow-400 ml-1 font-semibold">(Favorites Only)</span>}
              </p>

              {searchQuery && (
                <p className="text-[#94A3B8]">
                  Query: <span className="text-cyan-400 font-medium">"{searchQuery}"</span>
                </p>
              )}
            </div>

            {/* Results grid */}
            {visibleReceipts.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleReceipts.map((receipt) => (
                    <ReceiptCard
                      key={receipt.id}
                      receipt={receipt}
                      onClick={() => setSelectedReceipt(receipt)}
                      isFavorite={isFavorite(receipt.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>

                {/* Load More Button for large dataset performance */}
                {visibleReceipts.length < filteredReceipts.length && (
                  <div className="text-center pt-4">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      className="px-6 py-2.5 bg-[#0D111A] hover:bg-[#16171d] text-cyan-400 font-semibold rounded-lg border border-cyan-500/40 transition-colors text-xs"
                    >
                      Load More Receipts ({filteredReceipts.length - visibleReceipts.length} remaining)
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Polished empty states */
              <div className="text-center py-16 bg-[#080B12] border border-[#2e303a] rounded-xl p-8">
                {favoritesOnly ? (
                  <>
                    <Star className="w-12 h-12 text-yellow-400/50 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-[#E8F1FF] mb-2">NO FAVORITES SAVED YET</h3>
                    <p className="text-xs text-[#94A3B8] max-w-sm mx-auto mb-6">
                      Click the star icon on any receipt card to bookmark important memories and expenditures here.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFavoritesOnly(false)}
                      className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg text-xs transition-colors"
                    >
                      Show All Receipts
                    </button>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-[#E8F1FF] mb-2">NO MATCHING RECEIPTS</h3>
                    <p className="text-xs text-[#94A3B8] max-w-sm mx-auto mb-6">
                      Try broadening your search query, clearing date constraints, or unchecking specific category filters.
                    </p>
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg text-xs transition-colors"
                    >
                      CLEAR ALL FILTERS
                    </button>
                  </>
                )}
              </div>
            )}
          </main>
        </div>
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
    </div>
  );
}
