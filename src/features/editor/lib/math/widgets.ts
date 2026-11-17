import { type EditorState, type Range } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  type EditorView,
} from "@codemirror/view";

import { inCode } from "../inCode";
import { blockField, HubWidget, touches } from "../widgets/base";
import type { WidgetContent } from "../widgets/hub";
import { inlineMath, mathBlocks, type MathSpan } from "./scan";

class MathWidget extends HubWidget {
  protected readonly hostClass: string;
  protected override readonly tag: "div" | "span";

  constructor(
    readonly tex: string,
    readonly display: boolean,
  ) {
    super();
    this.tag = display ? "div" : "span";
    this.hostClass = display ? "aven-widget aven-math" : "aven-math";
  }

  override eq(other: MathWidget): boolean {
    return other.tex === this.tex && other.display === this.display;
  }

  protected content(): WidgetContent {
    return { kind: "math", tex: this.tex, display: this.display };
  }

  // Clicking the formula opens its source.
  protected override created(host: HTMLElement, view: EditorView): void {
    host.addEventListener("mousedown", event => {
      event.preventDefault();
      view.dispatch({
        selection: { anchor: view.posAtDOM(host) + (this.display ? 0 : 1) },
      });
      view.focus();
    });
  }

  override get estimatedHeight(): number {
    return this.display ? 48 : -1;
  }
}

// The formula the caret is in, if it is (shown as source, with its picture
// floating over it: see MathPreview).
export const mathAt = (state: EditorState, pos: number) =>
  spans(state).find(span => pos >= span.from && pos <= span.to);

function spans(state: EditorState): MathSpan[] {
  const text = state.doc.toString();
  const code = (pos: number) => inCode(state, pos);
  const blocks = mathBlocks(text, code);
  const found = [...blocks];
  let at = 0;
  for (const line of text.split("\n")) {
    const inBlock = blocks.some(block => at >= block.from && at <= block.to);
    if (!inBlock && line.includes("$")) {
      found.push(...inlineMath(line, at, code));
    }
    at += line.length + 1;
  }
  return found;
}

function build(state: EditorState): DecorationSet {
  const decorations: Range<Decoration>[] = [];
  for (const span of spans(state)) {
    const touched = touches(state, span.from, span.to);
    const block =
      span.display && state.doc.lineAt(span.from).from === span.from;
    if (!touched) {
      decorations.push(
        Decoration.replace({
          widget: new MathWidget(span.tex, span.display),
          block,
        }).range(span.from, span.to),
      );
    }
  }
  return Decoration.set(decorations, true);
}

// Formulas drawn in place of their `$` source, except where the caret is.
export const mathWidgets = blockField(build);
