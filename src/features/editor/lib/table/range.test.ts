import { describe, expect, it } from "vitest";

import type { TableModel } from "./model";
import { clearRect, mergeRect, mergeable, rectOf } from "./range";
import { parseTsv, pasteCells, rectText, tableText } from "./text";

const MODEL: TableModel = {
  header: ["A", "B", "C"],
  align: ["none", "none", "none"],
  rows: [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
  ],
};

describe("tableRange", () => {
  it("makes a rectangle from two corners, either way round", () => {
    expect(rectOf({ row: 2, column: 0 }, { row: 0, column: 1 })).toEqual({
      top: 0,
      bottom: 2,
      left: 0,
      right: 1,
    });
  });

  it("clears a block, header included", () => {
    const next = clearRect(
      MODEL,
      rectOf({ row: -1, column: 1 }, { row: 0, column: 2 }),
    );
    expect(next.header).toEqual(["A", "", ""]);
    expect(next.rows[0]).toEqual(["1", "", ""]);
    expect(next.rows[1]).toEqual(["4", "5", "6"]);
  });

  it("merges a block into its top left cell", () => {
    const rect = rectOf({ row: 0, column: 0 }, { row: 1, column: 1 });
    const next = mergeRect(MODEL, rect);
    expect(next.rows[0]).toEqual(["1\n2\n4\n5", "<", "3"]);
    expect(next.rows[1]).toEqual(["^", "^", "6"]);
  });

  it("will not merge one cell, or across the header and the body", () => {
    expect(
      mergeable(rectOf({ row: 0, column: 0 }, { row: 0, column: 0 })),
    ).toBe(false);
    expect(
      mergeable(rectOf({ row: -1, column: 0 }, { row: 0, column: 1 })),
    ).toBe(false);
    expect(
      mergeable(rectOf({ row: -1, column: 0 }, { row: -1, column: 1 })),
    ).toBe(true);
  });

  it("copies as tab-separated text and reads it back", () => {
    const rect = rectOf({ row: 0, column: 0 }, { row: 1, column: 1 });
    expect(rectText(MODEL, rect)).toBe("1\t2\n4\t5");
    expect(parseTsv("1\t2\n4\t5\n")).toEqual([
      ["1", "2"],
      ["4", "5"],
    ]);
    expect(parseTsv('"a\tb"\t"say ""hi"""')).toEqual([["a\tb", 'say "hi"']]);
  });

  it("pastes cells, and grows the table when they do not fit", () => {
    const next = pasteCells(MODEL, { row: 2, column: 2 }, [
      ["x", "y"],
      ["z", "w"],
    ]);
    expect(next.header).toHaveLength(4);
    expect(next.rows).toHaveLength(4);
    expect(next.rows[2]).toEqual(["7", "8", "x", "y"]);
    expect(next.rows[3]).toEqual(["", "", "z", "w"]);
  });

  it("gives the whole table as markdown or csv", () => {
    expect(tableText(MODEL, "csv")).toBe("A,B,C\n1,2,3\n4,5,6\n7,8,9");
    expect(tableText(MODEL, "markdown").split("\n")[0]).toBe("| A | B | C |");
  });
});
