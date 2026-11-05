import { ActionIcon, Button, Textarea } from "@mantine/core";
import { Plus, X } from "lucide-react";
import { useState } from "react";

import { useBoardActions } from "../hooks/useBoardActions";

import classes from "./column.module.css";

// "Add card" footer. Stays open after adding so several cards can be entered
// in a row. Enter adds, Shift+Enter starts the markdown body, Esc closes.
export function CardComposer({ columnId }: { columnId: string }) {
  const { addCard } = useBoardActions();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const close = () => {
    setOpen(false);
    setValue("");
  };
  const submit = () => {
    if (value.trim() !== "") {
      addCard(columnId, value);
      setValue("");
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        className={classes.addButton}
        onClick={() => {
          setOpen(true);
        }}
      >
        <Plus size={15} /> Add card
      </button>
    );
  }

  return (
    <div className={classes.composer}>
      <Textarea
        autoFocus
        autosize
        minRows={2}
        maxRows={8}
        radius="md"
        placeholder="What needs doing?"
        value={value}
        onChange={event => {
          setValue(event.currentTarget.value);
        }}
        onKeyDown={event => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          } else if (event.key === "Escape") {
            close();
          }
        }}
      />
      <div className={classes.composerRow}>
        <Button size="compact-sm" radius="md" onClick={submit}>
          Add card
        </Button>
        <ActionIcon
          variant="subtle"
          color="gray"
          radius="md"
          aria-label="Close composer"
          onClick={close}
        >
          <X size={16} />
        </ActionIcon>
      </div>
    </div>
  );
}
