import { EditorView } from "@codemirror/view";
import { useCallback, useMemo, useRef, useState } from "react";

import type { Host } from "../components/menu/host";
import { menuFacet, type OpenMenu } from "../lib/menuFacet";

// Where the menu opened (viewport pixels) and whether text was selected.
export type EditorSpot = { x: number; y: number; selected: boolean };

function viewHost(get: () => EditorView | null): Host {
  return {
    read: () => {
      const view = get();
      if (view === null) {
        return { text: "", from: 0, to: 0 };
      }
      const { from, to } = view.state.selection.main;
      return { text: view.state.doc.toString(), from, to };
    },
    apply: edit => {
      const view = get();
      view?.dispatch({
        changes: edit.changes,
        selection: { anchor: edit.anchor, head: edit.head },
        scrollIntoView: true,
        userEvent: "input.format",
      });
      view?.focus();
    },
    select: (from, to) => {
      const view = get();
      view?.dispatch({ selection: { anchor: from, head: to } });
      view?.focus();
    },
  };
}

// The right-click menu of the editor: an extension that opens it, the view it
// works on (set by the editor), and the state to draw it from.
export function useEditorMenu() {
  const view = useRef<EditorView | null>(null);
  // Read by the editor's blur handler: moving to the menu is not leaving.
  const open = useRef(false);
  const [spot, setSpot] = useState<EditorSpot>();
  const extension = useMemo(() => {
    const openAt: OpenMenu = (target, x, y) => {
      // A right click inside the selection keeps it; elsewhere it moves the
      // caret there first.
      const { from, to } = target.state.selection.main;
      const at = target.posAtCoords({ x, y });
      if (at !== null && (at < from || at > to)) {
        target.dispatch({ selection: { anchor: at } });
      }
      const main = target.state.selection.main;
      open.current = true;
      setSpot({ x, y, selected: main.from !== main.to });
    };
    return [
      menuFacet.of(openAt),
      EditorView.domEventHandlers({
        contextmenu: (event, target) => {
          event.preventDefault();
          openAt(target, event.clientX, event.clientY);
          return true;
        },
      }),
    ];
  }, []);
  const host = useMemo(() => viewHost(() => view.current), []);
  const close = useCallback(() => {
    open.current = false;
    setSpot(undefined);
  }, []);
  return { extension, view, open, spot, host, close };
}

export type EditorMenuState = ReturnType<typeof useEditorMenu>;
