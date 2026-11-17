import { insertNewlineContinueMarkup } from "@codemirror/lang-markdown";
import { type Extension, Prec } from "@codemirror/state";
import { type EditorView, keymap } from "@codemirror/view";
import type { RefObject } from "react";

import { shortcutKeys } from "../lib/format/shortcuts";
import { runOnView } from "../lib/format/view";

export type Handlers = {
  onChange: (value: string) => void;
  // Ctrl/⌘ + Enter (and plain Enter with `enterSubmits`).
  onSubmit: () => void;
  onEscape?: (() => void) | undefined;
  // Focus left the editor (not merely the window).
  onBlur?: (() => void) | undefined;
};

export function editorKeys(
  handlers: RefObject<Handlers>,
  enterSubmits: boolean,
): Extension {
  // Enter that is confirming an IME composition must not submit.
  const submit = (view: EditorView) => {
    if (view.composing) {
      return false;
    }
    handlers.current.onSubmit();
    return true;
  };
  const escape = () => {
    const leave = handlers.current.onEscape;
    if (leave === undefined) {
      return false;
    }
    leave();
    return true;
  };
  return Prec.highest(
    keymap.of([
      { key: "Mod-Enter", run: submit },
      ...shortcutKeys().map(({ key, command }) => ({
        key,
        run: (view: EditorView) => runOnView(view, command),
        preventDefault: true,
      })),
      { key: "Escape", run: escape },
      ...(enterSubmits
        ? [
            { key: "Enter", run: submit },
            { key: "Shift-Enter", run: insertNewlineContinueMarkup },
          ]
        : []),
    ]),
  );
}
