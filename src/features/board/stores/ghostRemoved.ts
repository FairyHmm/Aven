import { ghostOut } from "../../../shared/lib/dnd/glide";
import type { BoardData, BoardPatch } from "../lib/types";

// The tiles and columns a change removes leave their picture behind to fade
// out while the rest closes up. The cards of a column that goes with it are
// part of its picture.
export function ghostRemoved(data: BoardData, patch: BoardPatch): void {
  const columns = new Set(patch.removeColumns);
  for (const id of patch.removeColumns) {
    ghostOut(`column:${id}`);
  }
  for (const id of patch.removeCards) {
    const card = data.cards.find(item => item.id === id);
    if (card !== undefined && !columns.has(card.columnId)) {
      ghostOut(`card:${id}`);
    }
  }
}
