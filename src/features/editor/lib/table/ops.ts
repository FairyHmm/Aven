// What the table menu does to a table, beyond the basics of `model.ts`.

import { isMergeMark, MERGE_UP } from "./marks";
import { mapColumns, moveColumn, moveRow, type TableModel } from "./model";
import { clearRect } from "./range";

// The row put back right after itself.
export function duplicateRow(model: TableModel, at: number): TableModel {
  const row = model.rows[at];
  if (row === undefined) {
    return model;
  }
  return {
    ...model,
    rows: [
      ...model.rows.slice(0, at + 1),
      [...row],
      ...model.rows.slice(at + 1),
    ],
  };
}

export function duplicateColumn(model: TableModel, at: number): TableModel {
  if (at < 0 || at >= model.header.length) {
    return model;
  }
  return mapColumns(model, cells => [
    ...cells.slice(0, at + 1),
    ...cells.slice(at, at + 1),
    ...cells.slice(at + 1),
  ]);
}

// One place up (-1) or down (1). Not past either end.
export function shiftRow(model: TableModel, at: number, step: 1 | -1) {
  const to = at + step;
  if (at < 0 || to < 0 || to >= model.rows.length) {
    return model;
  }
  return moveRow(model, at, step < 0 ? to : to + 1);
}

// One place left (-1) or right (1).
export function shiftColumn(model: TableModel, at: number, step: 1 | -1) {
  const to = at + step;
  if (at < 0 || to < 0 || to >= model.header.length) {
    return model;
  }
  return moveColumn(model, at, step < 0 ? to : to + 1);
}

// `row` -1 is the header.
export const clearRow = (model: TableModel, row: number): TableModel =>
  clearRect(model, {
    top: row,
    bottom: row,
    left: 0,
    right: model.header.length - 1,
  });

// The header's cell as well.
export const clearColumn = (model: TableModel, column: number): TableModel =>
  clearRect(model, {
    top: -1,
    bottom: model.rows.length - 1,
    left: column,
    right: column,
  });

// A `^` cell belongs to the one above it, so rows with one cannot change
// places without breaking the merge.
export function canSort(model: TableModel): boolean {
  return (
    model.rows.length > 1 &&
    !model.rows.some(cells => cells.some(cell => isMergeMark(cell, MERGE_UP)))
  );
}

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

// What a cell is worth in an ordering: its text, not its marks.
const plain = (cell: string) =>
  cell.replaceAll(/\*\*|__|~~|==|`|\*/g, "").trim();

// The rows in the order of one column, A to Z or Z to A (2 before 10).
// Empty cells go last either way.
export function sortRows(
  model: TableModel,
  column: number,
  direction: "asc" | "desc",
): TableModel {
  const sign = direction === "asc" ? 1 : -1;
  const rows = [...model.rows].sort((first, second) => {
    const a = plain(first[column] ?? "");
    const b = plain(second[column] ?? "");
    if (a === "" || b === "") {
      return a === b ? 0 : a === "" ? 1 : -1;
    }
    return sign * collator.compare(a, b);
  });
  return { ...model, rows };
}
