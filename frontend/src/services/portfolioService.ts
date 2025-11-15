import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, deleteField } from 'firebase/firestore';

// Add an item to user's portfolio
export const addToPortfolio = async (userId: string, portfolioItem: any) => {
  try {
    const userDocRef = doc(db, 'portfolios', userId);
    const itemKey = `${portfolioItem.symbol}_${portfolioItem.type}`;
    
    // Use setDoc with merge to create/update the document
    await setDoc(userDocRef, {
      [itemKey]: {
        ...portfolioItem,
        createdAt: new Date().toISOString()
      }
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error('Error adding to portfolio:', error);
    return { success: false, error };
  }
};

// Remove an item from user's portfolio
export const removeFromPortfolio = async (userId: string, symbol: string, type: string) => {
  try {
    const userDocRef = doc(db, 'portfolios', userId);
    const itemKey = `${symbol}_${type}`;
    
    // Remove the specific field from the document
    await updateDoc(userDocRef, {
      [itemKey]: deleteField()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error removing from portfolio:', error);
    return { success: false, error };
  }
};

// Get user's portfolio
export const getPortfolio = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'portfolios', userId);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Convert the object structure to an array
      const portfolioItems = Object.values(data).map((item: any) => ({
        ...item
      }));
      return { success: true, data: portfolioItems };
    } else {
      // Create a new document if it doesn't exist
      await setDoc(userDocRef, {});
      return { success: true, data: [] };
    }
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return { success: false, error };
  }
};