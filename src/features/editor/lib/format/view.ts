import type { EditorView } from "@codemirror/view";

import type { Command } from "./edit";

// Runs a command on the document of an editor and its main selection.
export function runOnView(view: EditorView, command: Command): boolean {
  const { from, to } = view.state.selection.main;
  const edit = command(view.state.doc.toString(), { from, to });
  if (edit === undefined) {
    return false;
  }
  view.dispatch({
    changes: edit.changes,
    selection: { anchor: edit.anchor, head: edit.head },
    scrollIntoView: true,
    userEvent: "input.format",
  });
  return true;
}
