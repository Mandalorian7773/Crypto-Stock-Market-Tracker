import { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useStore } from '@/store/useStore';
import { onAuthStateChanged } from 'firebase/auth';

export const useFirebaseAuth = () => {
  const setUserId = useStore((state) => state.setUserId);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        // Set a default user ID when not authenticated
        setUserId('dev-user-id');
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [setUserId]);
};