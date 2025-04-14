import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  initializeFirestore,
  enableIndexedDbPersistence,
  doc,
  getDoc
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
const analytics = getAnalytics(app);

// ✅ Initialize Firestore FIRST, before any operations
const db = initializeFirestore(app, {
  experimentalForceLongPolling: false,
  experimentalAutoDetectLongPolling: true,
});
console.log('[Firestore] Firestore instance created');

// ✅ Persistence must come BEFORE any use of Firestore!
if (navigator.onLine) {
  console.log('[Firestore] Browser online — enabling persistence...');
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("[Firestore] Persistence failed: multiple tabs open");
    } else if (err.code === 'unimplemented') {
      console.warn("[Firestore] Persistence not supported");
    } else {
      console.error("[Firestore] Unknown persistence error:", err);
    }
  });
} else {
  console.warn("[Firestore] Offline — skipping persistence");
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

export { app, db, storage };
