import { generateNKeysBetween } from "fractional-indexing";

import { newId } from "../../../../shared/lib/id";
import type { NewBoard } from "./types";

// The boards a new space starts with, in order: the ones asked for, or one
// empty "Board 1".
export function startingBoards(
  boards?: NewBoard[],
): { id: string; name: string; order: string }[] {
  const list =
    boards !== undefined && boards.length > 0
      ? boards
      : [{ id: newId(), name: "Board 1" }];
  const keys = generateNKeysBetween(null, null, list.length);
  return list.map((board, index) => ({
    ...board,
    order: keys[index] ?? "a0",
  }));
}
