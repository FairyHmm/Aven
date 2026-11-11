import { newId } from "./id";
import { cardsOf } from "./mutations";
import { keyAtIndex } from "./order";
import { patchOf } from "./patch";
import type { BoardData, BoardPatch } from "./types";

// A copy right under the original, with its own id.
export function duplicateCard(
  data: BoardData,
  id: string,
  now = Date.now(),
): BoardPatch {
  const card = data.cards.find(item => item.id === id);
  if (card === undefined) {
    return patchOf();
  }
  const siblings = cardsOf(data, card.columnId);
  const at = siblings.findIndex(item => item.id === id);
  return patchOf({
    cards: [
      {
        ...card,
        id: newId(),
        props: structuredClone(card.props),
        order: keyAtIndex(siblings, at + 1),
        createdAt: now,
        updatedAt: now,
      },
    ],
  });
}
