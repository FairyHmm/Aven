import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { EditorState, Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { useEffect, useRef } from "react";

import { livePreview } from "../lib/livePreview";
import { editorTheme } from "../lib/theme";

type Props = {
  // Read once, when the editor mounts; the editor owns the text afterwards.
  initialValue: string;
  onChange: (value: string) => void;
  // Ctrl/⌘ + Enter.
  onSubmit: () => void;
  label: string;
};

// A CodeMirror 6 markdown editor with live preview. It is uncontrolled: the
// caller learns about edits through `onChange` and remounts it (key) to reset.
export function CodeEditor({ initialValue, onChange, onSubmit, label }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const handlers = useRef({ onChange, onSubmit });
  const initial = useRef(initialValue);

  useEffect(() => {
    handlers.current = { onChange, onSubmit };
  });

  useEffect(() => {
    const parent = host.current;
    if (parent === null) {
      return undefined;
    }
    const view = new EditorView({
      parent,
      state: EditorState.create({
        doc: initial.current,
        extensions: [
          Prec.highest(
            keymap.of([
              {
                key: "Mod-Enter",
                run: () => {
                  handlers.current.onSubmit();
                  return true;
                },
              },
            ]),
          ),
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
          markdown({ base: markdownLanguage }),
          livePreview,
          editorTheme,
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({ "aria-label": label }),
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
              handlers.current.onChange(update.state.doc.toString());
            }
          }),
        ],
      }),
    });
    return () => {
      view.destroy();
    };
  }, [label]);

  return <div ref={host} />;
}
