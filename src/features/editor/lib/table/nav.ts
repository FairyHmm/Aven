export type Direction = "up" | "down" | "left" | "right" | "enter";

// Where a key that leaves a cell takes the caret: another cell (`grow`: a new
// row first), or out of the table to the line above or below it.
export type Step =
  | {
      kind: "cell";
      row: number;
      column: number;
      where: "start" | "end";
      grow: boolean;
    }
  | { kind: "out"; direction: "up" | "down" };

const OUT_UP: Step = { kind: "out", direction: "up" };
const OUT_DOWN: Step = { kind: "out", direction: "down" };

// `row` -1 is the header. Left and right run on through the rows, up and down
// stay in the column, Enter goes down and adds a row after the last one.
export function stepFrom(
  rows: number,
  columns: number,
  row: number,
  column: number,
  direction: Direction,
): Step {
  const lastRow = rows - 1;
  const lastColumn = columns - 1;
  const cell = (
    nextRow: number,
    nextColumn: number,
    where: "start" | "end" = "start",
    grow = false,
  ): Step => ({ kind: "cell", row: nextRow, column: nextColumn, where, grow });
  if (direction === "enter") {
    return cell(row + 1, column, "start", row >= lastRow);
  }
  if (direction === "up") {
    return row < 0 ? OUT_UP : cell(row - 1, column);
  }
  if (direction === "down") {
    return row >= lastRow ? OUT_DOWN : cell(row + 1, column);
  }
  if (direction === "left") {
    if (column > 0) {
      return cell(row, column - 1, "end");
    }
    return row < 0 ? OUT_UP : cell(row - 1, lastColumn, "end");
  }
  if (column < lastColumn) {
    return cell(row, column + 1);
  }
  return row < lastRow ? cell(row + 1, 0) : OUT_DOWN;
}
