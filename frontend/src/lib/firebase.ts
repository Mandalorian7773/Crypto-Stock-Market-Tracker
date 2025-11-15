import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7O0elx2ytwgeXJ1q5hb-hZcg4NfDYhgI",
  authDomain: "cryptoandstocktracker.firebaseapp.com",
  projectId: "cryptoandstocktracker",
  storageBucket: "cryptoandstocktracker.firebasestorage.app",
  messagingSenderId: "1027177488450",
  appId: "1:1027177488450:web:87c85a86c5965d063b4ddb",
  measurementId: "G-5572ZE4ZQ2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Enable authentication persistence
// This will be handled by Firebase automatically

export { auth, db, analytics };