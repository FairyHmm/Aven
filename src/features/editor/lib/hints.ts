import type { EditorState } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";

import {
  findHighlights,
  type Highlight,
  HUES,
  type Hue,
} from "./highlight/highlights";
import { inCode } from "./inCode";

// Some things are written, not clicked, so nothing says they have choices. A
// small menu does, while the caret is where the choice is made (see HintMenu):
// the colour of a highlight (in one, or right after a lone `==`), and the kind
// of a task (right after `- [`).
export type Hint =
  | { kind: "colour-inside"; found: Highlight }
  | { kind: "colour-open"; at: number }
  | { kind: "task"; from: number; to: number };

// The colours, in the order of the menu: the plain highlight, then the circles.
export const COLOUR_CHOICES: Hue[] = ["default", ...HUES.map(item => item.hue)];

// `- [`: the list marker, and the start of a box.
const TASK_OPEN = /^\s*(?:[-*+]|\d{1,9}[.)])\s+\[(.?)$/;

// What a pick of a task kind replaces: whatever was typed after `[`, and a `]`
// right after the caret.
function taskAt(state: EditorState, head: number): Hint | undefined {
  const line = state.doc.lineAt(head);
  const match = TASK_OPEN.exec(state.sliceDoc(line.from, head));
  if (match === null) {
    return undefined;
  }
  const after = state.sliceDoc(head, head + 1);
  return {
    kind: "task",
    from: head - (match[1]?.length ?? 0),
    to: head + (after === "]" ? 1 : 0),
  };
}

export function hintAt(state: EditorState): Hint | undefined {
  const range = state.selection.main;
  if (!range.empty || inCode(state, range.head)) {
    return undefined;
  }
  const task = taskAt(state, range.head);
  if (task !== undefined) {
    return task;
  }
  const line = state.doc.lineAt(range.head);
  const found = findHighlights(line.text, line.from).find(
    item => range.head >= item.from && range.head <= item.to,
  );
  if (found !== undefined) {
    return { kind: "colour-inside", found };
  }
  // `==` just typed, with nothing after it yet and no pair to close.
  const before = state.sliceDoc(line.from, range.head);
  return /(^|[^=])==$/.test(before) &&
    !/==/.test(line.text.slice(range.head - line.from))
    ? { kind: "colour-open", at: range.head }
    : undefined;
}

// Whether the caret is being asked something (the keys are the menu's) rather
// than just being somewhere it could change.
export const isPrompt = (hint: Hint) => hint.kind !== "colour-inside";

// `pick` is a user event of its own, so the menu can tell its own changes.
const PICK = "input.pick";

// Gives the highlight its colour (`emoji` is empty for the plain one).
export function chooseColour(view: EditorView, hint: Hint, emoji: string) {
  if (hint.kind === "colour-open") {
    view.dispatch({
      changes: { from: hint.at, insert: emoji },
      selection: { anchor: hint.at + emoji.length },
      userEvent: PICK,
    });
  } else if (hint.kind === "colour-inside") {
    // The current colour (if the highlight has one) is replaced or removed.
    const start = hint.found.from + 2;
    const old = hint.found.emoji?.length ?? 0;
    view.dispatch({
      changes: { from: start, to: start + old, insert: emoji },
      userEvent: PICK,
    });
  }
}

// Writes the state character and closes the box.
export function chooseTask(view: EditorView, hint: Hint, char: string) {
  if (hint.kind !== "task") {
    return;
  }
  const spaced = view.state.sliceDoc(hint.to, hint.to + 1) === " ";
  const insert = `${char}]${spaced ? "" : " "}`;
  view.dispatch({
    changes: { from: hint.from, to: hint.to, insert },
    // After the space that follows the box, ready for the text.
    selection: { anchor: hint.from + insert.length + (spaced ? 1 : 0) },
    userEvent: PICK,
  });
}
