/**
 * Receipt Detail Modal
 * Detailed view of a single receipt with connections
 */

import { useEffect } from "react";
import { X, Music, MapPin, ShoppingBag, Calendar, ExternalLink } from "lucide-react";
import type { Receipt } from "../types/index";
import { formatDateTime, formatCurrency, getCategoryColor, getCategoryLabel } from "../utils/helpers";

interface ReceiptDetailProps {
  receipt: Receipt;
  onClose: () => void;
}

export function ReceiptDetail({ receipt, onClose }: ReceiptDetailProps) {
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
    switch (receipt.type) {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#080B12] border border-[#2e303a] rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#080B12] border-b border-[#2e303a] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${getCategoryColor(receipt.type)}20` }}
            >
              <div style={{ color: getCategoryColor(receipt.type) }}>{getIcon()}</div>
            </div>
            <div>
              <h2 id="receipt-title" className="text-xl font-bold text-[#E8F1FF]">
                {receipt.title || "Untitled Receipt"}
              </h2>
              <p className="text-sm text-[#94A3B8]">{getCategoryLabel(receipt.type)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-[#16171d] rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-[#94A3B8]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Timestamp */}
          <div>
            <h3 className="text-sm font-semibold text-[#94A3B8] mb-1">Timestamp</h3>
            <p className="text-[#E8F1FF]">{formatDateTime(receipt.date)}</p>
          </div>

          {/* Type-specific details */}
          {receipt.type === "music" && (
            <>
              {receipt.artist && (
                <div>
                  <h3 className="text-sm font-semibold text-[#94A3B8] mb-1">Artist</h3>
                  <p className="text-[#E8F1FF]">{receipt.artist}</p>
                </div>
              )}
              {receipt.albumName && (
                <div>
                  <h3 className="text-sm font-semibold text-[#94A3B8] mb-1">Album</h3>
                  <p className="text-[#E8F1FF]">{receipt.albumName}</p>
                </div>
              )}
              {receipt.msPlayed && (
                <div>
                  <h3 className="text-sm font-semibold text-[#94A3B8] mb-1">Duration</h3>
                  <p className="text-[#E8F1FF]">
                    {Math.round(receipt.msPlayed / 1000 / 60)} minutes
                  </p>
                </div>
              )}
            </>
          )}

          {receipt.type === "purchase" && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-[#94A3B8] mb-1">Amount</h3>
                <p className="text-2xl font-bold text-[#E8F1FF]">
                  {formatCurrency(receipt.amount, receipt.currency)}
                </p>
              </div>
              {receipt.merchant && (
                <div>
                  <h3 className="text-sm font-semibold text-[#94A3B8] mb-1">Merchant</h3>
                  <p className="text-[#E8F1FF]">{receipt.merchant}</p>
                </div>
              )}
              {receipt.category && (
                <div>
                  <h3 className="text-sm font-semibold text-[#94A3B8] mb-1">Category</h3>
                  <p className="text-[#E8F1FF] capitalize">{receipt.category}</p>
                </div>
              )}
            </>
          )}

          {/* Location */}
          {receipt.location && (receipt.location.city || receipt.location.state) && (
            <div>
              <h3 className="text-sm font-semibold text-[#94A3B8] mb-1">Location</h3>
              <div className="flex items-center gap-2 text-[#E8F1FF]">
                <MapPin className="w-4 h-4" />
                <span>
                  {[receipt.location.city, receipt.location.state, receipt.location.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            </div>
          )}

          {/* Description */}
          {receipt.description && (
            <div>
              <h3 className="text-sm font-semibold text-[#94A3B8] mb-1">Notes</h3>
              <p className="text-[#E8F1FF]">{receipt.description}</p>
            </div>
          )}

          {/* Source */}
          <div>
            <h3 className="text-sm font-semibold text-[#94A3B8] mb-1">Source</h3>
            <p className="text-[#E8F1FF] capitalize">{receipt.source.replace(/_/g, " ")}</p>
          </div>

          {/* External link (if applicable) */}
          {receipt.type === "music" && receipt.trackUri && (
            <a
              href={`https://open.spotify.com/track/${receipt.trackUri}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <span>Open in Spotify</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#080B12] border-t border-[#2e303a] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 bg-[#0D111A] hover:bg-[#16171d] text-[#E8F1FF] rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
