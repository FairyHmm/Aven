// A block of cells picked in a table, and what can be done to it as a whole.

import { isMerged, type Layout } from "./layout";
import { isMergeMark, MERGE_LEFT, MERGE_UP } from "./marks";
import { type TableModel, valueAt } from "./model";

// Row -1 is the header.
export type Cell = { row: number; column: number };

// Inclusive on every side.
export type Rect = { top: number; left: number; bottom: number; right: number };

// A cell's place as the `data-cell` of its field, and back.
export const cellId = (row: number, column: number) => `${row}:${column}`;

export function parseCellId(id: string | null | undefined): Cell | undefined {
  const [row, column] = (id ?? "").split(":").map(Number);
  return row === undefined ||
    column === undefined ||
    Number.isNaN(row) ||
    Number.isNaN(column)
    ? undefined
    : { row, column };
}

export function rectOf(a: Cell, b: Cell): Rect {
  return {
    top: Math.min(a.row, b.row),
    bottom: Math.max(a.row, b.row),
    left: Math.min(a.column, b.column),
    right: Math.max(a.column, b.column),
  };
}

export const inRect = (rect: Rect, row: number, column: number) =>
  row >= rect.top &&
  row <= rect.bottom &&
  column >= rect.left &&
  column <= rect.right;

export const isSingle = (rect: Rect) =>
  rect.top === rect.bottom && rect.left === rect.right;

// The model with `change` applied to every cell of the block.
export function mapCells(
  model: TableModel,
  rect: Rect,
  change: (value: string, row: number, column: number) => string,
): TableModel {
  const next = (cells: string[], row: number) =>
    row >= rect.top && row <= rect.bottom
      ? cells.map((value, column) =>
          column >= rect.left && column <= rect.right
            ? change(value, row, column)
            : value,
        )
      : cells;
  return {
    ...model,
    header: next(model.header, -1),
    rows: model.rows.map((cells, row) => next(cells, row)),
  };
}

export const clearRect = (model: TableModel, rect: Rect): TableModel =>
  mapCells(model, rect, () => "");

// Two or more cells, all in the body or all in the header (they are separate
// sections, and a cell cannot join across them).
export const mergeable = (rect: Rect): boolean =>
  !isSingle(rect) && !(rect.top < 0 && rect.bottom >= 0);

// One cell out of the block: the text of all of them in the top left one, and
// merge markers in the rest (`<` along the first row, `^` below it).
export function mergeRect(model: TableModel, rect: Rect): TableModel {
  if (!mergeable(rect)) {
    return model;
  }
  const texts: string[] = [];
  for (let row = rect.top; row <= rect.bottom; row += 1) {
    for (let column = rect.left; column <= rect.right; column += 1) {
      const value = valueAt(model, row, column);
      if (value.trim() !== "" && !isMergeMark(value)) {
        texts.push(value);
      }
    }
  }
  return mapCells(model, rect, (_, row, column) => {
    if (row === rect.top && column === rect.left) {
      return texts.join("\n");
    }
    return row === rect.top ? MERGE_LEFT : MERGE_UP;
  });
}

// The table with this cell merged into the one above it or to its left, if
// that is possible: neither may be merged already, except that the one it
// joins can be (a merged cell grows only along one side).
export function mergeNeighbour(
  model: TableModel,
  layout: Layout,
  cell: Cell,
  side: "up" | "left",
): TableModel | undefined {
  const next =
    side === "up"
      ? { row: cell.row - 1, column: cell.column }
      : { row: cell.row, column: cell.column - 1 };
  // The header and the body are sections of their own.
  if (
    isMerged(layout, cell.row, cell.column) ||
    next.column < 0 ||
    next.row < (cell.row < 0 ? -1 : 0)
  ) {
    return undefined;
  }
  const anchor = layout.shownBy(next.row, next.column);
  const { colSpan, rowSpan } = layout.span(anchor.row, anchor.column);
  const straight =
    side === "up"
      ? anchor.column === cell.column && colSpan === 1
      : anchor.row === cell.row && rowSpan === 1;
  return straight ? mergeRect(model, rectOf(anchor, cell)) : undefined;
}
