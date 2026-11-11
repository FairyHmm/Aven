import { Plus } from "lucide-react";
import { Fragment, type KeyboardEvent, useRef } from "react";

import { SortableItem } from "../../../../shared/components/SortableItem";
import { useSortableDrop } from "../../../../shared/hooks/useSortableDrop";
import { useSortableList } from "../../../../shared/hooks/useSortableList";
import { glideAround } from "../../../../shared/lib/dnd/glide";
import { insertionIndex } from "../../../../shared/lib/dnd/reorder";
import type { PickerKind } from "../../lib/labels/pickerKinds";
import { colorOf, type TagColors } from "../../lib/labels/tags";
import { TagRow } from "./TagRow";

import picker from "./pickers.module.css";
import tagPicker from "./tagPicker.module.css";

// The names of a popup, one row each. A list that can be put in another order
// (a dropdown's options, shown whole, not searched) takes a drag on each grip,
// or Alt + arrow on the name.
export function TagList({
  kind,
  colors,
  known,
  shown,
  selected,
  listId,
  newName,
  onToggle,
  onEdit,
  onRemove,
  onMove,
  onCreate,
}: {
  kind: PickerKind;
  colors: TagColors;
  known: string[];
  shown: string[];
  selected: string[];
  listId: string;
  // What was typed, when it is not a name yet: a row to make it.
  newName: string | undefined;
  onToggle: (tag: string) => void;
  onEdit: (tag: string) => void;
  onRemove: ((tag: string) => void) | undefined;
  onMove: ((tag: string, to: number) => void) | undefined;
  onCreate: () => void;
}) {
  const list = useRef<HTMLDivElement>(null);
  const ordered = onMove !== undefined && shown.length === known.length;
  useSortableList(list, {
    kind: "option",
    listId,
    axis: "vertical",
    gap: 6,
    count: shown.length,
  });
  useSortableDrop("option", move => {
    onMove?.(move.id, insertionIndex(known, move.id, move.index));
  });
  const keys = (tag: string, index: number) => (event: KeyboardEvent) => {
    const by = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
    if (
      ordered &&
      event.altKey &&
      by !== 0 &&
      known[index + by] !== undefined
    ) {
      event.preventDefault();
      onMove(tag, index + by);
    }
  };
  return (
    <div ref={list} className={tagPicker.list}>
      {newName !== undefined && (
        <button type="button" className={tagPicker.create} onClick={onCreate}>
          <Plus size={14} />
          Create {kind.show(newName)}
        </button>
      )}
      {shown.map((tag, index) => {
        const row = (
          <TagRow
            kind={kind}
            tag={tag}
            color={colorOf(tag, colors)}
            checked={selected.includes(tag)}
            grip={ordered}
            onToggle={() => {
              onToggle(tag);
            }}
            onEdit={() => {
              onEdit(tag);
            }}
            onRemove={
              onRemove === undefined
                ? undefined
                : () => {
                    glideAround(() => {
                      onRemove(tag);
                    });
                  }
            }
            onKeyDown={keys(tag, index)}
          />
        );
        return ordered ? (
          <SortableItem
            key={tag}
            kind="option"
            id={tag}
            listId={listId}
            axis="vertical"
            index={index}
            count={shown.length}
            handle="[data-drag-handle]"
          >
            {row}
          </SortableItem>
        ) : (
          <Fragment key={tag}>{row}</Fragment>
        );
      })}
      {shown.length === 0 && newName === undefined && (
        <p className={picker.note}>
          {known.length === 0
            ? `No ${kind.noun}s yet. Type a name to make one.`
            : `No ${kind.noun} matches.`}
        </p>
      )}
    </div>
  );
}
