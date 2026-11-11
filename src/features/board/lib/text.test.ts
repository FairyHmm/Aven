import { describe, expect, it } from "vitest";

import { joinCard, splitCard } from "./text";

describe("joinCard", () => {
  it("is just the title when there is no body", () => {
    expect(joinCard({ title: "Ship it", body: "" })).toBe("Ship it");
  });

  it("puts the body on the lines under the title", () => {
    expect(
      joinCard({ title: "Ship it", body: "- [ ] build\n- [ ] test" }),
    ).toBe("Ship it\n- [ ] build\n- [ ] test");
  });
});

describe("splitCard", () => {
  it("takes the first line as the title and the rest as the body", () => {
    expect(splitCard("Ship it\n- [ ] build\n- [ ] test")).toEqual({
      title: "Ship it",
      body: "- [ ] build\n- [ ] test",
    });
  });

  it("drops the blank lines under the title and trailing whitespace", () => {
    expect(splitCard("Ship it\n\n\nnotes here\n\n")).toEqual({
      title: "Ship it",
      body: "notes here",
    });
  });

  it("keeps the indentation of the first body line", () => {
    expect(splitCard("Snippet\n\n    code()")).toEqual({
      title: "Snippet",
      body: "    code()",
    });
  });

  it("gives an empty title and body for empty text", () => {
    expect(splitCard("")).toEqual({ title: "", body: "" });
  });

  it("leaves a --- block in the body: properties are not typed here", () => {
    expect(splitCard("T\n---\na: 1\n---")).toEqual({
      title: "T",
      body: "---\na: 1\n---",
    });
  });

  it("round-trips a card", () => {
    const card = { title: "Plan", body: "intro\n\n```mermaid\nA --> B\n```" };
    expect(splitCard(joinCard(card))).toEqual(card);
  });
});
