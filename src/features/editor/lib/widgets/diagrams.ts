import { syntaxTree } from "@codemirror/language";
import { type EditorState, type Range } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  type EditorView,
} from "@codemirror/view";

import { blockField, HubWidget, touches } from "./base";
import type { WidgetContent } from "./hub";

// Where a click puts the caret: the first line of the diagram's source,
// counted from where the widget starts.
const targets = new WeakMap<HTMLElement, number>();

class DiagramWidget extends HubWidget {
  protected readonly hostClass = "aven-widget aven-diagram";

  constructor(
    readonly source: string,
    readonly target: number,
  ) {
    super();
  }

  override eq(other: DiagramWidget): boolean {
    return other.source === this.source && other.target === this.target;
  }

  protected content(): WidgetContent {
    return { kind: "diagram", source: this.source };
  }

  protected override created(host: HTMLElement, view: EditorView): void {
    targets.set(host, this.target);
    // Clicking the picture opens its source, instead of making the reader walk
    // the caret up to it with the arrow keys.
    host.addEventListener("mousedown", event => {
      const target = targets.get(host) ?? -1;
      // -1: the source is already open and this is the live copy below it.
      if (target >= 0) {
        event.preventDefault();
        view.dispatch({ selection: { anchor: view.posAtDOM(host) + target } });
        view.focus();
      }
    });
  }

  protected override updated(host: HTMLElement): void {
    targets.set(host, this.target);
  }

  override get estimatedHeight(): number {
    return 120;
  }
}

function build(state: EditorState): DecorationSet {
  const decorations: Range<Decoration>[] = [];
  syntaxTree(state).iterate({
    enter: node => {
      if (node.name !== "FencedCode") {
        return;
      }
      const info = node.node.getChild("CodeInfo");
      const text = node.node.getChild("CodeText");
      if (
        info === null ||
        text === null ||
        state.sliceDoc(info.from, info.to).trim() !== "mermaid"
      ) {
        return;
      }
      const source = state.sliceDoc(text.from, text.to);
      if (source.trim() === "") {
        return;
      }
      const touched = touches(state, node.from, node.to);
      const widget = new DiagramWidget(
        source,
        touched ? -1 : text.from - node.from,
      );
      // While the fence is being edited its diagram is drawn right below it,
      // live; otherwise the diagram stands in for the whole fence.
      decorations.push(
        touched
          ? Decoration.widget({ widget, block: true, side: 1 }).range(node.to)
          : Decoration.replace({ widget, block: true }).range(
              node.from,
              node.to,
            ),
      );
    },
  });
  return Decoration.set(decorations, true);
}

export const diagrams = blockField(build);
