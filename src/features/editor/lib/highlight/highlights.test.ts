import { describe, expect, it } from "vitest";

import { findHighlights } from "./highlights";

describe("findHighlights", () => {
  it("finds a plain highlight, yellow", () => {
    expect(findHighlights("a ==hello== b", 10)).toEqual([
      { from: 12, to: 21, hue: "default", emoji: undefined },
    ]);
  });

  it("takes the colour from a leading circle", () => {
    const [found] = findHighlights("==🔴Red highlight==");
    expect(found?.hue).toBe("red");
    expect(found?.emoji).toBe("🔴");
  });

  it("finds several on a line", () => {
    expect(findHighlights("==a== and ==🟢b==")).toHaveLength(2);
  });

  it("leaves comparisons and unclosed marks alone", () => {
    expect(findHighlights("if a == b then c == d")).toEqual([]);
    expect(findHighlights("==open only")).toEqual([]);
    expect(findHighlights("====")).toEqual([]);
  });
});
