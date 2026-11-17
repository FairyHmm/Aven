import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { describe, expect, it } from "vitest";

import { remarkHighlight } from "../highlight/remark";
import { remarkTasks } from "../tasks";
import { rehypeHtml, remarkHtmlOptions } from "./sanitize";

function render(body: string): string {
  return renderToStaticMarkup(
    createElement(
      Markdown,
      {
        remarkPlugins: [remarkGfm, remarkTasks, remarkHighlight],
        rehypePlugins: rehypeHtml,
        remarkRehypeOptions: remarkHtmlOptions,
      },
      body,
    ),
  );
}

describe("html in a card", () => {
  it("renders inline tags, line breaks included, in text and table cells", () => {
    expect(render("one<br>two")).toBe("<p>one<br/>two</p>");
    expect(render("H<sub>2</sub>O and <kbd>Ctrl</kbd> <u>x</u>")).toBe(
      "<p>H<sub>2</sub>O and <kbd>Ctrl</kbd> <u>x</u></p>",
    );
    expect(render("| a |\n| - |\n| x<br/>y |")).toContain("<td>x<br/>y</td>");
  });

  it("renders blocks: details with a summary, and a div", () => {
    const html = render(
      "<details><summary>More</summary>\n\nInside\n\n</details>",
    );
    expect(html).toContain("<details><summary>More</summary>");
    expect(html).toContain("<p>Inside</p>");
    expect(render('<div align="center">hi</div>')).toContain(
      '<div align="center">hi</div>',
    );
  });

  it("drops script, event handlers, styles and unsafe links", () => {
    expect(render("a<script>alert(1)</script>b")).not.toContain("<script");
    expect(render('<b onclick="alert(1)">hi</b>')).toBe("<p><b>hi</b></p>");
    expect(render('<span style="position:fixed">x</span>')).not.toContain(
      "style",
    );
    expect(render('<a href="javascript:alert(1)">x</a>')).not.toContain(
      "javascript:",
    );
    expect(render('<iframe src="//evil"></iframe>')).not.toContain("<iframe");
    expect(render('<img src=x onerror="alert(1)">')).not.toContain("onerror");
  });

  it("keeps what our own plugins add", () => {
    expect(render("- [ ] todo")).toContain("data-task");
    expect(render("==marked==")).toContain("<mark");
  });
});
