/**
 * Explore Page
 * Primary data investigation interface with search and filters
 */

import { useState, useMemo } from "react";
import { Search, Music, MapPin, ShoppingBag, Calendar, Filter } from "lucide-react";
import type { Receipt, ReceiptType } from "../types/index";
import { ReceiptCard } from "../components/ReceiptCard";
import { ReceiptDetail } from "../components/ReceiptDetail";
import { searchReceipts } from "../services/receiptService";
import { debounce, sanitizeSearchInput } from "../utils/helpers";

interface ExploreProps {
  receipts: Receipt[];
}

const CATEGORIES: { type: ReceiptType; label: string; icon: typeof Music }[] = [
  { type: "music", label: "Music", icon: Music },
  { type: "place", label: "Places", icon: MapPin },
  { type: "purchase", label: "Purchases", icon: ShoppingBag },
  { type: "event", label: "Events", icon: Calendar },
];

export function Explore({ receipts }: ExploreProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<ReceiptType[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((query: unknown) => {
        if (typeof query === "string") {
          setSearchQuery(sanitizeSearchInput(query));
        }
      }, 250),
    []
  );

  // Filter receipts
  const filteredReceipts = useMemo(() => {
    return searchReceipts(receipts, {
      query: searchQuery,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    });
  }, [receipts, searchQuery, selectedCategories]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    for (const receipt of filteredReceipts) {
      breakdown[receipt.type] = (breakdown[receipt.type] || 0) + 1;
    }
    return breakdown;
  }, [filteredReceipts]);

  const toggleCategory = (category: ReceiptType) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-[#05070B]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#080B12]/95 backdrop-blur-sm border-b border-[#2e303a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-[#E8F1FF] mb-4">Explore</h1>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search receipts..."
              aria-label="Search receipts"
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0D111A] border border-[#2e303a] rounded-lg text-[#E8F1FF] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Filters toggle (mobile) */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden mt-3 flex items-center gap-2 text-[#94A3B8] hover:text-[#E8F1FF]"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className={`md:w-64 ${showFilters ? "block" : "hidden md:block"}`}>
            <div className="sticky top-32">
              <div className="bg-[#080B12] rounded-lg p-4 border border-[#2e303a]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#E8F1FF]">Filters</h2>
                  {(selectedCategories.length > 0 || searchQuery) && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-sm text-cyan-400 hover:text-cyan-300"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {CATEGORIES.map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleCategory(type)}
                      aria-pressed={selectedCategories.includes(type)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        selectedCategories.includes(type)
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                          : "bg-[#0D111A] text-[#94A3B8] hover:bg-[#16171d] hover:text-[#E8F1FF]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1 text-left">{label}</span>
                      <span className="text-sm">
                        {categoryBreakdown[type] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1">
            {/* Results summary */}
            <div className="mb-6">
              <p className="text-[#94A3B8]">
                <span className="text-[#E8F1FF] font-semibold">
                  {filteredReceipts.length}
                </span>{" "}
                receipt{filteredReceipts.length !== 1 ? "s" : ""} found
              </p>
              {searchQuery && (
                <p className="text-sm text-[#94A3B8] mt-1">
                  Searching for: <span className="text-cyan-400">{searchQuery}</span>
                </p>
              )}
            </div>

            {/* Results grid */}
            {filteredReceipts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReceipts.map((receipt) => (
                  <ReceiptCard
                    key={receipt.id}
                    receipt={receipt}
                    onClick={() => setSelectedReceipt(receipt)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-[#E8F1FF] mb-2">NOTHING FOUND</p>
                <p className="text-[#94A3B8] mb-6">
                  No receipts match these filters.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                >
                  CLEAR FILTERS
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Receipt detail modal */}
      {selectedReceipt && (
        <ReceiptDetail
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
