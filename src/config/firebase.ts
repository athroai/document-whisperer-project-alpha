
import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
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

// Initialize Firestore with persistence configuration
// Using the new recommended approach instead of enableIndexedDbPersistence
const db = initializeFirestore(app, {
  cache: {
    sizeBytes: CACHE_SIZE_UNLIMITED
  }
});

const storage = getStorage(app);

export { app, db, storage };
