// Tab-separated and comma-separated text, in and out of a table.

import { rowOf, serializeTable, type TableModel, valueAt } from "./model";
import type { Cell, Rect } from "./range";

// Tab-separated text as rows of cells (quotes may hold tabs and line breaks).
export function parseTsv(text: string): string[][] {
  const rows: string[][] = [[]];
  let cell = "";
  let quoted = false;
  const source = text.replaceAll("\r\n", "\n");
  for (let at = 0; at < source.length; at += 1) {
    const char = source[at];
    if (quoted) {
      if (char === '"' && source[at + 1] === '"') {
        cell += '"';
        at += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"' && cell === "") {
      quoted = true;
    } else if (char === "\t" || char === "\n") {
      rows.at(-1)?.push(cell);
      cell = "";
      if (char === "\n") {
        rows.push([]);
      }
    } else {
      cell += char;
    }
  }
  rows.at(-1)?.push(cell);
  // A final line break is the end of the last row, not another row.
  if (source.endsWith("\n")) {
    rows.pop();
  }
  return rows;
}

// Puts rows of cells into the table with their top left cell at `at`. The
// table grows to fit them.
export function pasteCells(
  model: TableModel,
  at: Cell,
  cells: string[][],
): TableModel {
  const width = Math.max(
    model.header.length,
    at.column + Math.max(0, ...cells.map(row => row.length)),
  );
  const height = Math.max(model.rows.length, at.row + cells.length);
  const fit = (row: string[]) => [
    ...row,
    ...Array.from({ length: width - row.length }, () => ""),
  ];
  const next: TableModel = {
    header: fit(model.header),
    align: [
      ...model.align,
      ...Array.from(
        { length: width - model.align.length },
        () => "none" as const,
      ),
    ],
    rows: [
      ...model.rows.map(fit),
      ...Array.from({ length: height - model.rows.length }, () => fit([])),
    ],
  };
  cells.forEach((line, down) => {
    const target = rowOf(next, at.row + down);
    line.forEach((value, across) => {
      if (target !== undefined) {
        target[at.column + across] = value;
      }
    });
  });
  return next;
}

// A cell in a separated text: quoted when it holds the separator, a quote or
// a line break.
const quote = (value: string, separator: "\t" | ",") =>
  value.includes(separator) || /["\n]/.test(value)
    ? `"${value.replaceAll('"', '""')}"`
    : value;

// The block as tab-separated text, which spreadsheets paste as cells.
export function rectText(model: TableModel, rect: Rect): string {
  const lines: string[] = [];
  for (let row = rect.top; row <= rect.bottom; row += 1) {
    const cells: string[] = [];
    for (let column = rect.left; column <= rect.right; column += 1) {
      cells.push(quote(valueAt(model, row, column), "\t"));
    }
    lines.push(cells.join("\t"));
  }
  return lines.join("\n");
}

export function tableText(model: TableModel, kind: "markdown" | "csv"): string {
  if (kind === "markdown") {
    return serializeTable(model);
  }
  return [model.header, ...model.rows]
    .map(cells => cells.map(cell => quote(cell, ",")).join(","))
    .join("\n");
}
