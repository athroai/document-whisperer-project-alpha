
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  initializeFirestore,
  enableIndexedDbPersistence,
  doc,
  getDoc,
  CACHE_SIZE_UNLIMITED
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBVRq9wWs-Osrh4TN84www4tViKsd9lxAc",
  authDomain: "athro-ai-e33f9.firebaseapp.com",
  projectId: "athro-ai-e33f9",
  storageBucket: "athro-ai-e33f9.appspot.com",
  messagingSenderId: "612165275676",
  appId: "1:612165275676:web:bf28bc1f7426b99b178fd9",
  measurementId: "G-0HGDXV9G3F"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// Try to initialize Analytics only in browser environments
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.warn("[Firebase] Analytics initialization skipped:", error);
}

// ✅ Initialize Firestore with persistence settings FIRST
// This solves the "persistence can no longer be enabled" error
const db = initializeFirestore(app, {
  experimentalForceLongPolling: false,
  experimentalAutoDetectLongPolling: true,
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

console.log('[Firestore] Firestore instance created');

// ✅ Enable persistence BEFORE any Firestore operations
// Using a try-catch to handle errors without breaking the app
if (typeof window !== 'undefined' && navigator.onLine) {
  console.log('[Firestore] Browser online — enabling persistence...');
  
  // Wrap in async function to properly handle the promise
  (async () => {
    try {
      await enableIndexedDbPersistence(db);
      console.log('[Firestore] Persistence enabled successfully');
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        console.warn("[Firestore] Persistence failed: multiple tabs open");
      } else if (err.code === 'unimplemented') {
        console.warn("[Firestore] Persistence not supported on this platform");
      } else {
        console.error("[Firestore] Unknown persistence error:", err);
      }
    }
  })();
} else {
  console.warn("[Firestore] Offline or not in browser — skipping persistence");
}

// ✅ Storage
const storage = getStorage(app);

// ✅ Test connection (can be triggered elsewhere after setup)
export const checkFirestoreConnection = async () => {
  try {
    console.log('[Firestore] Checking connection...');
    const testDoc = doc(db, 'diagnostics', 'connection');
    await getDoc(testDoc);
    return 'connected';
  } catch (error) {
    console.warn("[Firestore] Connection failed:", error);
    return navigator.onLine ? 'error' : 'offline';
  }
};

export { app, db, storage, analytics };
