import type { BoardData, BoardPatch, BoardRef } from "../../lib/types";

export type BoardSubscriptionHandlers = {
  onData: (data: BoardData, fromCache: boolean) => void;
  onError: (error: Error) => void;
};

// One board's persistence. `load` resolves undefined when the board has never
// been saved (so the caller can seed or migrate); `apply` persists a patch;
// `subscribe` listens to realtime updates when backed by Firestore.
export type BoardStorage = {
  load: (ref: BoardRef) => Promise<BoardData | undefined>;
  apply: (ref: BoardRef, patch: BoardPatch) => Promise<void>;
  subscribe?: (
    ref: BoardRef,
    handlers: BoardSubscriptionHandlers,
  ) => () => void;
};
