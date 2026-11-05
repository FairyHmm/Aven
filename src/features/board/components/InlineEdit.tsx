import { useEffect, useRef, useState } from "react";

import classes from "./column.module.css";

type Props = {
  value: string;
  editing: boolean;
  onStart: () => void;
  // Called with the new text, or undefined when the edit was cancelled.
  onDone: (next: string | undefined) => void;
};

// Column name: double-click (or menu → Rename) to edit, Enter to commit,
// Escape to cancel.
export function InlineEdit({ value, editing, onStart, onDone }: Props) {
  const [draft, setDraft] = useState(value);
  const input = useRef<HTMLInputElement>(null);
  const finished = useRef(false);

  useEffect(() => {
    if (editing) {
      finished.current = false;
      setDraft(value);
      input.current?.focus();
      input.current?.select();
    }
  }, [editing, value]);

  const finish = (next: string | undefined) => {
    if (!finished.current) {
      finished.current = true;
      onDone(next);
    }
  };

  if (!editing) {
    return (
      <span className={classes.name} onDoubleClick={onStart} title={value}>
        {value}
      </span>
    );
  }

  return (
    <input
      ref={input}
      className={classes.nameInput}
      value={draft}
      maxLength={60}
      aria-label="Column name"
      onChange={event => {
        setDraft(event.currentTarget.value);
      }}
      onBlur={() => {
        finish(draft);
      }}
      onKeyDown={event => {
        if (event.key === "Enter") {
          finish(draft);
        } else if (event.key === "Escape") {
          finish(undefined);
        }
      }}
    />
  );
}
