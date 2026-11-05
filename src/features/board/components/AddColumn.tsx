import { ActionIcon, Button, TextInput } from "@mantine/core";
import { Plus, X } from "lucide-react";
import { useState } from "react";

import { useBoardActions } from "../hooks/useBoardActions";

import classes from "./column.module.css";

// Ghost tile at the end of the lane that turns into a name field.
export function AddColumn() {
  const { addColumn } = useBoardActions();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const close = () => {
    setOpen(false);
    setValue("");
  };
  const submit = () => {
    if (value.trim() !== "") {
      addColumn(value);
      close();
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        className={classes.addColumn}
        onClick={() => {
          setOpen(true);
        }}
      >
        <Plus size={16} /> Add column
      </button>
    );
  }

  return (
    <div className={classes.newColumn}>
      <TextInput
        autoFocus
        radius="md"
        placeholder="Column name"
        maxLength={60}
        value={value}
        onChange={event => {
          setValue(event.currentTarget.value);
        }}
        onKeyDown={event => {
          if (event.key === "Enter") {
            submit();
          } else if (event.key === "Escape") {
            close();
          }
        }}
      />
      <div className={classes.composerRow}>
        <Button size="compact-sm" radius="md" onClick={submit}>
          Add column
        </Button>
        <ActionIcon
          variant="subtle"
          color="gray"
          radius="md"
          aria-label="Cancel"
          onClick={close}
        >
          <X size={16} />
        </ActionIcon>
      </div>
    </div>
  );
}
