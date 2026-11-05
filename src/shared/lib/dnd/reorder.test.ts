import { describe, expect, it } from "vitest";

import { dropIndex, gapBefore, insertionIndex } from "./reorder";

describe("dropIndex", () => {
  const slots = [{ mid: 10 }, { mid: 30 }, { mid: 50 }];
  it("finds the slot the pointer is above", () => {
    expect(dropIndex(0, slots)).toBe(0);
    expect(dropIndex(20, slots)).toBe(1);
    expect(dropIndex(99, slots)).toBe(3);
    expect(dropIndex(5, [])).toBe(0);
  });
});

describe("insertionIndex", () => {
  const ids = ["a", "b", "c", "d"];
  it("discounts the moving item when it is earlier in the list", () => {
    expect(insertionIndex(ids, "a", 3)).toBe(2); // before d, without a
    expect(insertionIndex(ids, "c", 1)).toBe(1);
  });
  it("leaves foreign items alone and clamps", () => {
    expect(insertionIndex(ids, "x", 2)).toBe(2);
    expect(insertionIndex(ids, "x", 99)).toBe(4);
    expect(insertionIndex(ids, "a", 99)).toBe(3);
  });
});

describe("gapBefore", () => {
  it("opens before an item, or after the last one for an end drop", () => {
    expect(gapBefore({ index: 1 }, 1, 3)).toEqual({
      before: true,
      after: false,
    });
    expect(gapBefore({ index: 3 }, 2, 3)).toEqual({
      before: false,
      after: true,
    });
    expect(gapBefore({ index: 3 }, 1, 3)).toEqual({
      before: false,
      after: false,
    });
  });
  it("skips the lifted item: later items count one position earlier", () => {
    // list a b c d, "b" (1) lifted; the drop lands before "d" (full index 3)
    expect(gapBefore({ index: 3, from: 1 }, 3, 4).before).toBe(true);
    expect(gapBefore({ index: 3, from: 1 }, 2, 4).before).toBe(false);
    // dropping back where it came from opens the gap before "c"
    expect(gapBefore({ index: 2, from: 1 }, 2, 4).before).toBe(true);
    // end of the list: the last remaining item opens the room after it
    expect(gapBefore({ index: 4, from: 1 }, 3, 4).after).toBe(true);
    expect(gapBefore({ index: 4, from: 3 }, 2, 4).after).toBe(true);
  });
});
