import { describe, expect, it } from "vitest";

import { isMerged, layoutOf, unmerge } from "./layout";
import { parseTable, serializeTable, type TableModel } from "./model";

function table(source: string): TableModel {
  const model = parseTable(source);
  if (model === undefined) {
    throw new Error("no table");
  }
  return model;
}

describe("layoutOf", () => {
  it("merges a `<` cell into the cell on its left", () => {
    const layout = layoutOf(
      table("| A | B | C |\n| - | - | - |\n| x | < | y |"),
    );
    expect(layout.span(0, 0)).toEqual({ colSpan: 2, rowSpan: 1 });
    expect(layout.hidden(0, 1)).toBe(true);
    expect(layout.shownBy(0, 1)).toEqual({ row: 0, column: 0 });
    expect(layout.hidden(0, 2)).toBe(false);
  });

  it("merges a `^` cell into the cell above, and runs into one block", () => {
    const layout = layoutOf(
      table(
        "| A | B | C |\n| - | - | - |\n| x | < | < |\n| ^ | ^ | ^ |\n| y | z | w |",
      ),
    );
    expect(layout.span(0, 0)).toEqual({ colSpan: 3, rowSpan: 2 });
    expect(layout.shownBy(1, 2)).toEqual({ row: 0, column: 0 });
    expect(layout.hidden(2, 0)).toBe(false);
  });

  it("keeps the header and the body apart", () => {
    const layout = layoutOf(table("| A | B |\n| - | - |\n| ^ | y |"));
    expect(layout.hidden(0, 0)).toBe(false);
    expect(layout.span(-1, 0)).toEqual({ colSpan: 1, rowSpan: 1 });
    const header = layoutOf(table("| A | < |\n| - | - |\n| x | y |"));
    expect(header.span(-1, 0)).toEqual({ colSpan: 2, rowSpan: 1 });
  });

  it("leaves a marker alone while it is being typed", () => {
    const model = table("| A | B |\n| - | - |\n| x | y |\n| ^ | z |");
    expect(layoutOf(model).hidden(1, 0)).toBe(true);
    expect(layoutOf(model, { row: 1, column: 0 }).hidden(1, 0)).toBe(false);
  });
});

describe("unmerge", () => {
  it("empties the markers of a merged cell and keeps its text", () => {
    const model = table(
      "| A | B | C |\n| - | - | - |\n| x | < | y |\n| ^ | ^ | ^ |",
    );
    const layout = layoutOf(model);
    expect(isMerged(layout, 1, 1)).toBe(true);
    const plain = unmerge(model, layout, 1, 1);
    expect(plain.rows).toEqual([
      ["x", "", "y"],
      ["", "", "^"],
    ]);
    expect(isMerged(layoutOf(plain), 0, 0)).toBe(false);
    expect(serializeTable(plain)).toContain("| x |");
  });
});
