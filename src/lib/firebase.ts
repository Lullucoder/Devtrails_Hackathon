/**
 * Firebase Client SDK — browser-safe initialization.
 *
 * Exports:  app, auth, db, storage
 *
 * All config values are read from NEXT_PUBLIC_FIREBASE_* env vars
 * defined in .env.local (see .env.example for the full list).
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function isMissing(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

const REQUIRED_FIREBASE_PUBLIC_CONFIG = [
  { envKey: "NEXT_PUBLIC_FIREBASE_API_KEY", value: firebaseConfig.apiKey },
  { envKey: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", value: firebaseConfig.authDomain },
  { envKey: "NEXT_PUBLIC_FIREBASE_PROJECT_ID", value: firebaseConfig.projectId },
  { envKey: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", value: firebaseConfig.storageBucket },
  { envKey: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", value: firebaseConfig.messagingSenderId },
  { envKey: "NEXT_PUBLIC_FIREBASE_APP_ID", value: firebaseConfig.appId },
] as const;

const missingFirebasePublicKeys = REQUIRED_FIREBASE_PUBLIC_CONFIG
  .filter(({ value }) => isMissing(value))
  .map(({ envKey }) => envKey);

const isFirebaseClientConfigured = missingFirebasePublicKeys.length === 0;

// Log missing keys for debugging in the browser.
if (!isFirebaseClientConfigured && typeof window !== "undefined") {
  console.error("Missing Firebase env vars:", missingFirebasePublicKeys);
}

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;
let cachedStorage: FirebaseStorage | null = null;

function ensureFirebaseApp(): FirebaseApp {
  if (cachedApp) return cachedApp;

  if (getApps().length > 0) {
    cachedApp = getApps()[0];
    return cachedApp;
  }

  if (!isFirebaseClientConfigured) {
    throw new Error(
      `Firebase client config missing env vars: ${missingFirebasePublicKeys.join(", ")}. ` +
      "If running on Vercel, ensure NEXT_PUBLIC_* vars are set in the correct environment and redeploy."
    );
  }

  cachedApp = initializeApp(firebaseConfig);
  return cachedApp;
}

function createLazyServiceProxy<T extends object>(factory: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop) {
      const instance = factory() as Record<PropertyKey, unknown>;
      const value = instance[prop];
      if (typeof value === "function") {
        return value.bind(instance);
      }
      return value;
    },
  });
}

function ensureAuth(): Auth {
  if (!cachedAuth) {
    cachedAuth = getAuth(ensureFirebaseApp());
  }
  return cachedAuth;
}

function ensureDb(): Firestore {
  if (!cachedDb) {
    cachedDb = getFirestore(ensureFirebaseApp());
  }
  return cachedDb;
}

function ensureStorage(): FirebaseStorage {
  if (!cachedStorage) {
    cachedStorage = getStorage(ensureFirebaseApp());
  }
  return cachedStorage;
}

const app: FirebaseApp = createLazyServiceProxy<FirebaseApp>(() => ensureFirebaseApp());
const auth: Auth = createLazyServiceProxy<Auth>(() => ensureAuth());
const db: Firestore = createLazyServiceProxy<Firestore>(() => ensureDb());
const storage: FirebaseStorage = createLazyServiceProxy<FirebaseStorage>(() => ensureStorage());

export { app, auth, db, storage, isFirebaseClientConfigured };
