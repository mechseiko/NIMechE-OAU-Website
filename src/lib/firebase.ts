import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

export const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);
}

/** Null-safe accessors: the app renders in a read-only "setup pending"
 *  state until env vars exist, instead of crashing at import time. */
export function firebaseApp(): FirebaseApp {
  if (!app) throw new Error("Firebase is not configured. Add the NEXT_PUBLIC_FIREBASE_* env vars.");
  return app;
}

export function auth(): Auth {
  if (!authInstance)
    throw new Error("Firebase is not configured. Add the NEXT_PUBLIC_FIREBASE_* env vars.");
  return authInstance;
}

export function db(): Firestore {
  if (!dbInstance)
    throw new Error("Firebase is not configured. Add the NEXT_PUBLIC_FIREBASE_* env vars.");
  return dbInstance;
}
