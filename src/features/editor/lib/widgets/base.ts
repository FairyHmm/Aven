import { syntaxTree } from "@codemirror/language";
import { type EditorState, StateField } from "@codemirror/state";
import { type DecorationSet, EditorView, WidgetType } from "@codemirror/view";

import { hubFacet, type WidgetContent, type WidgetHub } from "./hub";

const hubs = new WeakMap<HTMLElement, WidgetHub>();

// A widget whose node is filled by React through the hub (see EditorWidgets):
// CodeMirror makes, redraws and drops the node, the hub follows. A subclass
// says what the node holds and what it is called; the rest is the same for
// all of them.
export abstract class HubWidget extends WidgetType {
  // The `class` of the node, and what element it is.
  protected abstract readonly hostClass: string;
  protected readonly tag: "div" | "span" = "div";

  protected abstract content(
    view: EditorView,
    host: HTMLElement,
  ): WidgetContent;

  // The node was just made (before it is drawn), or is being redrawn in place.
  protected created(_host: HTMLElement, _view: EditorView): void {}
  protected updated(_host: HTMLElement, _view: EditorView): void {}

  override toDOM(view: EditorView): HTMLElement {
    const host = document.createElement(this.tag);
    host.className = this.hostClass;
    this.created(host, view);
    const hub = view.state.facet(hubFacet);
    if (hub !== undefined) {
      hubs.set(host, hub);
      hub.add(host, this.content(view, host));
    }
    return host;
  }

  // Typing in the source redraws the widget in the same node.
  override updateDOM(host: HTMLElement, view: EditorView): boolean {
    this.updated(host, view);
    hubs.get(host)?.update(host, this.content(view, host));
    return true;
  }

  override destroy(host: HTMLElement): void {
    hubs.get(host)?.remove(host);
    hubs.delete(host);
  }

  // What is inside handles its own events.
  override ignoreEvent(): boolean {
    return true;
  }
}

// Whether the selection touches `from` to `to`: the caret in a piece of
// markdown shows it as source instead of as a widget.
export const touches = (state: EditorState, from: number, to: number) =>
  state.selection.ranges.some(range => range.from <= to && range.to >= from);

// Block decorations cannot come from a view plugin, hence a state field. It is
// built again when the text, the selection or the syntax tree changes.
export function blockField(
  build: (state: EditorState) => DecorationSet,
): StateField<DecorationSet> {
  return StateField.define<DecorationSet>({
    create: build,
    update: (value, transaction) =>
      transaction.docChanged ||
      transaction.selection !== undefined ||
      syntaxTree(transaction.startState) !== syntaxTree(transaction.state)
        ? build(transaction.state)
        : value,
    provide: field => EditorView.decorations.from(field),
  });
}
