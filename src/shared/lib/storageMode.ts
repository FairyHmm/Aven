export type StorageMode = "local" | "firebase";

// Storage backend, fixed at build time. Set VITE_STORAGE_BACKEND=firebase in
// .env to use Firebase; anything else (or unset) means browser localStorage.
export const STORAGE_MODE: StorageMode =
  import.meta.env.VITE_STORAGE_BACKEND === "firebase" ? "firebase" : "local";
