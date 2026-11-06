import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { describe, expect, it } from "vitest";

import { rehypeTableMerge } from "./tableMerge";

function render(body: string): string {
  return renderToStaticMarkup(
    createElement(
      Markdown,
      { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeTableMerge] },
      body,
    ),
  );
}

const rows = (html: string) => html.split("<tr>").slice(1);

describe("rehypeTableMerge", () => {
  it("merges a `<` cell into the cell on its left", () => {
    const html = render("| A | B | C |\n| - | - | - |\n| x | < | y |\n");
    expect(html).toContain('<td colSpan="2">x</td><td>y</td>');
  });

  it("merges a `^` cell into the cell above", () => {
    const html = render("| A | B |\n| - | - |\n| x | y |\n| ^ | z |\n");
    const [, first, second] = rows(html);
    expect(first).toContain('<td rowSpan="2">x</td>');
    expect(second).toBe("<td>z</td></tr></tbody></table>");
  });

  it("collects runs of `<` and `^` into one cell", () => {
    const html = render(
      "| A | B | C |\n| - | - | - |\n| x | < | < |\n| ^ | ^ | ^ |\n| y | z | w |\n",
    );
    expect(html).toContain('<td colSpan="3" rowSpan="2">x</td>');
    expect(html.match(/<td/g)).toHaveLength(4);
  });

  it("leaves a mark with nothing to merge into as text", () => {
    const left = render("| A | B |\n| - | - |\n| < | y |\n");
    expect(left).toContain("<td>&lt;</td><td>y</td>");
    const above = render("| A | B |\n| - | - |\n| ^ | y |\n");
    expect(above).toContain("<td>^</td><td>y</td>");
  });

  it("ignores marks that share a cell with other text", () => {
    const html = render("| A | B |\n| - | - |\n| x | < no |\n");
    expect(html).toContain("<td>&lt; no</td>");
  });
});
