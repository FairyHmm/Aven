import { describe, expect, it } from "vitest";

import { setBlock } from "./block";
import { toggleHighlight } from "./highlight";
import { toggleMark } from "./inline";
import {
  insertCallout,
  insertCodeBlock,
  insertFootnote,
  insertRule,
  insertTable,
} from "./insert";
import { run } from "./testing";

describe("toggleMark", () => {
  const bold = toggleMark("bold");
  const italic = toggleMark("italic");

  it("wraps the selection and keeps it selected", () => {
    expect(run(bold, "a «word» b")).toBe("a **«word»** b");
  });

  it("takes it off again, from outside or inside the selection", () => {
    expect(run(bold, "a **«word»** b")).toBe("a «word» b");
    expect(run(bold, "a «**word**» b")).toBe("a «word» b");
  });

  it("uses the word at the caret", () => {
    expect(run(bold, "a wo|rd b")).toBe("a **«word»** b");
  });

  it("opens a pair between blanks", () => {
    expect(run(bold, "a | b")).toBe("a **|** b");
  });

  it("leaves blanks at the edge of the selection outside", () => {
    expect(run(bold, "«  two words  »")).toBe("  **«two words»**  ");
  });

  it("does each line of a list apart, not the markers", () => {
    expect(run(bold, "«- a\n- b»")).toBe("- **«a**\n- **b»**");
  });

  it("tells bold from italic", () => {
    expect(run(italic, "**«x»**")).toBe("***«x»***");
    expect(run(bold, "*«x»*")).toBe("***«x»***");
    expect(run(italic, "***«x»***")).toBe("**«x»**");
    expect(run(bold, "***«x»***")).toBe("*«x»*");
  });

  it("does code, strike and math", () => {
    expect(run(toggleMark("code"), "«x»")).toBe("`«x»`");
    expect(run(toggleMark("strike"), "«x»")).toBe("~~«x»~~");
    expect(run(toggleMark("math"), "«x»")).toBe("$«x»$");
  });
});

describe("toggleHighlight", () => {
  it("highlights, plain for the default and an emoji for the rest", () => {
    expect(run(toggleHighlight("default"), "a «word» b")).toBe(
      "a ==«word»== b",
    );
    expect(run(toggleHighlight("red"), "a «word» b")).toBe("a ==🔴«word»== b");
    expect(run(toggleHighlight("yellow"), "a «word» b")).toBe(
      "a ==🟡«word»== b",
    );
  });

  it("changes the colour of text that is highlighted, or clears it", () => {
    expect(run(toggleHighlight("blue"), "==🔴wo|rd==")).toBe("==🔵«word»==");
    expect(run(toggleHighlight("red"), "==🔴wo|rd==")).toBe("«word»");
    expect(run(toggleHighlight("default"), "==wo|rd==")).toBe("«word»");
    expect(run(toggleHighlight("default"), "==🔴wo|rd==")).toBe("==«word»==");
  });
});

describe("setBlock", () => {
  it("makes lists and toggles them off", () => {
    expect(run(setBlock({ kind: "bullet" }), "«a\n\nb»")).toBe("«- a\n\n- b»");
    expect(run(setBlock({ kind: "bullet" }), "«- a\n- b»")).toBe("«a\nb»");
  });

  it("numbers the lines", () => {
    expect(run(setBlock({ kind: "number" }), "«a\nb»")).toBe("«1. a\n2. b»");
  });

  it("swaps one list for another and keeps the indent", () => {
    expect(run(setBlock({ kind: "number" }), "  - a|")).toBe("  1. a|");
    expect(run(setBlock({ kind: "task", state: " " }), "- a|")).toBe(
      "- [ ] a|",
    );
    expect(run(setBlock({ kind: "task", state: "x" }), "- [ ] a|")).toBe(
      "- [x] a|",
    );
    expect(run(setBlock({ kind: "task", state: "x" }), "- [x] a|")).toBe("a|");
  });

  it("sets and changes headings", () => {
    expect(run(setBlock({ kind: "heading", level: 2 }), "a|")).toBe("## a|");
    expect(run(setBlock({ kind: "heading", level: 3 }), "## a|")).toBe(
      "### a|",
    );
    expect(run(setBlock({ kind: "heading", level: 3 }), "### a|")).toBe("a|");
  });

  it("quotes, and goes back to plain", () => {
    expect(run(setBlock({ kind: "quote" }), "- a|")).toBe("> - a|");
    expect(run(setBlock({ kind: "quote" }), "> a|")).toBe("a|");
    expect(run(setBlock({ kind: "plain" }), "> ## a|")).toBe("a|");
  });

  it("starts a list on an empty line", () => {
    expect(run(setBlock({ kind: "bullet" }), "|")).toBe("- |");
  });
});

describe("insert", () => {
  it("puts a table after the line, with the caret below it", () => {
    const out = run(insertTable, "text|");
    expect(out.startsWith("text\n\n| Column 1 |")).toBe(true);
    expect(out.endsWith("|  |  |  |\n|")).toBe(true);
  });

  it("keeps a rule from turning the line above into a heading", () => {
    expect(run(insertRule, "text|\nmore")).toBe("text\n\n---\n|\nmore");
  });

  it("wraps the selected lines in a code block, caret by the language", () => {
    expect(run(insertCodeBlock, "«a\nb»")).toBe("```|\na\nb\n```");
  });

  it("opens an empty code block with the caret inside", () => {
    expect(run(insertCodeBlock, "|")).toBe("```\n|\n```");
  });

  it("quotes the selection under a callout line", () => {
    expect(run(insertCallout("tip"), "«a\n\nb»")).toBe(
      "> [!tip]|\n> a\n>\n> b",
    );
    expect(run(insertCallout("note"), "|")).toBe("> [!note]\n> |");
  });

  it("adds a footnote at the end and numbers the next one", () => {
    expect(run(insertFootnote, "a|")).toBe("a[^1]\n\n[^1]: |");
    expect(run(insertFootnote, "a| b\n\n[^1]: x")).toBe(
      "a[^2] b\n\n[^1]: x\n[^2]: |",
    );
  });
});
