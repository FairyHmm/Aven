import { useRef, useState } from "react";

import { SortableItem } from "../../../shared/components/SortableItem";
import { useAutoScroll } from "../../../shared/hooks/useAutoScroll";
import { useSortableList } from "../../../shared/hooks/useSortableList";
import { useBoardActions } from "../hooks/useBoardActions";
import { useColumnCards } from "../hooks/useColumnCards";
import type { Column } from "../lib/types";
import { CardComposer } from "./CardComposer";
import { CardTile } from "./CardTile";
import { ColumnMenu } from "./ColumnMenu";
import { InlineEdit } from "./InlineEdit";

import classes from "./column.module.css";

type Props = {
  column: Column;
  // Position in the lane and the lane's length: needed to open the gap.
  index: number;
  count: number;
};

export function ColumnView({ column, index, count }: Props) {
  const actions = useBoardActions();
  const cards = useColumnCards(column.id);
  const section = useRef<HTMLElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const [renaming, setRenaming] = useState(false);
  const { over, emptySize } = useSortableList(section, {
    kind: "card",
    listId: column.id,
    axis: "vertical",
    gap: 8,
    count: cards.length,
  });
  useAutoScroll(list);

  const remove = () => {
    const warning = `Delete "${column.name}" and its ${cards.length} card(s)?`;
    if (cards.length === 0 || window.confirm(warning)) {
      actions.removeColumn(column.id);
    }
  };

  return (
    <SortableItem
      kind="column"
      id={column.id}
      listId="lane"
      axis="horizontal"
      index={index}
      count={count}
      handle="[data-drag-handle]"
      disabled={renaming}
      className={classes.slot}
      delay={index * 60}
      enterOnLoad
    >
      <section
        ref={section}
        className={classes.column}
        data-accent={column.accent}
        data-over={over}
        aria-label={column.name}
      >
        <header className={classes.header} data-drag-handle>
          <span className={classes.dot} aria-hidden="true" />
          <InlineEdit
            value={column.name}
            editing={renaming}
            onStart={() => {
              setRenaming(true);
            }}
            onDone={next => {
              setRenaming(false);
              if (next !== undefined && next.trim() !== column.name) {
                actions.renameColumn(column.id, next);
              }
            }}
          />
          <span className={classes.count}>{cards.length}</span>
          <ColumnMenu
            accent={column.accent}
            onRename={() => {
              setRenaming(true);
            }}
            onAccent={accent => {
              actions.recolorColumn(column.id, accent);
            }}
            onDelete={remove}
          />
        </header>

        <div ref={list} className={classes.list}>
          {cards.map((card, position) => (
            <SortableItem
              key={card.id}
              kind="card"
              id={card.id}
              listId={column.id}
              axis="vertical"
              index={position}
              count={cards.length}
            >
              <CardTile card={card} />
            </SortableItem>
          ))}
          {(cards.length === 0 || emptySize > 0) && (
            <div
              className={classes.empty}
              style={emptySize > 0 ? { minHeight: emptySize } : undefined}
            >
              Drop a card here
            </div>
          )}
        </div>

        <footer className={classes.footer}>
          <CardComposer columnId={column.id} />
        </footer>
      </section>
    </SortableItem>
  );
}
