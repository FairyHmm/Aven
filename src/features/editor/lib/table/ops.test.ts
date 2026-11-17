import { describe, expect, it } from "vitest";

import type { TableModel } from "./model";
import {
  canSort,
  clearColumn,
  clearRow,
  duplicateColumn,
  duplicateRow,
  shiftColumn,
  shiftRow,
  sortRows,
} from "./ops";

const MODEL: TableModel = {
  header: ["Name", "Qty"],
  align: ["left", "right"],
  rows: [
    ["pear", "10"],
    ["apple", "9"],
    ["", "3"],
    ["Fig", ""],
  ],
};

const names = (model: TableModel) => model.rows.map(row => row[0]);

describe("tableOps", () => {
  it("duplicates a row right after itself", () => {
    expect(names(duplicateRow(MODEL, 1))).toEqual([
      "pear",
      "apple",
      "apple",
      "",
      "Fig",
    ]);
    expect(duplicateRow(MODEL, 9)).toBe(MODEL);
  });

  it("duplicates a column with its alignment", () => {
    const next = duplicateColumn(MODEL, 1);
    expect(next.header).toEqual(["Name", "Qty", "Qty"]);
    expect(next.align).toEqual(["left", "right", "right"]);
    expect(next.rows[1]).toEqual(["apple", "9", "9"]);
  });

  it("moves a row or a column one place, never past the ends", () => {
    expect(names(shiftRow(MODEL, 1, -1))).toEqual(["apple", "pear", "", "Fig"]);
    expect(names(shiftRow(MODEL, 1, 1))).toEqual(["pear", "", "apple", "Fig"]);
    expect(shiftRow(MODEL, 0, -1)).toBe(MODEL);
    expect(shiftRow(MODEL, 3, 1)).toBe(MODEL);
    expect(shiftColumn(MODEL, 0, 1).header).toEqual(["Qty", "Name"]);
    expect(shiftColumn(MODEL, 0, 1).align).toEqual(["right", "left"]);
    expect(shiftColumn(MODEL, 1, 1)).toBe(MODEL);
  });

  it("clears a row, the header or a column", () => {
    expect(clearRow(MODEL, 0).rows[0]).toEqual(["", ""]);
    expect(clearRow(MODEL, -1).header).toEqual(["", ""]);
    const cleared = clearColumn(MODEL, 0);
    expect(cleared.header).toEqual(["", "Qty"]);
    expect(names(cleared)).toEqual(["", "", "", ""]);
  });

  it("sorts by a column, numbers by value, empty cells last", () => {
    expect(names(sortRows(MODEL, 0, "asc"))).toEqual([
      "apple",
      "Fig",
      "pear",
      "",
    ]);
    expect(names(sortRows(MODEL, 0, "desc"))).toEqual([
      "pear",
      "Fig",
      "apple",
      "",
    ]);
    expect(sortRows(MODEL, 1, "asc").rows.map(row => row[1])).toEqual([
      "3",
      "9",
      "10",
      "",
    ]);
  });

  it("will not sort rows that hold merged cells", () => {
    expect(canSort(MODEL)).toBe(true);
    expect(
      canSort({
        ...MODEL,
        rows: [
          ["a", "^"],
          ["b", "1"],
        ],
      }),
    ).toBe(false);
    expect(canSort({ ...MODEL, rows: [["a", "1"]] })).toBe(false);
  });
});
