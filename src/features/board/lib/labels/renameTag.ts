import { patchOf } from "../patch";
import { tagsOf, withTags } from "../props/defaults";
import type { BoardData, BoardPatch } from "../types";
import { renamed, underTag } from "./tags";

// Every card of the board under `from` gets `to` instead (children follow:
// renaming `area` renames `area/ui`).
export function renameTag(
  data: BoardData,
  from: string,
  to: string,
  now = Date.now(),
): BoardPatch {
  if (from === to) {
    return patchOf();
  }
  return patchOf({
    cards: data.cards
      .filter(card => underTag(tagsOf(card.props), from))
      .map(card => ({
        ...card,
        props: withTags(card.props, renamed(tagsOf(card.props), from, to)),
        updatedAt: now,
      })),
  });
}
