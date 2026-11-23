import { CloseButton } from "@mantine/core";
import { Archive } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAutoScroll } from "../../../../shared/hooks/useAutoScroll";
import { useSortableList } from "../../../../shared/hooks/useSortableList";
import { ms } from "../../../../shared/lib/motion";
import { ARCHIVE_LIST } from "../../lib/archive";
import { shownArchived } from "../../lib/shown";
import { COLUMN_WIDTH } from "../../lib/types";
import { useArchiveViewStore } from "../../stores/archiveViewStore";
import { useBoardStore } from "../../stores/boardStore";
import { useFilterStore } from "../../stores/filterStore";
import { CardSlot } from "../card/CardSlot";

import classes from "./archiveColumn.module.css";
import column from "./column.module.css";

// The archive as a column that floats over the board's right edge: drag a
// card onto it to set it aside, drag one out to a column to bring it back. It
// opens and closes from the toolbar button (or its own close button) by
// sliding in from the edge. It sits outside the scrolling row of columns, so
// it stays put however far the board is scrolled.
export function ArchiveColumn() {
  const open = useArchiveViewStore(state => state.open);
  const setOpen = useArchiveViewStore(state => state.setOpen);
  const allCards = useBoardStore(state => state.cards);
  const tag = useFilterStore(state => state.tag);
  const text = useFilterStore(state => state.text);
  const cards = useMemo(
    () => shownArchived({ cards: allCards }, { tag, text }),
    [allCards, tag, text],
  );
  // The cards are only on the page while it is open (or easing shut), so a
  // closed archive costs the board nothing.
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) {
    setMounted(true);
  }
  useEffect(() => {
    if (open) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setMounted(false);
    }, ms("slow"));
    return () => {
      window.clearTimeout(timer);
    };
  }, [open]);
  const section = useRef<HTMLElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const { over, emptySize } = useSortableList(section, {
    kind: "card",
    listId: ARCHIVE_LIST,
    axis: "vertical",
    gap: 8,
    count: cards.length,
  });
  useAutoScroll(list);

  return (
    <div className={classes.wrap} data-open={open}>
      <section
        ref={section}
        className={`${column.column} ${classes.archive}`}
        data-over={over}
        aria-label="Archive"
        style={{ width: COLUMN_WIDTH.initial }}
        aria-hidden={!open}
        inert={!open}
      >
        <header className={`${column.header} ${classes.header}`}>
          <Archive size={14} aria-hidden="true" />
          <span className={column.name}>Archive</span>
          <span className={column.count}>{cards.length}</span>
          <CloseButton
            size="sm"
            aria-label="Close the archive"
            onClick={() => {
              setOpen(false);
            }}
          />
        </header>
        <div ref={list} className={column.list}>
          {mounted &&
            cards.map((card, position) => (
              <CardSlot
                key={card.id}
                card={card}
                columnId={ARCHIVE_LIST}
                index={position}
                count={cards.length}
              />
            ))}
          {mounted && (cards.length === 0 || emptySize > 0) && (
            <div
              className={column.empty}
              style={emptySize > 0 ? { minHeight: emptySize } : undefined}
            >
              Drop a card here to archive it
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
