import { generateNKeysBetween } from "fractional-indexing";

import { archiveCard } from "./archive";
import { cardsOf } from "./mutations";
import { patchOf } from "./patch";
import { datesOf } from "./props/defaults";
import type { BoardData, BoardPatch, Card } from "./types";

// Things done to a whole column at once.

export type SortBy = "title" | "due" | "newest" | "oldest";

const COMPARE: Record<SortBy, (a: Card, b: Card) => number> = {
  title: (a, b) =>
    a.title.localeCompare(b.title, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  // Dates read the same as text; a card with no due date goes last.
  due: (a, b) => {
    const left = datesOf(a.props).due;
    const right = datesOf(b.props).due;
    if (left === right) {
      return 0;
    }
    if (left === "" || right === "") {
      return left === "" ? 1 : -1;
    }
    return left < right ? -1 : 1;
  },
  newest: (a, b) => b.createdAt - a.createdAt,
  oldest: (a, b) => a.createdAt - b.createdAt,
};

// The column's cards laid out in the given order. Cards that compare equal
// stay as they were, and nothing is written if they are in that order already.
export function sortColumn(
  data: BoardData,
  columnId: string,
  by: SortBy,
): BoardPatch {
  const current = cardsOf(data, columnId);
  const sorted = [...current].sort(COMPARE[by]);
  if (sorted.every((card, index) => card.id === current[index]?.id)) {
    return patchOf();
  }
  const keys = generateNKeysBetween(null, null, sorted.length);
  return patchOf({
    cards: sorted.map((card, index) => ({
      ...card,
      order: keys[index] ?? card.order,
    })),
  });
}

// Sets every card of the column aside.
export function archiveColumnCards(
  data: BoardData,
  columnId: string,
  now = Date.now(),
): BoardPatch {
  return patchOf({
    cards: cardsOf(data, columnId).flatMap(
      card => archiveCard(data, card.id, now).cards,
    ),
  });
}
