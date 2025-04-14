import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, initializeFirestore, enableIndexedDbPersistence, doc, getDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVRq9wWs-Osrh4TN84www4tViKsd9lxAc",
  authDomain: "athro-ai-e33f9.firebaseapp.com",
  projectId: "athro-ai-e33f9",
  storageBucket: "athro-ai-e33f9.firebasestorage.app",
  messagingSenderId: "612165275676",
  appId: "1:612165275676:web:bf28bc1f7426b99b178fd9",
  measurementId: "G-0HGDXV9G3F"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
console.log('[Firebase] App initialized:', app.name);

// ✅ Initialize Firestore with WebSocket fallback support
const db = initializeFirestore(app, {
  experimentalForceLongPolling: false,
  experimentalAutoDetectLongPolling: true,
});
console.log('[Firestore] Firestore instance created');

// ✅ Enable offline persistence only when online
if (navigator.onLine) {
  console.log('[Firestore] Browser reports online, enabling persistence...');
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("[Firestore] Persistence unavailable - multiple tabs open");
    } else if (err.code === 'unimplemented') {
      console.warn("[Firestore] Persistence not supported in this browser");
    } else {
      console.error("[Firestore] Persistence error:", err);
    }
  });
} else {
  console.warn("[Firestore] Browser appears to be offline, skipping persistence initialization");
}

// ✅ Initialize Storage
const storage = getStorage(app);

// ✅ Firestore connection check function
export const checkFirestoreConnection = async () => {
  try {
    console.log('[Firestore] Testing connection...');
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
