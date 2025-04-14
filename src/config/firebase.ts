
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

// Initialize Firestore with settings optimized for web
const db = initializeFirestore(app, {
  experimentalForceLongPolling: false, // Use WebSockets when available
  experimentalAutoDetectLongPolling: true,
});

// Only enable persistence if we're online
// This prevents unnecessary offline mode activation
if (navigator.onLine) {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab
      console.warn("Firestore persistence unavailable - multiple tabs open");
    } else if (err.code === 'unimplemented') {
      // Current browser doesn't support persistence
      console.warn("Firestore persistence not supported in this browser");
    } else {
      console.error("Firestore persistence error:", err);
    }
  });
} else {
  console.warn("Browser appears to be offline, skipping persistence initialization");
}

const storage = getStorage(app);

// Export connection status checker
export const checkFirestoreConnection = async () => {
  try {
    // Perform a simple test read to verify connection
    const testRef = db.collection('_connection_test').doc('test');
    await testRef.get({ source: 'server' });
    return 'connected';
  } catch (error) {
    console.warn("Firestore connection check failed:", error);
    return navigator.onLine ? 'error' : 'offline';
  }
};

export { app, db, storage };
