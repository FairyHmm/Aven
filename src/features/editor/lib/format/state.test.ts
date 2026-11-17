import { describe, expect, it } from "vitest";

import { clearFormat, stripMarks } from "./clear";
import { activeAt } from "./state";
import { run } from "./testing";

describe("clearFormat", () => {
  it("takes the marks off, and keeps the text", () => {
    expect(stripMarks("**a** *b* ~~c~~ ==🔴d== `e` f_g")).toBe("a b c d e f_g");
    expect(stripMarks("2 * 3 * 4")).toBe("2 * 3 * 4");
  });

  it("does the selection, or the line at a caret", () => {
    expect(run(clearFormat, "«**a** b»")).toBe("«a b»");
    expect(run(clearFormat, "- **a** *b|*")).toBe("- «a b»");
  });

  it("takes a mark that is only partly selected, whole", () => {
    expect(run(clearFormat, "**«a b»**")).toBe("«a b»");
  });
});

describe("activeAt", () => {
  it("tells the marks, the colour and the block", () => {
    expect(activeAt("**a**", { from: 3, to: 3 }).marks).toEqual(["bold"]);
    expect(activeAt("==🔴a==", { from: 4, to: 4 }).hue).toBe("red");
    expect(activeAt("## a", { from: 3, to: 3 }).block).toEqual({
      kind: "heading",
      level: 2,
    });
    expect(activeAt("> - [x] a", { from: 8, to: 8 })).toMatchObject({
      block: { kind: "task", state: "x" },
      quote: true,
    });
  });
});
