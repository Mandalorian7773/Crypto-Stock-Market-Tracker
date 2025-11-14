import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Check if Firebase environment variables are available
const hasFirebaseConfig = import.meta.env.VITE_FIREBASE_API_KEY && 
                         import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
                         import.meta.env.VITE_FIREBASE_PROJECT_ID;

let app, auth, db;

if (hasFirebaseConfig) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // Create a mock Firebase setup when config is missing
  console.warn('Firebase configuration missing. Authentication features will be disabled.');
  app = null;
  auth = {
    onAuthStateChanged: (callback: any) => {
      // Simulate anonymous auth for development
      setTimeout(() => {
        callback({ uid: 'dev-user-id' });
      }, 0);
      return () => {};
    },
    signInAnonymously: () => Promise.resolve({ user: { uid: 'dev-user-id' } })
  };
  db = null;
}

export { auth, db };