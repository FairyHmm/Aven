import { syntaxTree } from "@codemirror/language";
import { type Range } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
} from "@codemirror/view";

import { findHighlights } from "./highlight/highlights";
import { findHtmlPairs } from "./html/tags";
import { inCode } from "./inCode";
import { hiddenMarkRanges } from "./marks";

const hide = Decoration.replace({});
const codeLine = Decoration.line({ class: "aven-code" });

function build(view: EditorView): DecorationSet {
  const { state } = view;
  const tree = syntaxTree(state);
  const selection = state.selection.ranges;
  const decorations: Range<Decoration>[] = [];
  for (const range of view.visibleRanges) {
    const spans = hiddenMarkRanges(
      tree,
      selection,
      pos => state.sliceDoc(pos, pos + 1),
      range,
    );
    for (const { from, to } of spans) {
      decorations.push(hide.range(from, to));
    }
  }
  // The `==` around a highlight, until the caret is in it.
  for (const { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to;) {
      const line = state.doc.lineAt(pos);
      pos = line.to + 1;
      if (!line.text.includes("==") || inCode(state, line.from)) {
        continue;
      }
      for (const found of findHighlights(line.text, line.from)) {
        if (!selection.some(r => r.from <= found.to && r.to >= found.from)) {
          // The colour circle is a key, not text: it is hidden with the marks.
          decorations.push(
            hide.range(found.from, found.from + 2 + (found.emoji?.length ?? 0)),
          );
          decorations.push(hide.range(found.to - 2, found.to));
        }
      }
    }
  }
  // `<sub>2</sub>` and the like: the tags hide, and the text between shows as
  // what the tag says, until the caret is in it.
  for (const { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to;) {
      const line = state.doc.lineAt(pos);
      pos = line.to + 1;
      if (!line.text.includes("</") || inCode(state, line.from)) {
        continue;
      }
      for (const pair of findHtmlPairs(line.text, line.from)) {
        decorations.push(
          Decoration.mark({ class: `aven-html-${pair.tag}` }).range(
            pair.openEnd,
            pair.closeStart,
          ),
        );
        if (!selection.some(r => r.from <= pair.to && r.to >= pair.from)) {
          decorations.push(hide.range(pair.from, pair.openEnd));
          decorations.push(hide.range(pair.closeStart, pair.to));
        }
      }
    }
  }
  // Fenced code gets a block of its own, line by line.
  tree.iterate({
    enter: node => {
      if (node.name !== "FencedCode") {
        return;
      }
      const last = state.doc.lineAt(node.to).number;
      for (let n = state.doc.lineAt(node.from).number; n <= last; n += 1) {
        decorations.push(codeLine.range(state.doc.line(n).from));
      }
    },
  });
  return Decoration.set(decorations, true);
}

// Obsidian-style live preview: markdown markers disappear except around the
// cursor. Marker hiding is the only decoration; the styling of headings,
// emphasis and so on comes from the highlight style (see theme.ts).
export const livePreview = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = build(view);
    }

    update(update: ViewUpdate) {
      const reparsed =
        syntaxTree(update.startState) !== syntaxTree(update.state);
      if (
        update.docChanged ||
        update.selectionSet ||
        update.viewportChanged ||
        reparsed
      ) {
        this.decorations = build(update.view);
      }
    }
  },
  {
    decorations: plugin => plugin.decorations,
    // Hidden markers must not trap the cursor: arrow keys step over them.
    provide: plugin =>
      EditorView.atomicRanges.of(view => {
        return view.plugin(plugin)?.decorations ?? Decoration.none;
      }),
  },
);
