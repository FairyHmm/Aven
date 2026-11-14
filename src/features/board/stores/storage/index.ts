import { STORAGE_MODE } from "../../../../shared/lib/storageMode";
import { firebaseBoardStorage } from "./firebase";
import { localBoardStorage } from "./local";
import type { BoardStorage } from "./types";

export {
  STORAGE_MODE,
  type StorageMode,
} from "../../../../shared/lib/storageMode";
export type { BoardStorage } from "./types";

export const storage: BoardStorage =
  STORAGE_MODE === "firebase" ? firebaseBoardStorage : localBoardStorage;
