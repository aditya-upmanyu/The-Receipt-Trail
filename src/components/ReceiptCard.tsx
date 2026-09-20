/**
 * Receipt Card Component
 * Compact display for individual receipts
 */

import { Music, MapPin, ShoppingBag, Calendar } from "lucide-react";
import type { Receipt } from "../types/index";
import { formatDateTime, formatCurrency, getCategoryColor } from "../utils/helpers";

interface ReceiptCardProps {
  receipt: Receipt;
  onClick: () => void;
}

export function ReceiptCard({ receipt, onClick }: ReceiptCardProps) {
  const getIcon = () => {
    switch (receipt.type) {
      case "music":
        return <Music className="w-5 h-5" />;
      case "place":
        return <MapPin className="w-5 h-5" />;
      case "purchase":
        return <ShoppingBag className="w-5 h-5" />;
      case "event":
        return <Calendar className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getMetadata = () => {
    switch (receipt.type) {
      case "music":
        return receipt.artist || "Unknown Artist";
      case "purchase":
        return formatCurrency(receipt.amount, receipt.currency);
      case "place":
        return receipt.location?.city || receipt.location?.state || "Location";
      default:
        return null;
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left bg-[#080B12] hover:bg-[#0D111A] border border-[#2e303a] hover:border-cyan-500/50 rounded-lg p-4 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/10"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${getCategoryColor(receipt.type)}20` }}
        >
          <div style={{ color: getCategoryColor(receipt.type) }}>{getIcon()}</div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#E8F1FF] truncate group-hover:text-cyan-400 transition-colors">
            {receipt.title || "Untitled"}
          </h3>
          <p className="text-sm text-[#94A3B8]">{formatDateTime(receipt.date)}</p>
        </div>
      </div>

      {/* Metadata */}
      {getMetadata() && (
        <p className="text-sm text-[#94A3B8] mb-2">{getMetadata()}</p>
      )}

      {/* Location */}
      {receipt.location && (receipt.location.city || receipt.location.state) && (
        <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
          <MapPin className="w-3 h-3" />
          <span>
            {[receipt.location.city, receipt.location.state].filter(Boolean).join(", ")}
          </span>
        </div>
      )}

      {/* Description */}
      {receipt.description && (
        <p className="text-sm text-[#94A3B8] mt-2 line-clamp-2">
          {receipt.description}
        </p>
      )}
    </button>
  );
}
