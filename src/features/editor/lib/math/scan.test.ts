import { describe, expect, it } from "vitest";

import { inlineMath, mathBlocks } from "./scan";

const never = () => false;

describe("inlineMath", () => {
  it("finds $x$ and $$x$$ and gives their place", () => {
    const found = inlineMath("a $x^2$ b $$y$$ c", 10, never);
    expect(
      found.map(span => [span.from, span.to, span.tex, span.display]),
    ).toEqual([
      [12, 17, "x^2", false],
      [20, 25, "y", true],
    ]);
  });

  it("leaves money and spaced dollars alone", () => {
    expect(inlineMath("costs $5 and $6 or $ x $", 0, never)).toEqual([]);
  });

  it("skips code", () => {
    expect(inlineMath("`$x$`", 0, pos => pos === 1)).toEqual([]);
  });
});

describe("mathBlocks", () => {
  it("finds a block over several lines and one on a line", () => {
    const text = "a\n$$\nx = 1\n$$\nb\n$$ y $$\n";
    const found = mathBlocks(text, never);
    expect(found.map(span => span.tex)).toEqual(["x = 1", "y"]);
    expect(text.slice(found[0]?.from, found[0]?.to)).toBe("$$\nx = 1\n$$");
  });

  it("ignores one that never closes", () => {
    expect(mathBlocks("$$\nx = 1\n", never)).toEqual([]);
  });
});
