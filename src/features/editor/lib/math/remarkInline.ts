import type { InlineCode, Parent, PhrasingContent, Root } from "mdast";

import { inlineMath } from "./scan";

function split(value: string): PhrasingContent[] | undefined {
  const spans = inlineMath(value, 0, () => false);
  if (spans.length === 0) {
    return undefined;
  }
  const parts: PhrasingContent[] = [];
  let last = 0;
  for (const span of spans) {
    if (span.from > last) {
      parts.push({ type: "text", value: value.slice(last, span.from) });
    }
    // Drawn like remark-math's own `$$x$$`: a code element marked as maths.
    const math: InlineCode = {
      type: "inlineCode",
      value: span.tex,
      data: { hProperties: { className: ["language-math", "math-inline"] } },
    };
    parts.push(math);
    last = span.to;
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
      child.type === "text" && child.value.includes("$")
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

// `$x$` in the read view. remark-math does the `$$` forms; its single-dollar
// form has no rule for money ("$5 or $6"), so this follows the editor's.
export function remarkInlineMath() {
  return (tree: Root) => {
    walk(tree);
  };
}
