
import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, enableIndexedDbPersistence } from "firebase/firestore";
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

// Initialize Firestore with indexed DB persistence
const db = initializeFirestore(app, {
  // Remove the 'cache' property and use enableIndexedDbPersistence instead
});

// Enable IndexedDB persistence
enableIndexedDbPersistence(db).catch((err) => {
  console.error("Firestore persistence error:", err);
});

const storage = getStorage(app);

export { app, db, storage };
