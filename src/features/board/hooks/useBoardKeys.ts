import { useEffect } from "react";

import { focusNext } from "../../../shared/lib/dnd/flip";
import { ARCHIVE_LIST } from "../lib/archive";
import { sortedColumns } from "../lib/mutations";
import {
  moveStep,
  neighbour,
  type Direction,
  type Lane,
} from "../lib/navigate";
import { isNarrowed, shownArchived, shownCards } from "../lib/shown";
import { useArchiveViewStore } from "../stores/archiveViewStore";
import { useBoardStore } from "../stores/boardStore";
import { useEditorStore } from "../stores/editorStore";
import { useFilterStore } from "../stores/filterStore";
import { useHelpStore } from "../stores/helpStore";
import {
  focusCard,
  focusedCard,
  isOnBoard,
  isTyping,
  targetCard,
} from "./keys";

const ARROWS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

// The columns in order, each with the ids of the cards it shows, and the
// archive after them while it is open.
function laneNow(): Lane {
  const { columns, cards } = useBoardStore.getState();
  const { tag, text } = useFilterStore.getState();
  const lane: Lane = sortedColumns({ columns }).map(column => ({
    id: column.id,
    cards: shownCards({ cards }, column.id, { tag, text }).map(card => card.id),
  }));
  if (useArchiveViewStore.getState().open) {
    lane.push({
      id: ARCHIVE_LIST,
      cards: shownArchived({ cards }, { tag, text }).map(card => card.id),
    });
  }
  return lane;
}

// Arrows go to the next card; with Alt they move the focused card a step.
function onArrow(event: KeyboardEvent, direction: Direction, cardId: string) {
  event.preventDefault();
  if (!event.altKey) {
    const next = neighbour(laneNow(), cardId, direction);
    if (next !== undefined) {
      focusCard(next);
    }
    return;
  }
  const { canEdit, actions } = useBoardStore.getState();
  const { tag, text } = useFilterStore.getState();
  // Not while some cards are hidden: positions would be counted among fewer.
  if (!canEdit || isNarrowed({ tag, text })) {
    return;
  }
  const step = moveStep(laneNow(), cardId, direction);
  if (step !== undefined) {
    focusNext([`card:${cardId}`]);
    actions.moveCard(cardId, step.columnId, step.index);
    focusCard(cardId);
  }
}

// Opens the composer of the card's column (or of the first column).
function addCardNear(cardId: string | undefined) {
  const tile =
    cardId === undefined
      ? null
      : document.querySelector(`[data-card-id="${CSS.escape(cardId)}"]`);
  const section = tile?.closest("section") ?? document.querySelector("section");
  section?.querySelector<HTMLButtonElement>("footer button")?.click();
}

function onPlainKey(event: KeyboardEvent) {
  const { canEdit, actions } = useBoardStore.getState();
  if (event.key === "?") {
    event.preventDefault();
    useHelpStore.getState().setOpened(true);
  } else if (event.key === "/") {
    const search = document.querySelector<HTMLInputElement>(
      "[data-board-search]",
    );
    if (search !== null) {
      event.preventDefault();
      search.focus();
      search.select();
    }
  } else if (canEdit && event.key.toLowerCase() === "n") {
    event.preventDefault();
    addCardNear(targetCard());
  } else if (canEdit && event.key.toLowerCase() === "a") {
    const id = targetCard();
    if (id !== undefined) {
      event.preventDefault();
      // Archives the card; or, if it is in the archive, brings it back.
      const card = useBoardStore.getState().cards.find(item => item.id === id);
      if (card?.archivedAt === undefined) {
        actions.archiveCard(id);
      } else {
        actions.restoreCard(id);
      }
    }
  }
}

// Board keys: arrows between cards (Alt+arrows move the card), `n` a new card,
// `a` archive, `/` search, `?` the list of shortcuts. They leave text fields,
// open cards and other widgets' keys alone.
export function useBoardKeys() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const { openId, editingId } = useEditorStore.getState();
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.defaultPrevented ||
        isTyping(event.target) ||
        !isOnBoard(event.target) ||
        openId !== undefined ||
        editingId !== undefined
      ) {
        return;
      }
      const direction = ARROWS[event.key];
      const focused = focusedCard();
      if (direction !== undefined && focused !== undefined) {
        onArrow(event, direction, focused);
      } else if (!event.altKey) {
        onPlainKey(event);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}
