import { describe, expect, it } from "vitest";

import { cardKind } from "./kind";

describe("cardKind", () => {
  it("treats a mermaid fence as a diagram", () => {
    expect(cardKind("intro\n\n```mermaid\nflowchart LR\n  A --> B\n```")).toBe(
      "diagram",
    );
  });

  it("treats everything else as a note", () => {
    expect(cardKind("")).toBe("note");
    expect(cardKind("```js\nlet a;\n```")).toBe("note");
    expect(cardKind("mention ```mermaid inline")).toBe("note");
  });
});
