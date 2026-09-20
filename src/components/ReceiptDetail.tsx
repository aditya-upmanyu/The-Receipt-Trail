/**
 * Receipt Detail Modal
 * Detailed view of a single receipt with Connected Memories and Narrative Linkage
 */

import { useEffect, useState } from "react";
import { X, Music, MapPin, ShoppingBag, Calendar, ExternalLink, Star } from "lucide-react";
import type { Receipt, LifeMoment, Chapter } from "../types/index";
import { formatDateTime, formatCurrency, getCategoryColor, getCategoryLabel } from "../utils/helpers";
import { ConnectedMemories } from "./ConnectedMemories";

interface ReceiptDetailProps {
  receipt: Receipt;
  onClose: () => void;
  allReceipts?: Receipt[];
  moments?: LifeMoment[];
  chapters?: Chapter[];
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onSelectReceipt?: (receipt: Receipt) => void;
}

export function ReceiptDetail({
  receipt: initialReceipt,
  onClose,
  allReceipts = [],
  moments = [],
  chapters = [],
  isFavorite = false,
  onToggleFavorite,
  onSelectReceipt,
}: ReceiptDetailProps) {
  const [selectedRelatedId, setSelectedRelatedId] = useState<string | null>(null);
  const currentReceipt =
    (selectedRelatedId && allReceipts.find((r) => r.id === selectedRelatedId)) || initialReceipt;

  // Focus trap and escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const getIcon = () => {
    switch (currentReceipt.type) {
      case "music":
        return <Music className="w-6 h-6" />;
      case "place":
        return <MapPin className="w-6 h-6" />;
      case "purchase":
        return <ShoppingBag className="w-6 h-6" />;
      case "event":
        return <Calendar className="w-6 h-6" />;
      default:
        return null;
    }
  };

  const handleSelectRelated = (nextReceipt: Receipt) => {
    setSelectedRelatedId(nextReceipt.id);
    if (onSelectReceipt) {
      onSelectReceipt(nextReceipt);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#080B12] border border-[#2e303a] rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#080B12]/95 backdrop-blur-sm border-b border-[#2e303a] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="p-2 rounded-lg shrink-0"
              style={{ backgroundColor: `${getCategoryColor(currentReceipt.type)}20` }}
            >
              <div style={{ color: getCategoryColor(currentReceipt.type) }}>{getIcon()}</div>
            </div>
            <div className="min-w-0">
              <h2 id="receipt-title" className="text-xl font-bold text-[#E8F1FF] truncate">
                {currentReceipt.title || "Untitled Receipt"}
              </h2>
              <p className="text-sm text-[#94A3B8]">{getCategoryLabel(currentReceipt.type)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(currentReceipt.id)}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite
                    ? "text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20"
                    : "text-[#94A3B8] hover:text-yellow-400 hover:bg-[#16171d]"
                }`}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star className={`w-5 h-5 ${isFavorite ? "fill-yellow-400" : ""}`} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-[#16171d] text-[#94A3B8] hover:text-[#E8F1FF] rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Timestamp */}
          <div>
            <h3 className="text-xs uppercase font-bold text-[#94A3B8] mb-1">Timestamp</h3>
            <p className="text-[#E8F1FF]">{formatDateTime(currentReceipt.date)}</p>
          </div>

          {/* Type-specific details */}
          {currentReceipt.type === "music" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#0D111A] p-4 rounded-lg border border-[#2e303a]">
              {currentReceipt.artist && (
                <div>
                  <h3 className="text-xs uppercase font-bold text-[#94A3B8] mb-1">Artist</h3>
                  <p className="text-[#E8F1FF] font-semibold">{currentReceipt.artist}</p>
                </div>
              )}
              {currentReceipt.albumName && (
                <div>
                  <h3 className="text-xs uppercase font-bold text-[#94A3B8] mb-1">Album</h3>
                  <p className="text-[#E8F1FF]">{currentReceipt.albumName}</p>
                </div>
              )}
              {currentReceipt.msPlayed && (
                <div>
                  <h3 className="text-xs uppercase font-bold text-[#94A3B8] mb-1">Duration</h3>
                  <p className="text-[#E8F1FF] font-semibold">
                    {Math.round(currentReceipt.msPlayed / 1000 / 60)} minutes
                  </p>
                </div>
              )}
            </div>
          )}

          {currentReceipt.type === "purchase" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#0D111A] p-4 rounded-lg border border-[#2e303a]">
              <div>
                <h3 className="text-xs uppercase font-bold text-[#94A3B8] mb-1">Amount</h3>
                <p className="text-2xl font-black text-[#E8F1FF]">
                  {formatCurrency(currentReceipt.amount, currentReceipt.currency)}
                </p>
              </div>
              {currentReceipt.merchant && (
                <div>
                  <h3 className="text-xs uppercase font-bold text-[#94A3B8] mb-1">Merchant</h3>
                  <p className="text-[#E8F1FF] font-semibold">{currentReceipt.merchant}</p>
                </div>
              )}
              {currentReceipt.category && (
                <div>
                  <h3 className="text-xs uppercase font-bold text-[#94A3B8] mb-1">Category</h3>
                  <p className="text-[#E8F1FF] capitalize">{currentReceipt.category}</p>
                </div>
              )}
            </div>
          )}

          {/* Location */}
          {currentReceipt.location && (currentReceipt.location.city || currentReceipt.location.state) && (
            <div>
              <h3 className="text-xs uppercase font-bold text-[#94A3B8] mb-1">Location</h3>
              <div className="flex items-center gap-2 text-[#E8F1FF]">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>
                  {[currentReceipt.location.city, currentReceipt.location.state, currentReceipt.location.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            </div>
          )}

          {/* Description / Notes */}
          {currentReceipt.description && (
            <div>
              <h3 className="text-xs uppercase font-bold text-[#94A3B8] mb-1">Notes</h3>
              <p className="text-[#E8F1FF] leading-relaxed">{currentReceipt.description}</p>
            </div>
          )}

          {/* Source & External Link */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <h3 className="text-xs uppercase font-bold text-[#94A3B8] mb-1">Source</h3>
              <p className="text-[#E8F1FF] text-sm capitalize">{currentReceipt.source.replace(/_/g, " ")}</p>
            </div>

            {currentReceipt.type === "music" && currentReceipt.trackUri && (
              <a
                href={`https://open.spotify.com/track/${currentReceipt.trackUri}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <span>Open in Spotify</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Connected Memories & Relationship Engine */}
          <div className="border-t border-[#2e303a] pt-6">
            <ConnectedMemories
              receipt={currentReceipt}
              allReceipts={allReceipts}
              moments={moments}
              chapters={chapters}
              onSelectReceipt={handleSelectRelated}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#080B12]/95 backdrop-blur-sm border-t border-[#2e303a] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-[#0D111A] hover:bg-[#16171d] text-[#E8F1FF] rounded-lg font-medium transition-colors border border-[#2e303a]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
