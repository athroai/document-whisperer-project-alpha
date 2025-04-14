
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  initializeFirestore,
  doc,
  getDoc,
  CACHE_SIZE_UNLIMITED,
  persistentLocalCache,
  persistentMultipleTabManager
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

// ✅ Analytics (guarded for SSR)
let analytics: ReturnType<typeof getAnalytics> | null = null;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.warn("[Firebase] Analytics skipped in non-browser environment:", error);
}

// ✅ Firestore with built-in persistence using multiple tab manager
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  }),
  experimentalAutoDetectLongPolling: true
});
console.log("[Firestore] Firestore initialized with persistence");

// ✅ Firebase Storage
const storage = getStorage(app);

// ✅ Connection check with timeout
export const checkFirestoreConnection = async () => {
  const timeoutPromise = new Promise<'error'>((resolve) => {
    setTimeout(() => resolve('error'), 10000); // 10 second timeout
  });
  
  try {
    const connectionPromise = (async () => {
      try {
        const testDoc = doc(db, "diagnostics", "connection");
        await getDoc(testDoc);
        console.log("[Firestore] Connection successful");
        return 'connected' as const;
      } catch (error) {
        console.warn("[Firestore] Connection check failed:", error);
        return navigator.onLine ? 'error' as const : 'offline' as const;
      }
    })();
    
    // Race between connection check and timeout
    return await Promise.race([connectionPromise, timeoutPromise]);
  } catch (error) {
    console.error("[Firestore] Connection check unexpected error:", error);
    return navigator.onLine ? 'error' : 'offline';
  }
};

export { app, db, storage, analytics };
