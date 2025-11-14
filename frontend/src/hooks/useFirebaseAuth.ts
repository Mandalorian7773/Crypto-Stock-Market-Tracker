import { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useStore } from '@/store/useStore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

export const useFirebaseAuth = () => {
  const setUserId = useStore((state) => state.setUserId);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        // Try to sign in anonymously
        signInAnonymously(auth)
          .then((result) => {
            setUserId(result.user.uid);
          })
          .catch((error) => {
            console.error('Anonymous auth failed:', error);
            // Set a default user ID as fallback
            setUserId('dev-user-id');
          });
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [setUserId]);
};