import { create } from "zustand";

import { insertionIndex } from "../../../shared/lib/dnd/reorder";
import type { Board } from "../../../shared/lib/fixtures";

// User-chosen order of the boards in a space's sidebar, kept in localStorage
// until spaces/boards live in Firestore (then this becomes an `order` field on
// the board documents, like columns and cards).
const keyOf = (spaceId: string) => `aven:v1:board-order:${spaceId}`;

function read(spaceId: string): string[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(keyOf(spaceId)) ?? "[]",
    );
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

// Saved order first; boards added since (or never ordered) keep their place
// after it.
export function applyOrder(boards: readonly Board[], saved: readonly string[]) {
  const rank = (board: Board) => {
    const position = saved.indexOf(board.id);
    return position === -1 ? saved.length : position;
  };
  return [...boards].sort((a, b) => rank(a) - rank(b));
}

type State = {
  orders: Record<string, string[]>;
  move: (
    spaceId: string,
    shown: readonly string[],
    id: string,
    at: number,
  ) => void;
};

export const useBoardOrderStore = create<State>()((set, get) => ({
  orders: {},
  move: (spaceId, shown, id, index) => {
    const others = shown.filter(item => item !== id);
    const at = insertionIndex(shown, id, index);
    const next = [...others.slice(0, at), id, ...others.slice(at)];
    try {
      localStorage.setItem(keyOf(spaceId), JSON.stringify(next));
    } catch {
      // Private mode / quota: the order just won't persist.
    }
    set({ orders: { ...get().orders, [spaceId]: next } });
  },
}));

export function savedOrder(spaceId: string): string[] {
  return useBoardOrderStore.getState().orders[spaceId] ?? read(spaceId);
}
