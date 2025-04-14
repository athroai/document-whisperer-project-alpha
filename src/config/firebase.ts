
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  initializeFirestore,
  enableIndexedDbPersistence,
  doc,
  getDoc,
  CACHE_SIZE_UNLIMITED,
  persistentLocalCache,
  persistentSingleTabManager
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

// ✅ Create Firestore with persistence already built-in
// This completely avoids the "persistence can no longer be enabled" error
// by configuring persistence at initialization time
const db = initializeFirestore(app, {
  localCache: typeof window !== 'undefined' ? 
    persistentLocalCache({
      tabManager: persistentSingleTabManager({ synchronizeTabs: true }),
      cacheSizeBytes: CACHE_SIZE_UNLIMITED
    }) : undefined,
  experimentalForceLongPolling: false,
  experimentalAutoDetectLongPolling: true
});

console.log('[Firestore] Firestore instance created with built-in persistence');

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
