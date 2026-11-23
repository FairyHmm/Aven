import { X } from "lucide-react";

import { useCanEdit } from "../hooks/useCanEdit";
import { useTagColors, useTagFilter } from "../hooks/useTags";
import { attrsOf } from "../lib/labels/labelColors";
import { colorOf, tagText } from "../lib/labels/tags";
import { ArchiveToggle } from "./ArchiveToggle";
import { BoardSearch } from "./BoardSearch";
import { HistoryButtons, HistoryNote } from "./HistoryControls";
import { TagFilter } from "./TagFilter";

import classes from "./board.module.css";

type Props = {
  name: string;
  columnCount: number;
  cardCount: number;
  saving: boolean;
};

// The board's name and what is in it on the left, and the tools on the right
// as quiet icon buttons: finding (search, label), going back (undo, redo) and
// the archive.
export function BoardToolbar({ name, columnCount, cardCount, saving }: Props) {
  const { tag, clear } = useTagFilter();
  const colors = useTagColors();
  const canEdit = useCanEdit();
  return (
    <div className={classes.toolbar}>
      <div className={classes.heading}>
        <h2 className={classes.title}>{name}</h2>
        <p className={classes.meta}>
          {columnCount} columns · {cardCount} cards
          {saving ? " · Saving…" : ""}
        </p>
        {canEdit && <HistoryNote />}
      </div>
      <div className={classes.tools}>
        <BoardSearch />
        <TagFilter />
        {tag !== undefined && (
          <button
            type="button"
            className={classes.filter}
            {...attrsOf(colorOf(tag, colors))}
            aria-label={`Stop showing only #${tag}`}
            onClick={clear}
          >
            {tagText(tag) || "Label"}
            <X size={12} />
          </button>
        )}
        {canEdit && (
          <>
            <span className={classes.divider} aria-hidden="true" />
            <HistoryButtons />
            <span className={classes.divider} aria-hidden="true" />
            <ArchiveToggle />
          </>
        )}
      </div>
    </div>
  );
}
