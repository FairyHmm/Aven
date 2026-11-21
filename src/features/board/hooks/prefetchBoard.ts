import type { BoardRef } from "../lib/types";
import { storage } from "../stores/storage";

const KEEP_MS = 10_000;
const warm = new Set<string>();

// Starts a board's realtime listener a little before the board opens (a link
// was hovered or just clicked), so its data is already on its way when the
// page asks for it. The listener does nothing with the data and is dropped
// after a few seconds; the board still opens its own. Only Firestore-backed
// storage has a listener, so this does nothing for browser-only storage.
export function prefetchBoard(ref: BoardRef): void {
  if (storage.subscribe === undefined) return;
  const key = `${ref.spaceId}/${ref.boardId}`;
  if (warm.has(key)) return;
  warm.add(key);
  const none = () => undefined;
  const stop = storage.subscribe(ref, { onData: none, onError: none });
  setTimeout(() => {
    stop();
    warm.delete(key);
  }, KEEP_MS);
}
