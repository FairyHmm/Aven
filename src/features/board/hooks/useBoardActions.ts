import { useBoardStore } from "../stores/boardStore";

export type { BoardActions } from "../stores/boardStore";

// The board's actions (add, rename, move, ...). The object never changes, so
// calling this doesn't make a component re-render.
export function useBoardActions() {
  return useBoardStore(state => state.actions);
}
