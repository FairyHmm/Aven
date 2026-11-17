import type { Emphasis, Parent, PhrasingContent, Root } from "mdast";

import { HIGHLIGHT_PATTERN, hueOf } from "./highlights";

function split(value: string): PhrasingContent[] | undefined {
  const parts: PhrasingContent[] = [];
  let last = 0;
  for (const match of value.matchAll(HIGHLIGHT_PATTERN)) {
    const content = match[1] ?? "";
    const { hue, emoji } = hueOf(content);
    if (match.index > last) {
      parts.push({ type: "text", value: value.slice(last, match.index) });
    }
    // An emphasis node drawn as <mark>: no new node type to teach the rest.
    const mark: Emphasis = {
      type: "emphasis",
      // The circle only picks the colour.
      children: [{ type: "text", value: content.slice(emoji?.length ?? 0) }],
      data: { hName: "mark", hProperties: { dataHue: hue } },
    };
    parts.push(mark);
    last = match.index + match[0].length;
  }
  if (parts.length === 0) {
    return undefined;
  }
  if (last < value.length) {
    parts.push({ type: "text", value: value.slice(last) });
  }
  return parts;
}

function walk(parent: Parent): void {
  const next: Parent["children"] = [];
  for (const child of parent.children) {
    const replaced =
      child.type === "text" && child.value.includes("==")
        ? split(child.value)
        : undefined;
    if (replaced === undefined) {
      if ("children" in child) {
        walk(child);
      }
      next.push(child);
    } else {
      next.push(...replaced);
    }
  }
  parent.children = next;
}

// `==highlight==` in the read view, with the same colour circles as the editor.
export function remarkHighlight() {
  return (tree: Root) => {
    walk(tree);
  };
}
