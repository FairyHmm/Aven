import { MantineProvider } from "@mantine/core";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { guideBoards } from "../../welcome/lib/guide";
import {
  hasCallout,
  hasHighlightedCode,
  hasHtml,
  needsRichMarkdown,
} from "../lib/html/needs";
import { liteRehypePlugins, MarkdownBody } from "./MarkdownBody";
import { MarkdownRich } from "./MarkdownRich";

const html = (body: string, rich: boolean) =>
  renderToStaticMarkup(
    createElement(
      MantineProvider,
      null,
      rich
        ? createElement(MarkdownRich, { body })
        : createElement(MarkdownBody, {
            body,
            rehypePlugins: liteRehypePlugins,
          }),
    ),
  );

const plain = [
  "**bold**, *italic*, ~~struck~~ and ==highlighted== text, plus `inline code`.",
  "- [x] Done\n- [/] In progress\n- [ ] To do\n- [!] Important",
  "| Team | Task | Status |\n|---|---|---|\n| Design | Mockups | Done |\n| ^ | Icons | In progress |\n| Build | Board | < |",
  "Euler: $e^{i\\pi} + 1 = 0$ and money $5 or $6\n\n$$\nx^2\n$$",
  "```mermaid\nflowchart LR\n  A --> B\n```",
  "---\ntitle: hidden\n---\n\n# Heading\n\n1. one\n2. two",
  "A [link](https://example.com) and ![img](https://example.com/a.png)",
];

describe("the light markdown pipeline", () => {
  it("draws every plain card exactly as the full pipeline does", () => {
    const guide = guideBoards()
      .flatMap(board => board.data.cards)
      .map(card => card.body)
      .filter(body => !needsRichMarkdown(body));
    expect(guide.length).toBeGreaterThan(10);
    for (const body of [...plain, ...guide]) {
      expect(needsRichMarkdown(body)).toBe(false);
      expect(html(body, false)).toBe(html(body, true));
    }
  });

  it("only the full pipeline highlights code and reads HTML", () => {
    const code = "```ts\nconst a = 1;\n```";
    expect(html(code, true)).toContain("hljs-keyword");
    expect(html(code, false)).not.toContain("hljs-keyword");
    const callout = "> [!tip]- Folded\n> Watch out.";
    expect(html(callout, true)).toContain("<details");
    const withHtml = "Press <u>this</u> now";
    expect(html(withHtml, true)).toContain("<u>this</u>");
  });

  it("sends the cards that need the heavy parts to the full pipeline", () => {
    expect(hasHtml("a <b>bold</b> word")).toBe(true);
    expect(hasCallout("> [!tip]- Folded\n> Click.")).toBe(true);
    expect(hasCallout("> a plain quote")).toBe(false);
    expect(hasHtml("<https://example.com>")).toBe(true);
    expect(hasHtml("1 < 2 and 3 > 2")).toBe(false);
    expect(hasHighlightedCode("```ts\nx\n```")).toBe(true);
    expect(hasHighlightedCode("~~~py\nx\n~~~")).toBe(true);
    expect(hasHighlightedCode("```\nplain\n```")).toBe(false);
    expect(hasHighlightedCode("```mermaid\nflowchart LR\n```")).toBe(false);
    expect(hasHighlightedCode("```math\nx\n```")).toBe(false);
    expect(hasHighlightedCode("a ```inline``` b")).toBe(false);
  });
});
