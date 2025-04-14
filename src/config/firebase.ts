
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
// Note: These are client-side public keys, so it's safe to include them in the code
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForNowReplaceWithActual",
  authDomain: "athro-ai.firebaseapp.com",
  projectId: "athro-ai",
  storageBucket: "athro-ai.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firebase persistence could not be enabled: multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firebase persistence not available in this browser');
    }
  });
} catch (err) {
  console.warn('Error setting up Firebase persistence:', err);
}

export { app, db, storage };
