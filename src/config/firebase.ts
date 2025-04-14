
import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, enableIndexedDbPersistence, collection, doc, getDoc } from "firebase/firestore";
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

console.log('[Firebase] Initializing app...');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('[Firebase] App initialized:', app.name);

// Initialize Firestore with settings optimized for web
const db = initializeFirestore(app, {
  experimentalForceLongPolling: false, // Use WebSockets when available
  experimentalAutoDetectLongPolling: true,
});
console.log('[Firestore] Firestore instance created');

// Only enable persistence if we're online
// This prevents unnecessary offline mode activation
if (navigator.onLine) {
  console.log('[Firestore] Browser reports online, enabling persistence...');
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab
      console.warn("[Firestore] Persistence unavailable - multiple tabs open");
    } else if (err.code === 'unimplemented') {
      // Current browser doesn't support persistence
      console.warn("[Firestore] Persistence not supported in this browser");
    } else {
      console.error("[Firestore] Persistence error:", err);
    }
  });
} else {
  console.warn("[Firestore] Browser appears to be offline, skipping persistence initialization");
}

const storage = getStorage(app);

// Export connection status checker
export const checkFirestoreConnection = async () => {
  try {
    console.log('[Firestore] Testing connection...');
    // Perform a simple test read to verify connection
    const testDoc = doc(db, 'diagnostics', 'connection');
    await getDoc(testDoc);
    console.log('[Firestore] Connection test successful');
    return 'connected';
  } catch (error) {
    console.warn("[Firestore] Connection check failed:", error);
    return navigator.onLine ? 'error' : 'offline';
  }
};

export { app, db, storage };
