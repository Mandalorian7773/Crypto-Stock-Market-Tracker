import { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useStore } from '@/store/useStore';

export const useFirebaseAuth = () => {
  const setUserId = useStore((state) => state.setUserId);

  useEffect(() => {
    // Check if auth is properly configured
    if (!auth || !auth.onAuthStateChanged) {
      // Set a default user ID for development
      setUserId('dev-user-id');
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        // Try to sign in anonymously
        if (auth.signInAnonymously) {
          auth.signInAnonymously()
            .then((result: any) => {
              setUserId(result.user.uid);
            })
            .catch((error: any) => {
              console.error('Anonymous auth failed:', error);
              // Set a default user ID as fallback
              setUserId('dev-user-id');
            });
        } else {
          // Set a default user ID as fallback
          setUserId('dev-user-id');
        }
      }
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [setUserId]);
};