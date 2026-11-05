import type { BoardData, BoardPatch, BoardRef } from "../../lib/types";

export type StorageMode = "local" | "firebase";

// One board's persistence. `load` resolves undefined when the board has never
// been saved (so the caller can seed or migrate); `apply` persists a patch.
export type BoardStorage = {
  load: (ref: BoardRef) => Promise<BoardData | undefined>;
  apply: (ref: BoardRef, patch: BoardPatch) => Promise<void>;
};
