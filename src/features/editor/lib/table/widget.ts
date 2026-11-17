import { syntaxTree } from "@codemirror/language";
import { type EditorState, type Range } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  type EditorView,
} from "@codemirror/view";

import { blockField, HubWidget, touches } from "../widgets/base";
import type { WidgetContent } from "../widgets/hub";

// How long the table's markdown was when last drawn.
const lengths = new WeakMap<HTMLElement, number>();

class TableWidget extends HubWidget {
  protected readonly hostClass = "aven-widget aven-table";

  constructor(readonly source: string) {
    super();
  }

  override eq(other: TableWidget): boolean {
    return other.source === this.source;
  }

  protected content(view: EditorView, host: HTMLElement): WidgetContent {
    return {
      kind: "table",
      source: this.source,
      change: (next: string) => {
        // Where the table is now, and how long it was when last drawn.
        const from = view.posAtDOM(host);
        const length = lengths.get(host) ?? this.source.length;
        view.dispatch({ changes: { from, to: from + length, insert: next } });
      },
      leave: (direction: "up" | "down") => {
        const { doc } = view.state;
        const from = view.posAtDOM(host);
        const to = from + (lengths.get(host) ?? this.source.length);
        if (direction === "up") {
          const line = doc.lineAt(from);
          const anchor = line.number > 1 ? doc.line(line.number - 1).to : from;
          view.dispatch({ selection: { anchor }, scrollIntoView: true });
        } else {
          const line = doc.lineAt(to);
          if (line.number < doc.lines) {
            view.dispatch({
              selection: { anchor: doc.line(line.number + 1).from },
              scrollIntoView: true,
            });
          } else {
            // The table ends the document: make a line to stand on.
            view.dispatch({
              changes: { from: doc.length, insert: "\n" },
              selection: { anchor: doc.length + 1 },
              scrollIntoView: true,
            });
          }
        }
        view.focus();
      },
    };
  }

  protected override created(host: HTMLElement): void {
    lengths.set(host, this.source.length);
  }

  // Typing in a cell rewrites the markdown; the grid keeps its node (and the
  // focus in it).
  protected override updated(host: HTMLElement): void {
    lengths.set(host, this.source.length);
  }

  override get estimatedHeight(): number {
    return 34 * (this.source.split("\n").length - 1);
  }
}

function build(state: EditorState): DecorationSet {
  const decorations: Range<Decoration>[] = [];
  syntaxTree(state).iterate({
    enter: node => {
      if (node.name !== "Table") {
        return;
      }
      // The caret in the markdown (an arrow key, the Source button) shows it.
      if (!touches(state, node.from, node.to)) {
        decorations.push(
          Decoration.replace({
            widget: new TableWidget(state.sliceDoc(node.from, node.to)),
            block: true,
          }).range(node.from, node.to),
        );
      }
    },
  });
  return Decoration.set(decorations, true);
}

// A table is a grid you edit in place, until the caret goes into its markdown.
export const tables = blockField(build);
