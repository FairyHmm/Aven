import { Button } from "@mantine/core";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";

import { CodeEditor } from "../../../editor/components/CodeEditor";
import { useBoardActions } from "../../hooks/useBoardActions";

import classes from "../column/columnComposer.module.css";

// "Add card" footer: the same markdown editor a tile turns into, the first
// line being the title. Enter adds the card and stays open for the next one,
// Shift+Enter starts a new line, and Esc or clicking away adds whatever is
// typed and closes.
export function CardComposer({ columnId }: { columnId: string }) {
  const { addCard } = useBoardActions();
  const [open, setOpen] = useState(false);
  // Remounting the editor (new key) empties it after each card.
  const [round, setRound] = useState(0);
  const text = useRef("");

  const add = () => {
    const added = text.current.trim() !== "";
    if (added) {
      addCard(columnId, text.current);
    }
    text.current = "";
    return added;
  };
  const submit = () => {
    if (add()) {
      setRound(previous => previous + 1);
    }
  };
  const finish = () => {
    add();
    setOpen(false);
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
      <div className={classes.composerEditor}>
        <CodeEditor
          key={round}
          compact
          autoFocus
          firstLineTitle
          enterSubmits
          label="New card"
          initialValue=""
          hint="What needs doing?"
          onChange={next => {
            text.current = next;
          }}
          onSubmit={submit}
          onEscape={finish}
          onBlur={finish}
        />
      </div>
      <div>
        <Button
          size="compact-sm"
          radius="md"
          onMouseDown={event => {
            // Keep focus in the editor: adding leaves it open for the next card.
            event.preventDefault();
          }}
          onClick={submit}
        >
          Add card
        </Button>
      </div>
    </div>
  );
}
