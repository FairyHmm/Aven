import { syntaxTree } from "@codemirror/language";
import { type Range } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
} from "@codemirror/view";

import { hiddenMarkRanges } from "./marks";

const hide = Decoration.replace({});

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
