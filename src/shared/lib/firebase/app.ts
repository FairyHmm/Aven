import { getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

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

export const app =
  existing ??
  initializeApp({
    apiKey: env("VITE_FIREBASE_API_KEY", import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: env(
      "VITE_FIREBASE_AUTH_DOMAIN",
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    ),
    projectId: env(
      "VITE_FIREBASE_PROJECT_ID",
      import.meta.env.VITE_FIREBASE_PROJECT_ID,
    ),
    databaseURL: env(
      "VITE_FIREBASE_DATABASE_URL",
      import.meta.env.VITE_FIREBASE_DATABASE_URL,
    ),
    appId: env("VITE_FIREBASE_APP_ID", import.meta.env.VITE_FIREBASE_APP_ID),
  });

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const rtdb = getDatabase(app);

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
}
