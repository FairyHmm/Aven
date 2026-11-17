import { syntaxTree } from "@codemirror/language";
import { type Range } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
} from "@codemirror/view";

import { inCode } from "../inCode";
import { menuFacet } from "../menuFacet";
import { asTaskState, type TaskState } from "../tasks";
import { HubWidget } from "./base";
import type { WidgetContent } from "./hub";

// `- [c] `: the list marker, the box and the space after it become one
// widget; the capture is the state character.
const TASK = /^(\s*)([-*+]|\d{1,9}[.)])(\s+)\[(.)\]([ \t]|$)/;
const BULLET = /^(\s*)([-*+])(\s+)(?!\[.\](?:\s|$))/;

// The caret on the line changes `active`, which only changes how the box is
// drawn: the node and its React tree are kept (updateDOM), so the box can
// transition instead of being made again.
class TaskWidget extends HubWidget {
  protected override readonly tag = "span";
  protected readonly hostClass = "aven-widget aven-task";

  constructor(
    readonly state: TaskState,
    // Where the state character is, counted from the start of the widget.
    readonly rel: number,
    readonly active: boolean,
  ) {
    super();
  }

  override eq(other: TaskWidget): boolean {
    return (
      other.state === this.state &&
      other.rel === this.rel &&
      other.active === this.active
    );
  }

  protected content(view: EditorView, host: HTMLElement): WidgetContent {
    return {
      kind: "task",
      state: this.state,
      active: this.active,
      menu: (x, y) => {
        view.state.facet(menuFacet)?.(view, x, y);
      },
      change: next => {
        // The widget may have moved since it was drawn: ask where it is now.
        const at = view.posAtDOM(host) + this.rel;
        view.dispatch({ changes: { from: at, to: at + 1, insert: next } });
      },
    };
  }
}

class BulletWidget extends WidgetType {
  override eq(): boolean {
    return true;
  }

  override toDOM(): HTMLElement {
    const bullet = document.createElement("span");
    bullet.className = "aven-bullet";
    bullet.textContent = "•";
    return bullet;
  }
}

function build(view: EditorView): DecorationSet {
  const { doc, selection } = view.state;
  const caret = new Set(
    selection.ranges.map(range => doc.lineAt(range.head).number),
  );
  const decorations: Range<Decoration>[] = [];
  let last = -1;
  for (const { from, to } of view.visibleRanges) {
    for (let pos = from; pos <= to;) {
      const line = doc.lineAt(pos);
      pos = line.to + 1;
      if (line.number === last) {
        continue;
      }
      last = line.number;
      const task = TASK.exec(line.text);
      if (task !== null && !inCode(view.state, line.from)) {
        const state = asTaskState(task[4]?.replace("X", "x"));
        if (state !== undefined) {
          const start = line.from + (task[1]?.length ?? 0);
          const end = line.from + task[0].length;
          const rel = (task[2]?.length ?? 0) + (task[3]?.length ?? 0) + 1;
          // The caret reaching the marker (an arrow key, a click) shows its
          // source to edit; one at the start of the text does not.
          const touched = selection.ranges.some(
            range => range.to >= start && range.from < end,
          );
          if (!touched) {
            decorations.push(
              Decoration.replace({
                widget: new TaskWidget(state, rel, caret.has(line.number)),
              }).range(start, end),
            );
          }
          continue;
        }
      }
      // A plain bullet turns into a dot unless the caret is on its line.
      const bullet = BULLET.exec(line.text);
      if (
        bullet !== null &&
        !caret.has(line.number) &&
        !inCode(view.state, line.from)
      ) {
        const start = line.from + (bullet[1]?.length ?? 0);
        decorations.push(
          Decoration.replace({ widget: new BulletWidget() }).range(
            start,
            start + 1,
          ),
        );
      }
    }
  }
  return Decoration.set(decorations, true);
}

// Task boxes and bullets drawn in place of their markdown markers.
export const listWidgets = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = build(view);
    }

    update(update: ViewUpdate) {
      if (
        update.docChanged ||
        update.selectionSet ||
        update.viewportChanged ||
        syntaxTree(update.startState) !== syntaxTree(update.state)
      ) {
        this.decorations = build(update.view);
      }
    }
  },
  {
    decorations: plugin => plugin.decorations,
    provide: plugin =>
      EditorView.atomicRanges.of(view => {
        return view.plugin(plugin)?.decorations ?? Decoration.none;
      }),
  },
);
