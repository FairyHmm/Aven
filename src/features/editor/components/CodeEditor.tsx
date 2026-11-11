import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import {
  insertNewlineContinueMarkup,
  markdown,
  markdownLanguage,
} from "@codemirror/lang-markdown";
import { EditorState, Prec, type Extension } from "@codemirror/state";
import { EditorView, keymap, placeholder } from "@codemirror/view";
import { useEffect, useRef, type RefObject } from "react";

import { useGrow } from "../../board/hooks/useGrow";
import { livePreview } from "../lib/livePreview";
import { compactTheme, editorTheme } from "../lib/theme";
import { titleLine } from "../lib/titleLine";

import classes from "./codeEditor.module.css";

type Handlers = {
  onChange: (value: string) => void;
  // Ctrl/⌘ + Enter (and plain Enter with `enterSubmits`).
  onSubmit: () => void;
  onEscape?: (() => void) | undefined;
  // Focus left the editor (not merely the window).
  onBlur?: (() => void) | undefined;
};

type Props = Handlers & {
  // Read once, when the editor mounts; the editor owns the text afterwards.
  initialValue: string;
  label: string;
  // Dress the first line as a title (a card is one markdown document).
  firstLineTitle?: boolean | undefined;
  // No frame or minimum height: for an editor that sits inside another box.
  compact?: boolean | undefined;
  // Enter submits and Shift+Enter inserts the newline.
  enterSubmits?: boolean | undefined;
  // Focus on mount, with the cursor at the end.
  autoFocus?: boolean | undefined;
  hint?: string | undefined;
};

function keys(handlers: RefObject<Handlers>, enterSubmits: boolean): Extension {
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

// CodeMirror 6 markdown editor with live preview.
// Uncontrolled: caller remounts (key) to reset; edits flow through `onChange`.
export function CodeEditor({
  initialValue,
  label,
  firstLineTitle = false,
  compact = false,
  enterSubmits = false,
  autoFocus = false,
  hint,
  ...callbacks
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  // A framed editor grows with its text: the frame (the border is its, not
  // CodeMirror's, so that it moves with the edge) is what eases, and what is
  // under it follows. One inside a tile leaves that to the tile.
  const frame = useRef<HTMLDivElement>(null);
  useGrow(frame, host, undefined, !compact);
  const handlers = useRef<Handlers>(callbacks);
  const initial = useRef(initialValue);

  useEffect(() => {
    handlers.current = callbacks;
  });

  useEffect(() => {
    const parent = host.current;
    if (parent === null) {
      return undefined;
    }
    let alive = true;
    const view = new EditorView({
      parent,
      state: EditorState.create({
        doc: initial.current,
        extensions: [
          keys(handlers, enterSubmits),
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
          markdown({ base: markdownLanguage }),
          livePreview,
          editorTheme,
          compact ? compactTheme : [],
          firstLineTitle ? titleLine : [],
          hint === undefined ? [] : placeholder(hint),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({ "aria-label": label }),
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
              handlers.current.onChange(update.state.doc.toString());
            }
          }),
          EditorView.domEventHandlers({
            blur: () => {
              // Switching windows is not leaving the editor.
              if (alive && document.hasFocus()) {
                handlers.current.onBlur?.();
              }
              return false;
            },
          }),
        ],
      }),
    });
    if (autoFocus) {
      view.dispatch({ selection: { anchor: view.state.doc.length } });
      view.focus();
    }
    return () => {
      alive = false;
      view.destroy();
    };
  }, [label, firstLineTitle, compact, enterSubmits, autoFocus, hint]);

  return compact ? (
    <div ref={host} />
  ) : (
    <div ref={frame} className={classes.frame}>
      <div ref={host} />
    </div>
  );
}
