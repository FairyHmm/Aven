import { useBoardStore } from "../stores/boardStore";

// Whether the person looking at the open board may change it: owners and
// editors can, viewers can't (they read, and nothing they do is written).
export function useCanEdit() {
  return useBoardStore(state => state.canEdit);
}
