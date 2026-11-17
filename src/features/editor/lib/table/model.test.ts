import { describe, expect, it } from "vitest";

import {
  addColumn,
  addRow,
  moveColumn,
  moveRow,
  parseTable,
  removeColumn,
  removeRow,
  serializeTable,
  setAlign,
  setCell,
} from "./model";

const SOURCE = "| Name | Qty |\n| :-- | --: |\n| apple | 3 |\n| pear | 5 |";

describe("tableModel", () => {
  it("parses and writes a table back the same", () => {
    const model = parseTable(SOURCE);
    expect(model?.header).toEqual(["Name", "Qty"]);
    expect(model?.align).toEqual(["left", "right"]);
    expect(model?.rows).toEqual([
      ["apple", "3"],
      ["pear", "5"],
    ]);
    expect(model && serializeTable(model)).toBe(SOURCE);
  });

  it("reads rows without outer pipes and pads short ones", () => {
    const model = parseTable("a | b\n--- | ---\nx");
    expect(model?.rows).toEqual([["x", ""]]);
  });

  it("keeps a pipe inside a cell", () => {
    const model = parseTable("| a |\n| --- |\n| x \\| y |");
    expect(model?.rows).toEqual([["x | y"]]);
    expect(model && serializeTable(model)).toContain("x \\| y");
  });

  it("is not a table without a delimiter row", () => {
    expect(parseTable("| a | b |\n| nope | nope |")).toBeUndefined();
  });

  it("edits cells, rows and columns", () => {
    const model = parseTable(SOURCE);
    if (model === undefined) {
      throw new Error("no model");
    }
    expect(setCell(model, 0, 1, "9").rows[0]).toEqual(["apple", "9"]);
    expect(setCell(model, -1, 0, "Item").header[0]).toBe("Item");
    expect(addRow(model, 1).rows[1]).toEqual(["", ""]);
    expect(removeRow(model, 0).rows).toEqual([["pear", "5"]]);
    expect(addColumn(model, 1).header).toEqual(["Name", "", "Qty"]);
    expect(addColumn(model, 1).align).toEqual(["left", "none", "right"]);
    expect(removeColumn(model, 0).header).toEqual(["Qty"]);
    expect(setAlign(model, 0, "center").align[0]).toBe("center");
  });

  it("never removes the last column", () => {
    const model = parseTable("| a |\n| --- |\n| x |");
    expect(model && removeColumn(model, 0).header).toEqual(["a"]);
  });

  it("keeps line breaks in a cell as <br>", () => {
    const model = parseTable("| a |\n| --- |\n| one<br>two |\n| x<BR/>y |");
    expect(model?.rows).toEqual([["one\ntwo"], ["x\ny"]]);
    expect(model && serializeTable(model)).toContain("| one<br>two |");
  });

  it("moves rows and columns to where a drop preview points", () => {
    const model = parseTable(SOURCE);
    if (model === undefined) {
      throw new Error("no model");
    }
    expect(moveRow(model, 0, 2).rows.map(row => row[0])).toEqual([
      "pear",
      "apple",
    ]);
    expect(moveRow(model, 1, 0).rows.map(row => row[0])).toEqual([
      "pear",
      "apple",
    ]);
    expect(moveRow(model, 0, 1).rows).toEqual(model.rows);
    const swapped = moveColumn(model, 0, 2);
    expect(swapped.header).toEqual(["Qty", "Name"]);
    expect(swapped.align).toEqual(["right", "left"]);
    expect(swapped.rows[0]).toEqual(["3", "apple"]);
  });
});
