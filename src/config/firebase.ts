import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  initializeFirestore,
  doc,
  getDoc,
  experimentalForceLongPolling,
  experimentalAutoDetectLongPolling
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

// ✅ Simplified Firestore (no persistence for now to avoid tab conflicts)
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true
});
console.log("[Firestore] Firestore initialized");

// ✅ Storage
const storage = getStorage(app);

// ✅ Connection check utility
export const checkFirestoreConnection = async () => {
  try {
    console.log("[Firestore] Checking connectivity...");
    const testDoc = doc(db, "diagnostics", "connection");
    await getDoc(testDoc);
    console.log("[Firestore] Connected successfully.");
    return "connected";
  } catch (error) {
    console.warn("[Firestore] Connection check failed:", error);
    return navigator.onLine ? "error" : "offline";
  }
};

export { app, db, storage, analytics };
