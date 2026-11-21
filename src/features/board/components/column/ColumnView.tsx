import { useRef, useState } from "react";

import { ResizeHandle } from "../../../../shared/components/ResizeHandle";
import { SortableItem } from "../../../../shared/components/SortableItem";
import { useAutoScroll } from "../../../../shared/hooks/useAutoScroll";
import { useLiveSize } from "../../../../shared/hooks/useLiveSize";
import { useSortableList } from "../../../../shared/hooks/useSortableList";
import { useBoardActions } from "../../hooks/useBoardActions";
import { useCanEdit } from "../../hooks/useCanEdit";
import { useAnyEditing } from "../../hooks/useCardEditor";
import { useColumnCards } from "../../hooks/useColumnCards";
import { COLUMN_WIDTH, type Column } from "../../lib/types";
import { CardComposer } from "../card/CardComposer";
import { CardSlot } from "../card/CardSlot";
import { InlineEdit } from "../InlineEdit";
import { ColumnMenu } from "./ColumnMenu";

import classes from "./column.module.css";

type Props = {
  column: Column;
  // Position in the lane and the lane's length: needed to open the gap.
  index: number;
  count: number;
};

export function ColumnView({ column, index, count }: Props) {
  const actions = useBoardActions();
  const canEdit = useCanEdit();
  const cards = useColumnCards(column.id);
  const section = useRef<HTMLElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const [renaming, setRenaming] = useState(false);
  const editing = useAnyEditing();
  const { size, bind } = useLiveSize(column.width);
  const width = size ?? COLUMN_WIDTH.initial;
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
      disabled={renaming || !canEdit}
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
        style={{ width }}
      >
        <header className={classes.header} data-drag-handle>
          <span className={classes.dot} aria-hidden="true" />
          <InlineEdit
            value={column.name}
            editing={renaming}
            onStart={() => {
              if (canEdit) {
                setRenaming(true);
              }
            }}
            onDone={next => {
              setRenaming(false);
              if (next !== undefined && next.trim() !== column.name) {
                actions.renameColumn(column.id, next);
              }
            }}
          />
          <span className={classes.count}>{cards.length}</span>
          {canEdit && (
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
          )}
        </header>

        <div ref={list} className={classes.list}>
          {cards.map((card, position) => (
            <CardSlot
              key={card.id}
              card={card}
              columnId={column.id}
              index={position}
              count={cards.length}
            />
          ))}
          {(cards.length === 0 || emptySize > 0) && (
            <div
              className={classes.empty}
              style={emptySize > 0 ? { minHeight: emptySize } : undefined}
            >
              {canEdit ? "Drop a card here" : "No cards"}
            </div>
          )}
        </div>

        {canEdit && (
          <footer className={classes.footer}>
            <CardComposer columnId={column.id} />
          </footer>
        )}

        {canEdit && !editing && (
          <ResizeHandle
            axis="x"
            label={`Resize ${column.name}`}
            value={width}
            min={COLUMN_WIDTH.min}
            max={COLUMN_WIDTH.max}
            size={() => section.current?.offsetWidth ?? width}
            {...bind(
              next => {
                actions.resizeColumn(column.id, next);
              },
              () => {
                actions.resizeColumn(column.id, undefined);
              },
            )}
          />
        )}
      </section>
    </SortableItem>
  );
}
