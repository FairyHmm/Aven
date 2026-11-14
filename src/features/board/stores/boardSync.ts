import { captureLayout, markLoaded } from "../../../shared/lib/dnd/flip";
import { fullPatch } from "../lib/patch";
import { seedBoard } from "../lib/seed";
import type { BoardData, BoardPatch, BoardRef } from "../lib/types";
import { storage } from "./storage";

export function describeBoardError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return /permission|insufficient/i.test(message)
    ? "Permission denied by Firestore rules. Check your account role or sign in again."
    : message;
}

export function subscribeBoard(
  ref: BoardRef,
  isCurrent: () => boolean,
  onState: (patch: {
    columns?: BoardData["columns"];
    cards?: BoardData["cards"];
    status?: "loading" | "ready";
    error?: string | undefined;
  }) => void,
  persist: (ref: BoardRef, patch: BoardPatch) => void,
): (() => void) | undefined {
  if (storage.subscribe === undefined) {
    void storage
      .load(ref)
      .then(stored => {
        if (!isCurrent()) return;
        const data = stored ?? seedBoard();
        if (stored === undefined) {
          void storage.apply(ref, fullPatch(data));
        }
        markLoaded();
        onState({ ...data, status: "ready" });
      })
      .catch((error: unknown) => {
        if (isCurrent()) {
          onState({ status: "ready", error: describeBoardError(error) });
        }
      });
    return undefined;
  }

  let initial = true;
  let seeded = false;
  return storage.subscribe(ref, {
    onData: (data, fromCache) => {
      if (!isCurrent()) return;
      const empty = data.columns.length === 0 && data.cards.length === 0;
      if (empty && !fromCache && !seeded) {
        seeded = true;
        const seed = seedBoard();
        markLoaded();
        onState({ ...seed, status: "ready" });
        persist(ref, fullPatch(seed));
        initial = false;
        return;
      }
      if (empty && fromCache) return;
      if (initial) {
        initial = false;
        markLoaded();
        onState({ ...data, status: "ready" });
      } else {
        captureLayout();
        onState({ ...data, status: "ready" });
      }
    },
    onError: error => {
      if (isCurrent()) {
        onState({ status: "ready", error: describeBoardError(error) });
      }
    },
  });
}
