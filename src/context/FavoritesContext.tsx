import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { FavoriteVenue } from '../types';

const KEY = 'linkup_favorite_venues';

interface FavoritesState {
  favorites: FavoriteVenue[];
  addFavorite: (name: string, parish: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (name: string, parish: string) => boolean;
}

const FavoritesContext = createContext<FavoritesState | null>(null);

function loadFavorites(): FavoriteVenue[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveFavorites(list: FavoriteVenue[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // storage unavailable — favorites just won't persist this session
  }
}

/**
 * Quick-pick list of venues you've typed in before, so you don't have to
 * retype "the usual spot" every time. Purely local to this device — no
 * account needed, nothing shared with anyone. Once official venue
 * partnerships exist, this is the natural place to add a verified
 * directory people select from instead of typing.
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteVenue[]>(() => loadFavorites());

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const isFavorite = (name: string, parish: string) =>
    favorites.some((f) => f.name.trim().toLowerCase() === name.trim().toLowerCase() && f.parish === parish);

  const addFavorite = (name: string, parish: string) => {
    const trimmed = name.trim();
    if (!trimmed || isFavorite(trimmed, parish)) return;
    setFavorites((prev) => [...prev, { id: `fav-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: trimmed, parish }]);
  };

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoriteVenues() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavoriteVenues must be used within FavoritesProvider');
  return ctx;
}
