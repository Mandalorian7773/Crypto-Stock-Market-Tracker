import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

// Add a symbol to a user's watchlist
export const addToWatchlist = async (userId: string, symbol: string) => {
  try {
    const userDocRef = doc(db, 'watchlists', userId);
    await updateDoc(userDocRef, {
      symbols: arrayUnion(symbol)
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return { success: false, error };
  }
};

// Remove a symbol from a user's watchlist
export const removeFromWatchlist = async (userId: string, symbol: string) => {
  try {
    const userDocRef = doc(db, 'watchlists', userId);
    await updateDoc(userDocRef, {
      symbols: arrayRemove(symbol)
    });
    return { success: true };
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return { success: false, error };
  }
};

// Get a user's watchlist
export const getWatchlist = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'watchlists', userId);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data().symbols || [] };
    } else {
      // Create a new document if it doesn't exist
      await setDoc(userDocRef, { symbols: [] });
      return { success: true, data: [] };
    }
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return { success: false, error };
  }
};

// Set a user's entire watchlist
export const setWatchlist = async (userId: string, symbols: string[]) => {
  try {
    const userDocRef = doc(db, 'watchlists', userId);
    await setDoc(userDocRef, { symbols }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error setting watchlist:', error);
    return { success: false, error };
  }
};