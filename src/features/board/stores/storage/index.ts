import { firebaseBoardStorage } from "./firebase";
import { localBoardStorage } from "./local";
import type { BoardStorage, StorageMode } from "./types";

export type { BoardStorage, StorageMode } from "./types";

// Storage backend, fixed at build time. Set VITE_STORAGE_BACKEND=firebase in
// .env to use Firestore; anything else (or unset) means localStorage.
export const STORAGE_MODE: StorageMode =
  import.meta.env.VITE_STORAGE_BACKEND === "firebase" ? "firebase" : "local";

export const storage: BoardStorage =
  STORAGE_MODE === "firebase" ? firebaseBoardStorage : localBoardStorage;
