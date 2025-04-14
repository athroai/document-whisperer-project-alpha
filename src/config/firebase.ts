
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  initializeFirestore,
  doc,
  getDoc,
  enableIndexedDbPersistence,
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

// ✅ Analytics (only runs in browser)
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (err) {
  console.warn("[Firebase] Analytics disabled or not supported in this environment:", err);
}

// ✅ Initialize Firestore with persistence settings
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ 
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    tabManager: persistentSingleTabManager({
      forceOwningTab: true
    }) 
  })
});

console.log("[Firestore] Firestore initialized with built-in persistence");

// ✅ Storage
const storage = getStorage(app);

// ✅ Connection check utility
export const checkFirestoreConnection = async () => {
  try {
    console.log("[Firestore] Checking connectivity...");
    const testDoc = doc(db, "diagnostics", "connection");
    
    // Set a timeout to avoid waiting too long
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Firestore connection check timed out"));
      }, 5000); // 5 second timeout
    });
    
    // Race between the connection check and the timeout
    await Promise.race([
      getDoc(testDoc),
      timeoutPromise
    ]);
    
    console.log("[Firestore] Connected successfully.");
    return "connected";
  } catch (error) {
    console.warn("[Firestore] Connection check failed:", error);
    return navigator.onLine ? "error" : "offline";
  }
};

export { app, db, storage, analytics };
