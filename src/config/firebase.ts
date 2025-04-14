
import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, enableIndexedDbPersistence, collection, doc, getDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBVRq9wWs-Osrh4TN84www4tViKsd9lxAc",
  authDomain: "athro-ai-e33f9.firebaseapp.com",
  projectId: "athro-ai-e33f9",
  storageBucket: "athro-ai-e33f9.firebasestorage.app",
  messagingSenderId: "612165275676",
  appId: "1:612165275676:web:bf28bc1f7426b99b178fd9",
  measurementId: "G-0HGDXV9G3F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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
