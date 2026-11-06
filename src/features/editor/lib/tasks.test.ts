import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { describe, expect, it } from "vitest";

import { remarkTasks, toggled } from "./tasks";

type Found = { state: unknown; offset: unknown; text: string };

function parse(body: string): { items: Found[]; html: string } {
  const items: Found[] = [];
  const html = renderToStaticMarkup(
    createElement(
      Markdown,
      {
        remarkPlugins: [remarkGfm, remarkTasks],
        components: {
          li: ({ node, children }) => {
            items.push({
              state: node?.properties["dataTask"],
              offset: node?.properties["dataOffset"],
              text: renderToStaticMarkup(createElement("i", null, children)),
            });
            return createElement("li", null, children);
          },
        },
      },
      body,
    ),
  );
  return { items, html };
}

describe("remarkTasks", () => {
  const body = [
    "- [ ] Unchecked",
    "- [x] Checked",
    "- [>] Rescheduled",
    "- [/] In progress",
    "  - [?] Nested question",
    "- plain item",
    "1. [!] Ordered",
  ].join("\n");

  it("tags every task item with its state and source offset", () => {
    const { items } = parse(body);
    const tasks = items.filter(item => item.state !== undefined);
    // Components may run more than once per item, and nested items before
    // their parent, so compare the distinct states.
    expect(new Set(tasks.map(item => item.state))).toEqual(
      new Set([" ", "x", ">", "/", "?", "!"]),
    );
    for (const task of tasks) {
      expect(typeof task.offset).toBe("number");
      expect(body.charAt(Number(task.offset))).toBe(task.state);
    }
  });

  it("strips custom markers from the text and leaves other items alone", () => {
    const { items, html } = parse(body);
    expect(html).not.toContain("[>]");
    expect(html).not.toContain('type="checkbox"');
    expect(items.find(item => item.state === ">")?.text).toContain(
      "Rescheduled",
    );
    expect(items.find(item => item.state === undefined)?.text).toContain(
      "plain item",
    );
  });
});

describe("toggled", () => {
  it("checks anything but a checked task, and unchecks a checked one", () => {
    expect(toggled(" ")).toBe("x");
    expect(toggled("/")).toBe("x");
    expect(toggled("x")).toBe(" ");
  });
});
