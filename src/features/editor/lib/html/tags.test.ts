import { describe, expect, it } from "vitest";

import { findHtmlPairs } from "./tags";

describe("findHtmlPairs", () => {
  it("finds a tag with its closing tag, at its place in the document", () => {
    expect(findHtmlPairs("H<sub>2</sub>O", 10)).toEqual([
      { tag: "sub", from: 11, openEnd: 16, closeStart: 17, to: 23 },
    ]);
  });

  it("finds several, in any case, and skips a tag that never closes", () => {
    const pairs = findHtmlPairs("<B>a</b> x <kbd>y</KBD> <u>z", 0);
    expect(pairs.map(pair => pair.tag)).toEqual(["b", "kbd"]);
  });

  it("leaves tags it does not draw, and tags with attributes, alone", () => {
    expect(findHtmlPairs('<span>x</span> <b class="a">y</b>', 0)).toEqual([]);
  });
});
