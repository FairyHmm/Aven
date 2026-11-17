import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, placeholder } from "@codemirror/view";
import { useEffect, useRef, useState } from "react";

import { useGrow } from "../../board/hooks/useGrow";
import { useEditorMenu } from "../hooks/useEditorMenu";
import { useHints } from "../hooks/useHints";
import { useMathPreview } from "../hooks/useMathPreview";
import { highlightMarks } from "../lib/highlight/decorations";
import { htmlBlocks } from "../lib/html/blocks";
import { livePreview } from "../lib/livePreview";
import { mathWidgets } from "../lib/math/widgets";
import { tables } from "../lib/table/widget";
import { compactTheme, editorTheme } from "../lib/theme";
import { titleLine } from "../lib/titleLine";
import { diagrams } from "../lib/widgets/diagrams";
import { hubFacet, WidgetHub } from "../lib/widgets/hub";
import { listWidgets } from "../lib/widgets/lists";
import { editorKeys, type Handlers } from "./editorKeys";
import { MathPreview } from "./math/MathPreview";
import { EditorMenu } from "./menu/EditorMenu";
import { HintMenu } from "./menu/HintMenu";
import { EditorWidgets } from "./widgets/EditorWidgets";

import classes from "./codeEditor.module.css";

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
  // Task boxes, diagrams, formulas and tables are React, drawn into nodes the
  // editor reserves.
  const [hub] = useState(() => new WidgetHub());
  const menu = useEditorMenu();
  const hints = useHints();
  const math = useMathPreview();
  const { extension: menuExtension, view: menuView, open: menuOpen } = menu;
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
          editorKeys(handlers, enterSubmits),
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
          // Fenced code is highlighted in its own language, loaded on demand.
          markdown({ base: markdownLanguage, codeLanguages: languages }),
          hubFacet.of(hub),
          menuExtension,
          livePreview,
          listWidgets,
          highlightMarks,
          hints.extension,
          diagrams,
          mathWidgets,
          math.extension,
          htmlBlocks,
          tables,
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
              if (alive && document.hasFocus() && !menuOpen.current) {
                handlers.current.onBlur?.();
              }
              return false;
            },
          }),
        ],
      }),
    });
    menuView.current = view;
    if (autoFocus) {
      view.dispatch({ selection: { anchor: view.state.doc.length } });
      view.focus();
    }
    return () => {
      alive = false;
      menuView.current = null;
      view.destroy();
    };
  }, [
    label,
    firstLineTitle,
    compact,
    enterSubmits,
    autoFocus,
    hint,
    hub,
    math.extension,
    menuExtension,
    menuView,
    menuOpen,
  ]);

  return (
    <>
      {compact ? (
        <div ref={host} />
      ) : (
        <div ref={frame} className={classes.frame}>
          <div ref={host} />
        </div>
      )}
      <EditorWidgets hub={hub} />
      <EditorMenu menu={menu} />
      <HintMenu state={hints} />
      <MathPreview shown={math.shown} />
    </>
  );
}
