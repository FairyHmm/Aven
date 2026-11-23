import { ActionIcon } from "@mantine/core";
import { Archive } from "lucide-react";
import { useRef } from "react";

import { useSortableSink } from "../../../shared/hooks/useSortableSink";
import type { ItemData } from "../../../shared/lib/dnd/data";
import { ARCHIVE_LIST } from "../lib/archive";
import { useArchiveViewStore } from "../stores/archiveViewStore";
import { useBoardStore } from "../stores/boardStore";

import classes from "./archiveToggle.module.css";

// A card already in the archive has nothing to gain from being dropped on it.
const notArchived = (item: ItemData) => item.listId !== ARCHIVE_LIST;

// Shows or hides the archive panel. A card dragged onto the button is
// archived, with or without the panel open.
export function ArchiveToggle() {
  const open = useArchiveViewStore(state => state.open);
  const setOpen = useArchiveViewStore(state => state.setOpen);
  const count = useBoardStore(
    state => state.cards.filter(card => card.archivedAt !== undefined).length,
  );
  const button = useRef<HTMLButtonElement>(null);
  const { over } = useSortableSink(button, {
    kind: "card",
    listId: ARCHIVE_LIST,
    accepts: notArchived,
  });
  return (
    <ActionIcon
      ref={button}
      className={classes.toggle}
      variant={open ? "light" : "subtle"}
      color="gray"
      size="md"
      radius="md"
      data-over={over}
      aria-pressed={open}
      aria-label={count > 0 ? `Archive, ${count} cards` : "Archive"}
      title="Archive: drop a card here to set it aside"
      onClick={() => {
        setOpen(!open);
      }}
    >
      <Archive size={16} />
      {count > 0 && <span className={classes.count}>{count}</span>}
    </ActionIcon>
  );
}
