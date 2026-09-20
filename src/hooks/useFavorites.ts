/**
 * useFavorites Hook
 * Persists and manages user-favorited / starred receipts in localStorage
 */

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "web_rush_favorite_receipt_ids";

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return new Set(parsed);
        }
      }
    } catch {
      // Failed to load favorites from localStorage
    }
    return new Set<string>();
  });

  // Keep localStorage synchronized
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favoriteIds)));
    } catch {
      // Failed to persist favorites to localStorage
    }
  }, [favoriteIds]);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favoriteIds.has(id),
    [favoriteIds]
  );

  const clearFavorites = useCallback(() => {
    setFavoriteIds(new Set());
  }, []);

  return {
    favoriteIds,
    favoritesCount: favoriteIds.size,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  };
}
