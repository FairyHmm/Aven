import { MantineProvider } from "@mantine/core";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MarkdownView } from "./MarkdownView";

const render = (body: string) =>
  renderToStaticMarkup(
    createElement(MantineProvider, null, createElement(MarkdownView, { body })),
  );

describe("MarkdownView", () => {
  // The HTML step parses the tree again, which turns the offset of a task into
  // a string: the boxes must still be drawn.
  it("draws the boxes of tasks, whatever their state", () => {
    const html = render("- [ ] one\n- [x] two\n- [!] three\n");
    expect(html.match(/role="checkbox"/g)).toHaveLength(3);
  });

  it("draws maths, and leaves money alone", () => {
    const html = render("$x^2$ costs $5 or $6\n");
    expect(html).toContain("$5 or $6");
    expect(html).toContain("x^2");
  });
});
