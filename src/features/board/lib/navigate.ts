// Moving around the board with the arrow keys: which card is next to which,
// and where a card goes when it is moved a step. Pure, over the lane as it is
// shown: the columns in order, each with its cards' ids.

export type Direction = "up" | "down" | "left" | "right";

export type Lane = { id: string; cards: string[] }[];

function locate(lane: Lane, cardId: string) {
  for (const [column, { cards }] of lane.entries()) {
    const row = cards.indexOf(cardId);
    if (row !== -1) {
      return { column, row };
    }
  }
  return undefined;
}

const stepOf = (direction: Direction) => (direction === "left" ? -1 : 1);

// The card the arrow reaches: the one above or below in the column, or the one
// at about the same height in the nearest column that has any.
export function neighbour(
  lane: Lane,
  cardId: string,
  direction: Direction,
): string | undefined {
  const at = locate(lane, cardId);
  if (at === undefined) {
    return undefined;
  }
  const { cards } = lane[at.column];
  if (direction === "up" || direction === "down") {
    return cards[at.row + (direction === "up" ? -1 : 1)];
  }
  const step = stepOf(direction);
  for (
    let next = at.column + step;
    next >= 0 && next < lane.length;
    next += step
  ) {
    const there = lane[next].cards;
    if (there.length > 0) {
      return there[Math.min(at.row, there.length - 1)];
    }
  }
  return undefined;
}

// Where a card goes when it is moved one step, as the `moveCard` action takes
// it: a column and the position in that column's order counting the card
// itself when it stays in its own column (like a drop preview). Sideways it
// goes to the next column, empty or not, at the same height.
export function moveStep(
  lane: Lane,
  cardId: string,
  direction: Direction,
): { columnId: string; index: number } | undefined {
  const at = locate(lane, cardId);
  if (at === undefined) {
    return undefined;
  }
  const own = lane[at.column];
  if (direction === "up") {
    return at.row === 0 ? undefined : { columnId: own.id, index: at.row - 1 };
  }
  if (direction === "down") {
    return at.row === own.cards.length - 1
      ? undefined
      : { columnId: own.id, index: at.row + 2 };
  }
  const target = lane[at.column + stepOf(direction)];
  return target === undefined
    ? undefined
    : { columnId: target.id, index: Math.min(at.row, target.cards.length) };
}
