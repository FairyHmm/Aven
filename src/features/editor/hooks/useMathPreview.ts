import { EditorView } from "@codemirror/view";
import { useMemo, useRef, useState } from "react";

import { mathAt } from "../lib/math/widgets";

// The formula being edited and where its source starts (viewport pixels).
export type ShownMath = { tex: string; display: boolean; x: number; y: number };

const same = (a: ShownMath | undefined, b: ShownMath | undefined) =>
  a?.tex === b?.tex &&
  a?.display === b?.display &&
  a?.x === b?.x &&
  a?.y === b?.y;

// Tells which formula the caret is in, so its picture can float over the
// source while it is typed. Nothing is shown while the editor is not focused.
export function useMathPreview() {
  const [shown, setShown] = useState<ShownMath>();
  const current = useRef<ShownMath | undefined>(undefined);
  const extension = useMemo(
    () =>
      EditorView.updateListener.of(update => {
        if (
          !update.docChanged &&
          !update.selectionSet &&
          !update.focusChanged &&
          !update.geometryChanged
        ) {
          return;
        }
        const { view, state } = update;
        const span = view.hasFocus
          ? mathAt(state, state.selection.main.head)
          : undefined;
        const at = span === undefined ? null : view.coordsAtPos(span.from);
        const next =
          span === undefined || at === null
            ? undefined
            : { tex: span.tex, display: span.display, x: at.left, y: at.top };
        if (!same(current.current, next)) {
          current.current = next;
          setShown(next);
        }
      }),
    [],
  );
  return { extension, shown };
}
