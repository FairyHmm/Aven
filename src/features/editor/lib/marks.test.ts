import { markdownLanguage } from "@codemirror/lang-markdown";
import { describe, expect, it } from "vitest";

import { hiddenMarkRanges } from "./marks";

function hiddenIn(doc: string, cursor: number) {
  const tree = markdownLanguage.parser.parse(doc);
  return hiddenMarkRanges(
    tree,
    [{ from: cursor, to: cursor }],
    pos => doc.slice(pos, pos + 1),
    { from: 0, to: doc.length },
  );
}

describe("hiddenMarkRanges", () => {
  const doc = "# Title\n\nhello **bold** and `code`";
  const bold = doc.indexOf("**bold**");
  const code = doc.indexOf("`code`");

  it("hides the markers of every element the cursor is not in", () => {
    const hidden = hiddenIn(doc, doc.indexOf("\n\n") + 1); // the blank line
    expect(hidden).toContainEqual({ from: 0, to: 2 }); // "# "
    expect(hidden).toContainEqual({ from: bold, to: bold + 2 });
    expect(hidden).toContainEqual({ from: bold + 6, to: bold + 8 });
    // The inline code span is hidden too, backticks only.
    expect(hidden).toContainEqual({ from: code, to: code + 1 });
  });

  it("keeps the markers of the element being edited", () => {
    const hidden = hiddenIn(doc, bold + 4);
    expect(hidden.some(span => span.from >= bold && span.to <= bold + 8)).toBe(
      false,
    );
    expect(hidden).toContainEqual({ from: 0, to: 2 });
  });

  it("keeps a heading's marker while the cursor is in the heading", () => {
    expect(hiddenIn(doc, 3)).not.toContainEqual({ from: 0, to: 2 });
  });

  it("leaves fenced code fences alone", () => {
    expect(hiddenIn("```js\nlet a = 1;\n```\n\ntext", 24)).toEqual([]);
  });
});
