import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getWatchlist, addToWatchlist, removeFromWatchlist, setWatchlist } from '@/services/watchlistService';

interface StoreState {
  userId: string | null;
  theme: 'light' | 'dark';
  watchlist: string[];
  setUserId: (userId: string | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  setWatchlist: (watchlist: string[]) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      userId: null,
      theme: 'dark',
      watchlist: [],
      setUserId: (userId) => {
        set({ userId });
        // When userId changes, load the corresponding watchlist if it's an email
        if (userId && userId.includes('@')) {
          // Load watchlist from Firebase
          getWatchlist(userId).then(result => {
            if (result.success) {
              set({ watchlist: result.data });
            }
          });
        }
      },
      setTheme: (theme) => set({ theme }),
      addToWatchlist: (symbol) => {
        const state = get();
        const newWatchlist = state.watchlist.includes(symbol)
          ? state.watchlist
          : [...state.watchlist, symbol];
        
        set({ watchlist: newWatchlist });
        
        // If current user is logged in with email, save to Firebase
        if (state.userId && state.userId.includes('@')) {
          addToWatchlist(state.userId, symbol);
        }
      },
      removeFromWatchlist: (symbol) => {
        const state = get();
        const newWatchlist = state.watchlist.filter((s) => s !== symbol);
        
        set({ watchlist: newWatchlist });
        
        // If current user is logged in with email, save to Firebase
        if (state.userId && state.userId.includes('@')) {
          removeFromWatchlist(state.userId, symbol);
        }
      },
      setWatchlist: (watchlist) => {
        const state = get();
        set({ watchlist });
        
        // If current user is logged in with email, save to Firebase
        if (state.userId && state.userId.includes('@')) {
          setWatchlist(state.userId, watchlist);
        }
      },
    }),
    {
      name: 'market-tracker-storage',
      partialize: (state) => ({ 
        theme: state.theme,
        // Don't persist watchlist and userId to localStorage since we're using Firebase
        // Only persist theme settings
      }),
    }
  )
);