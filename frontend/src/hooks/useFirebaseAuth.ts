import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export const useFirebaseAuth = () => {
  const userId = useStore((state) => state.userId);
  const setUserId = useStore((state) => state.setUserId);

  useEffect(() => {
    // Only generate a session ID if there's no existing user ID
    if (!userId) {
      // Generate a random session ID when the app loads
      const sessionId = `session_${Math.random().toString(36).substr(2, 9)}`;
      setUserId(sessionId);
    }
  }, [userId, setUserId]);
};