import type { syntaxTree } from "@codemirror/language";

type Tree = ReturnType<typeof syntaxTree>;
type Span = { from: number; to: number };

const INLINE_PARENTS = new Set([
  "Emphasis",
  "StrongEmphasis",
  "Strikethrough",
  "InlineCode",
]);
const HEADING = /^ATXHeading[1-6]$/;

// Which marker characters of the markdown source the live preview hides: the
// `#` of a heading, the `**`/`*`/`~~` around emphasis and the backticks of
// inline code. Markers stay visible while a selection touches the element
// they belong to, so the source is there to edit. `nextChar` reads one
// character of the document; ranges are returned in document order.
export function hiddenMarkRanges(
  tree: Tree,
  selection: readonly Span[],
  nextChar: (pos: number) => string,
  range: Span,
): Span[] {
  const hidden: Span[] = [];
  tree.iterate({
    from: range.from,
    to: range.to,
    enter: node => {
      const parent = node.node.parent;
      if (parent === null || !isHideable(node.name, parent.name)) {
        return;
      }
      const touched = selection.some(
        part => part.from <= parent.to && part.to >= parent.from,
      );
      if (touched) {
        return;
      }
      // A heading's `#` also takes the space that follows it.
      const gap = node.name === "HeaderMark" && nextChar(node.to) === " ";
      hidden.push({ from: node.from, to: gap ? node.to + 1 : node.to });
    },
  });
  return hidden;
}

function isHideable(name: string, parent: string): boolean {
  switch (name) {
    case "HeaderMark":
      return HEADING.test(parent);
    case "CodeMark":
      return parent === "InlineCode";
    case "EmphasisMark":
    case "StrikethroughMark":
      return INLINE_PARENTS.has(parent);
    default:
      return false;
  }
}
