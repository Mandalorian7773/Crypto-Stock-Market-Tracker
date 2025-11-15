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
        // Generate a random session ID when not authenticated
        const sessionId = `session_${Math.random().toString(36).substr(2, 9)}`;
        setUserId(sessionId);
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [setUserId]);
};