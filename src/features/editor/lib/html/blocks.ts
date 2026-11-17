import { syntaxTree } from "@codemirror/language";
import { type EditorState, type Range } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  type EditorView,
} from "@codemirror/view";

import { blockField, HubWidget, touches } from "../widgets/base";
import type { WidgetContent } from "../widgets/hub";

// A block of HTML (`<div>…`, `<details>…`) drawn as what it says, through the
// same sanitizing pipeline as the read view. It ends at a blank line, as the
// markdown parser sees it. A click puts the caret in its source.
class HtmlBlockWidget extends HubWidget {
  protected readonly hostClass = "aven-widget aven-html-block";

  constructor(readonly source: string) {
    super();
  }

  override eq(other: HtmlBlockWidget): boolean {
    return other.source === this.source;
  }

  protected content(): WidgetContent {
    return { kind: "html", source: this.source };
  }

  protected override created(host: HTMLElement, view: EditorView): void {
    host.addEventListener("mousedown", event => {
      const target = event.target;
      if (
        !(target instanceof Element) ||
        target.closest("a, summary") === null
      ) {
        event.preventDefault();
        view.dispatch({ selection: { anchor: view.posAtDOM(host) } });
        view.focus();
      }
    });
  }

  override get estimatedHeight(): number {
    return 40;
  }
}

function build(state: EditorState): DecorationSet {
  const decorations: Range<Decoration>[] = [];
  syntaxTree(state).iterate({
    enter: node => {
      if (node.name !== "HTMLBlock" || touches(state, node.from, node.to)) {
        return;
      }
      decorations.push(
        Decoration.replace({
          widget: new HtmlBlockWidget(state.sliceDoc(node.from, node.to)),
          block: true,
        }).range(node.from, node.to),
      );
    },
  });
  return Decoration.set(decorations, true);
}

export const htmlBlocks = blockField(build);
