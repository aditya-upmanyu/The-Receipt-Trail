/**
 * Component Tests for Key User Flows
 * Testing ReceiptCard, ReceiptDetail, ConnectedMemories, PatternInsights, and LifeRecapModal
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { LifeMoment, MusicReceipt, PurchaseReceipt, Chapter } from "../types/index";
import { ReceiptCard } from "../components/ReceiptCard";
import { ReceiptDetail } from "../components/ReceiptDetail";
import { ConnectedMemories } from "../components/ConnectedMemories";
import { PatternInsights } from "../components/PatternInsights";
import { LifeRecapModal } from "../components/LifeRecapModal";

const mockMusic: MusicReceipt = {
  id: "music-123",
  type: "music",
  title: "Get Lucky",
  artist: "Daft Punk",
  albumName: "Random Access Memories",
  timestamp: "2024-04-12T20:15:00Z",
  date: new Date("2024-04-12T20:15:00Z"),
  source: "spotify",
  msPlayed: 248000,
  trackUri: "spotify:track:123",
};

const mockPurchase: PurchaseReceipt = {
  id: "purchase-456",
  type: "purchase",
  title: "Dinner & Drinks",
  merchant: "Bistro Deluxe",
  amount: 85.5,
  currency: "USD",
  category: "Dining",
  timestamp: "2024-04-12T21:00:00Z",
  date: new Date("2024-04-12T21:00:00Z"),
  source: "household",
};

const mockMoments: LifeMoment[] = [
  {
    id: "moment-1",
    title: "Friday Night Celebration",
    receipts: [mockMusic, mockPurchase],
    receiptIds: ["music-123", "purchase-456"],
    startTime: new Date("2024-04-12T20:00:00Z"),
    endTime: new Date("2024-04-12T22:30:00Z"),
    categories: ["music", "purchase"],
    locations: [],
    connections: [
      {
        id: "c1",
        receiptId1: "music-123",
        receiptId2: "purchase-456",
        type: "temporal",
        score: 85,
        reason: "Occurred within 45 minutes of each other",
        details: {},
        strength: "strong",
      },
    ],
    summary: "Celebratory dining with Daft Punk soundtrack.",
    evidence: ["Temporal convergence within 45 minutes"],
    timeSpanMinutes: 150,
  },
];

const mockChapters: Chapter[] = [
  {
    id: "chapter-1",
    number: 1,
    title: "Spring Discoveries",
    description: "An active period of social outings and music sessions.",
    moments: mockMoments,
    momentIds: ["moment-1"],
    startDate: new Date("2024-04-01"),
    endDate: new Date("2024-04-30"),
    receipts: [mockMusic, mockPurchase],
    receiptIds: ["music-123", "purchase-456"],
    patterns: [],
    evidence: ["High concentration of dining and music events"],
    dominantCategories: ["music", "purchase"],
    activityLevel: "high",
  },
];

describe("ReceiptCard Component", () => {
  it("renders receipt details correctly", () => {
    const handleClick = vi.fn();
    render(<ReceiptCard receipt={mockMusic} onClick={handleClick} />);

    expect(screen.getByText("Get Lucky")).toBeInTheDocument();
    expect(screen.getByText("Daft Punk")).toBeInTheDocument();
  });

  it("handles click and favorite toggling", () => {
    const handleClick = vi.fn();
    const handleToggleFavorite = vi.fn();

    render(
      <ReceiptCard
        receipt={mockMusic}
        onClick={handleClick}
        isFavorite={false}
        onToggleFavorite={handleToggleFavorite}
      />
    );

    const card = screen.getByText("Get Lucky").closest('[role="button"]')!;
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalled();

    const starBtn = screen.getByLabelText("Add to favorites");
    fireEvent.click(starBtn);
    expect(handleToggleFavorite).toHaveBeenCalledWith("music-123");
  });
});

describe("ReceiptDetail Component", () => {
  it("renders modal with complete metadata and connected memories", () => {
    const handleClose = vi.fn();

    render(
      <ReceiptDetail
        receipt={mockMusic}
        onClose={handleClose}
        allReceipts={[mockMusic, mockPurchase]}
        moments={mockMoments}
        chapters={mockChapters}
      />
    );

    expect(screen.getByRole("heading", { name: "Get Lucky" })).toBeInTheDocument();
    expect(screen.getByText("Random Access Memories")).toBeInTheDocument();
    expect(screen.getByText("Narrative Trail Hierarchy")).toBeInTheDocument();
    expect(screen.getAllByText("Friday Night Celebration")[0]).toBeInTheDocument();

    const closeBtn = screen.getAllByRole("button", { name: "Close" })[0];
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});

describe("ConnectedMemories Component", () => {
  it("displays narrative linkages from receipt to moment to chapter", () => {
    render(
      <ConnectedMemories
        receipt={mockMusic}
        allReceipts={[mockMusic, mockPurchase]}
        moments={mockMoments}
        chapters={mockChapters}
      />
    );

    expect(screen.getByText("Narrative Trail Hierarchy")).toBeInTheDocument();
    expect(screen.getByText("This Receipt")).toBeInTheDocument();
    expect(screen.getAllByText("Friday Night Celebration")[0]).toBeInTheDocument();
    expect(screen.getByText("Chapter 1: Spring Discoveries")).toBeInTheDocument();
    expect(screen.getByText(/Occurred within 45 minutes/i)).toBeInTheDocument();
  });
});

describe("PatternInsights Component", () => {
  it("renders evidence-based behavioral patterns", () => {
    render(<PatternInsights receipts={[mockMusic, mockPurchase]} moments={mockMoments} />);

    expect(screen.getByText("Life Insights & Behavioral Patterns")).toBeInTheDocument();
    expect(screen.getByText("Most Active Time")).toBeInTheDocument();
    expect(screen.getByText("Activity Streaks")).toBeInTheDocument();
  });
});

describe("LifeRecapModal Component", () => {
  it("renders the digital life archive recap modal when open", () => {
    const handleClose = vi.fn();

    render(
      <LifeRecapModal
        receipts={[mockMusic, mockPurchase]}
        moments={mockMoments}
        isOpen={true}
        onClose={handleClose}
      />
    );

    expect(screen.getByText("Your Life, In Receipts Recap")).toBeInTheDocument();
    expect(screen.getByText("Daft Punk")).toBeInTheDocument();
    expect(screen.getByText("Bistro Deluxe")).toBeInTheDocument();

    const doneBtn = screen.getByRole("button", { name: "Done" });
    fireEvent.click(doneBtn);
    expect(handleClose).toHaveBeenCalled();
  });

  it("does not render when closed", () => {
    render(
      <LifeRecapModal
        receipts={[mockMusic, mockPurchase]}
        moments={mockMoments}
        isOpen={false}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByText("Your Life, In Receipts Recap")).not.toBeInTheDocument();
  });
});
