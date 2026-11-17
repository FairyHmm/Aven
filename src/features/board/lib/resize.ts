import { patchOf } from "./patch";
import {
  BODY_HEIGHT,
  COLUMN_WIDTH,
  type BoardData,
  type BoardPatch,
} from "./types";

const within = (size: number, range: { min: number; max: number }) =>
  Math.round(Math.min(range.max, Math.max(range.min, size)));

// `width` undefined puts the column back to the default width.
export function resizeColumn(
  data: BoardData,
  id: string,
  width: number | undefined,
): BoardPatch {
  const column = data.columns.find(item => item.id === id);
  if (column === undefined) {
    return patchOf();
  }
  const { width: _before, ...rest } = column;
  return patchOf({
    columns: [
      width === undefined
        ? rest
        : {
            ...rest,
            width: within(width, COLUMN_WIDTH),
          },
    ],
  });
}

// Like `resizeColumn`, for how much of a card's text its tile shows. Not an
// edit of the card: `updatedAt` stays.
export function resizeCard(
  data: BoardData,
  id: string,
  height: number | undefined,
): BoardPatch {
  const card = data.cards.find(item => item.id === id);
  if (card === undefined) {
    return patchOf();
  }
  const { height: _before, ...rest } = card;
  return patchOf({
    cards: [
      height === undefined
        ? rest
        : {
            ...rest,
            height: within(height, BODY_HEIGHT),
          },
    ],
  });
}
