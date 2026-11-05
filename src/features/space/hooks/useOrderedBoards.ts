import { useMemo } from "react";

import type { Space } from "../../../shared/lib/fixtures";
import {
  applyOrder,
  savedOrder,
  useBoardOrderStore,
} from "../stores/boardOrder";

// The space's boards in the user's chosen order, plus the move action.
export function useOrderedBoards(space: Space) {
  const saved = useBoardOrderStore(state => state.orders[space.id]);
  const move = useBoardOrderStore(state => state.move);
  const boards = useMemo(
    () => applyOrder(space.boards, saved ?? savedOrder(space.id)),
    [space, saved],
  );
  return { boards, move };
}
