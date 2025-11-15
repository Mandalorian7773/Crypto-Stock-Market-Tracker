import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreState {
  userId: string | null;
  theme: 'light' | 'dark';
  watchlist: string[];
  setUserId: (userId: string | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  setWatchlist: (watchlist: string[]) => void; // Add this
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      userId: null,
      theme: 'dark',
      watchlist: [],
      setUserId: (userId) => set({ userId }),
      setTheme: (theme) => set({ theme }),
      addToWatchlist: (symbol) =>
        set((state) => ({
          watchlist: state.watchlist.includes(symbol)
            ? state.watchlist
            : [...state.watchlist, symbol],
        })),
      removeFromWatchlist: (symbol) =>
        set((state) => ({
          watchlist: state.watchlist.filter((s) => s !== symbol),
        })),
      setWatchlist: (watchlist) => set({ watchlist }), // Add this
    }),
    {
      name: 'market-tracker-storage',
    }
  )
);