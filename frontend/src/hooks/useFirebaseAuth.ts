import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export const useFirebaseAuth = () => {
  const setUserId = useStore((state) => state.setUserId);

  useEffect(() => {
    // Generate a random session ID when the app loads
    const sessionId = `session_${Math.random().toString(36).substr(2, 9)}`;
    setUserId(sessionId);
  }, [setUserId]);
};