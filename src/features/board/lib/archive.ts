import { moveCard } from "./mutations";
import { patchOf } from "./patch";
import type { BoardData, BoardPatch, Card } from "./types";

// The id the archive list has among the lists cards are dragged between
// (the columns' own ids being the others).
export const ARCHIVE_LIST = "archive";

// Archiving sets a card aside: it leaves the board but keeps its column, its
// place in it and everything on it, and comes back with restoreCard.

export function archiveCard(
  data: BoardData,
  id: string,
  now = Date.now(),
): BoardPatch {
  const card = data.cards.find(item => item.id === id);
  return card === undefined || card.archivedAt !== undefined
    ? patchOf()
    : patchOf({ cards: [{ ...card, archivedAt: now }] });
}

export function restoreCard(data: BoardData, id: string): BoardPatch {
  const card = data.cards.find(item => item.id === id);
  if (card?.archivedAt === undefined) {
    return patchOf();
  }
  const { archivedAt: _was, ...rest } = card;
  return patchOf({ cards: [rest] });
}

// The archived cards, the most recently archived first.
export function archivedCards(data: Pick<BoardData, "cards">): Card[] {
  return data.cards
    .filter(card => card.archivedAt !== undefined)
    .sort((a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0));
}

// Puts a card in a list, the way a drop or a key move does: onto the archive
// list it is archived; into a column it goes at `index` (as `moveCard` reads
// it), and if it was archived it is on the board again.
export function placeCard(
  data: BoardData,
  id: string,
  listId: string,
  index: number,
  now = Date.now(),
): BoardPatch {
  if (listId === ARCHIVE_LIST) {
    return archiveCard(data, id, now);
  }
  const moved = moveCard(data, id, listId, index);
  return patchOf({
    cards: moved.cards.map(card => {
      const { archivedAt: _was, ...rest } = card;
      return rest;
    }),
  });
}
