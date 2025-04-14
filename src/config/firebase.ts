import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  initializeFirestore,
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

// ✅ Analytics (safely for SSR)
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.warn("[Firebase] Analytics skipped:", error);
}

// ✅ Firestore with proper persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager(),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  }),
  experimentalForceLongPolling: false,
  experimentalAutoDetectLongPolling: true,
});
console.log("[Firestore] Firestore initialized");

// ✅ Storage
const storage = getStorage(app);

// ✅ Connection test
export const checkFirestoreConnection = async () => {
  try {
    const testDoc = doc(db, "diagnostics", "connection");
    await getDoc(testDoc);
    return "connected";
  } catch (error) {
    console.warn("[Firestore] Connection test failed:", error);
    return navigator.onLine ? "error" : "offline";
  }
};

export { app, db, storage, analytics };
