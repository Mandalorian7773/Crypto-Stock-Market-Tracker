import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreState {
  userId: string | null;
  theme: 'light' | 'dark';
  watchlist: string[];
  emailWatchlists: Record<string, string[]>; // Store watchlists for each email
  setUserId: (userId: string | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  setWatchlist: (watchlist: string[]) => void;
  setEmailWatchlists: (emailWatchlists: Record<string, string[]>) => void; // Add this
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      userId: null,
      theme: 'dark',
      watchlist: [],
      emailWatchlists: {}, // Initialize as empty object
      setUserId: (userId) => {
        set({ userId });
        // When userId changes, load the corresponding watchlist if it's an email
        if (userId && userId.includes('@')) {
          const state = get();
          const userWatchlist = state.emailWatchlists[userId] || [];
          set({ watchlist: userWatchlist });
        }
      },
      setTheme: (theme) => set({ theme }),
      addToWatchlist: (symbol) =>
        set((state) => {
          const newWatchlist = state.watchlist.includes(symbol)
            ? state.watchlist
            : [...state.watchlist, symbol];
          
          // If current user is logged in with email, save to emailWatchlists
          if (state.userId && state.userId.includes('@')) {
            return {
              watchlist: newWatchlist,
              emailWatchlists: {
                ...state.emailWatchlists,
                [state.userId]: newWatchlist
              }
            };
          }
          return { watchlist: newWatchlist };
        }),
      removeFromWatchlist: (symbol) =>
        set((state) => {
          const newWatchlist = state.watchlist.filter((s) => s !== symbol);
          
          // If current user is logged in with email, save to emailWatchlists
          if (state.userId && state.userId.includes('@')) {
            return {
              watchlist: newWatchlist,
              emailWatchlists: {
                ...state.emailWatchlists,
                [state.userId]: newWatchlist
              }
            };
          }
          return { watchlist: newWatchlist };
        }),
      setWatchlist: (watchlist) => set({ watchlist }),
      setEmailWatchlists: (emailWatchlists) => set({ emailWatchlists }), // Add this
    }),
    {
      name: 'market-tracker-storage',
    }
  )
);