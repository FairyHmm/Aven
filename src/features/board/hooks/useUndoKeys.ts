import { useEffect } from "react";

import { useBoardStore } from "../stores/boardStore";
import { useEditorStore } from "../stores/editorStore";
import { isTyping } from "./keys";

// Ctrl/Cmd+Z undoes the last change to the board, Ctrl/Cmd+Shift+Z (or
// Ctrl+Y) plays it again. Inside a text field or an open card the keys belong
// to that editor's own undo, so the board's history leaves them be.
export function useUndoKeys() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const command = event.ctrlKey || event.metaKey;
      if (!command || event.altKey || isTyping(event.target)) {
        return;
      }
      const { openId, editingId } = useEditorStore.getState();
      if (openId !== undefined || editingId !== undefined) {
        return;
      }
      const key = event.key.toLowerCase();
      const { undo, redo } = useBoardStore.getState().actions;
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if ((key === "z" && event.shiftKey) || key === "y") {
        event.preventDefault();
        redo();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}
