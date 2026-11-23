import { ActionIcon } from "@mantine/core";
import { Redo2, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";

import { useBoardActions } from "../hooks/useBoardActions";
import { useBoardStore } from "../stores/boardStore";

import classes from "./historyControls.module.css";

// How long a notice stays before it goes by itself.
const SHOWN_MS = 6000;

// Undo and redo as two quiet icon buttons.
export function HistoryButtons() {
  const { undo, redo } = useBoardActions();
  const canUndo = useBoardStore(state => state.history.undo.length > 0);
  const canRedo = useBoardStore(state => state.history.redo.length > 0);
  return (
    <div className={classes.buttons}>
      <ActionIcon
        variant="subtle"
        color="gray"
        size="md"
        radius="md"
        aria-label="Undo"
        title="Undo (Ctrl+Z)"
        disabled={!canUndo}
        onClick={undo}
      >
        <Undo2 size={16} />
      </ActionIcon>
      <ActionIcon
        variant="subtle"
        color="gray"
        size="md"
        radius="md"
        aria-label="Redo"
        title="Redo (Ctrl+Shift+Z)"
        disabled={!canRedo}
        onClick={redo}
      >
        <Redo2 size={16} />
      </ActionIcon>
    </div>
  );
}

// What just happened, said quietly beside the board's name ("Card deleted ·
// Undo"). The line opens and closes by easing its width, so nothing pops in.
export function HistoryNote() {
  const { undo, redo, dismissNotice } = useBoardActions();
  const notice = useBoardStore(state => state.notice);
  // Keeps the last notice's words while the line closes.
  const [last, setLast] = useState(notice);
  if (notice !== undefined && notice !== last) {
    setLast(notice);
  }

  useEffect(() => {
    if (notice === undefined) {
      return undefined;
    }
    const timer = window.setTimeout(dismissNotice, SHOWN_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [notice, dismissNotice]);

  return (
    <div
      className={classes.note}
      data-open={notice !== undefined}
      role="status"
      aria-live="polite"
    >
      <span className={classes.inner}>
        {last?.text}
        {" · "}
        <button
          type="button"
          className={classes.action}
          tabIndex={notice === undefined ? -1 : 0}
          onClick={last?.action === "redo" ? redo : undo}
        >
          {last?.action === "redo" ? "Redo" : "Undo"}
        </button>
      </span>
    </div>
  );
}
