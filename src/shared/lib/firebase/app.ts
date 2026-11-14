import { getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";

function env(name: string, value: string | undefined): string {
  if (value === undefined || value === "") {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env and fill it in.`,
    );
  }
  return value;
}

const existing = getApps()[0];
const isFresh = existing === undefined;
const projectId = env(
  "VITE_FIREBASE_PROJECT_ID",
  import.meta.env.VITE_FIREBASE_PROJECT_ID,
);
const configuredBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const storageBucket =
  configuredBucket !== undefined && configuredBucket !== ""
    ? configuredBucket
    : import.meta.env.VITE_USE_EMULATORS === "true"
      ? `${projectId}.appspot.com`
      : undefined;

export const app =
  existing ??
  initializeApp({
    apiKey: env("VITE_FIREBASE_API_KEY", import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: env(
      "VITE_FIREBASE_AUTH_DOMAIN",
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    ),
    projectId,
    databaseURL: env(
      "VITE_FIREBASE_DATABASE_URL",
      import.meta.env.VITE_FIREBASE_DATABASE_URL,
    ),
    appId: env("VITE_FIREBASE_APP_ID", import.meta.env.VITE_FIREBASE_APP_ID),
    ...(storageBucket !== undefined ? { storageBucket } : {}),
  });

function createFirestore() {
  if (!isFresh) {
    return getFirestore(app);
  }
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    return getFirestore(app);
  }
}

export const auth = getAuth(app);
export const firestore = createFirestore();
export const rtdb = getDatabase(app);
export const firebaseStorage = getStorage(app);

// Ports match the emulators block in firebase.json. Guarded so HMR
// re-evaluating this module doesn't reconnect an already-used instance.
if (
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_EMULATORS === "true" &&
  isFresh
) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
  connectDatabaseEmulator(rtdb, "127.0.0.1", 9000);
  connectStorageEmulator(firebaseStorage, "127.0.0.1", 9199);
}
