import { type Range } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  type EditorView,
  ViewPlugin,
  type ViewUpdate,
} from "@codemirror/view";

import { inCode } from "../inCode";
import { findHighlights } from "./highlights";

// The `==` marks themselves are hidden by livePreview.ts; this colours what is
// between them. It is a separate plugin because livePreview's decorations are
// atomic (the caret skips them) and highlighted text must stay walkable.
function build(view: EditorView): DecorationSet {
  const { doc } = view.state;
  const decorations: Range<Decoration>[] = [];
  for (const { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to;) {
      const line = doc.lineAt(pos);
      pos = line.to + 1;
      if (!line.text.includes("==") || inCode(view.state, line.from)) {
        continue;
      }
      for (const found of findHighlights(line.text, line.from)) {
        decorations.push(
          Decoration.mark({
            class: "aven-mark",
            attributes: { "data-hue": found.hue },
          }).range(found.from + 2, found.to - 2),
        );
      }
    }
  }
  return Decoration.set(decorations, true);
}

export const highlightMarks = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = build(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = build(update.view);
      }
    }
  },
  { decorations: plugin => plugin.decorations },
);
