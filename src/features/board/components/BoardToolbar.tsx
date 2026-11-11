import { X } from "lucide-react";

import { useTagColors, useTagFilter } from "../hooks/useTags";
import { attrsOf } from "../lib/labels/labelColors";
import { colorOf, tagText } from "../lib/labels/tags";
import { TagFilter } from "./TagFilter";

import classes from "./board.module.css";

type Props = {
  name: string;
  columnCount: number;
  cardCount: number;
  saving: boolean;
};

export function BoardToolbar({ name, columnCount, cardCount, saving }: Props) {
  const { tag, clear } = useTagFilter();
  const colors = useTagColors();
  return (
    <div className={classes.toolbar}>
      <h2 className={classes.title}>{name}</h2>
      <p className={classes.meta}>
        {columnCount} columns · {cardCount} cards
        {saving ? " · Saving…" : ""}
      </p>
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
    </div>
  );
}
