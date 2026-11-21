import { fullPatch } from "../lib/patch";
import type { BoardData, BoardRef } from "../lib/types";
import { storage } from "../stores/storage";

export type { Accent, BoardData, BoardRef, Card, Column } from "../lib/types";

// Writes a board's whole content straight to storage, for a board nobody has
// opened yet (so it isn't seeded with the default starter cards first).
export function saveBoardContent(
  ref: BoardRef,
  data: BoardData,
): Promise<void> {
  return storage.apply(ref, fullPatch(data));
}
