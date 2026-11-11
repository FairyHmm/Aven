import { Checkbox } from "@mantine/core";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { type KeyboardEvent, useEffect, useState } from "react";

import { attrsOf, type LabelColor } from "../../lib/labels/labelColors";
import type { PickerKind } from "../../lib/labels/pickerKinds";

import classes from "./tagPicker.module.css";

// One name in the popup: a tick (for labels, which are many), its bar in its
// colour with its text, a pencil to change it and, where the list allows it, a
// grip to drag it to another place and a bin (asking twice) to delete it.
export function TagRow({
  kind,
  tag,
  color,
  checked,
  grip,
  onToggle,
  onEdit,
  onRemove,
  onKeyDown,
}: {
  kind: PickerKind;
  tag: string;
  color: LabelColor;
  checked: boolean;
  // Shows the grip (the list is in order, and may be put in another).
  grip: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onRemove: (() => void) | undefined;
  onKeyDown: (event: KeyboardEvent) => void;
}) {
  const tick = !kind.single;
  // Deleting changes every card that holds the name: the first click asks.
  const [sure, setSure] = useState(false);
  useEffect(() => {
    if (!sure) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setSure(false);
    }, 2500);
    return () => {
      window.clearTimeout(timer);
    };
  }, [sure]);
  return (
    <div className={classes.labelRow} data-leave="">
      {grip && (
        <span
          className={classes.grip}
          data-drag-handle
          data-drag-hide=""
          aria-hidden
        >
          <GripVertical size={14} />
        </span>
      )}
      <span
        className={classes.tick}
        data-on={tick ? "" : undefined}
        inert={!tick}
      >
        <Checkbox
          size="xs"
          aria-label={kind.show(tag)}
          checked={checked}
          onChange={onToggle}
        />
      </span>
      <button
        type="button"
        className={classes.bar}
        data-drag-body=""
        {...attrsOf(color)}
        data-chosen={!tick && checked ? "" : undefined}
        onClick={onToggle}
        onKeyDown={onKeyDown}
      >
        {kind.show(tag)}
      </button>
      <button
        type="button"
        className={classes.pencil}
        data-drag-hide=""
        aria-label={`Edit ${kind.show(tag)}`}
        onClick={onEdit}
      >
        <Pencil size={14} />
      </button>
      {onRemove !== undefined && (
        <button
          type="button"
          className={classes.pencil}
          data-drag-hide=""
          data-sure={sure ? "" : undefined}
          aria-label={`${sure ? "Confirm: delete" : "Delete"} ${kind.show(tag)}`}
          onClick={() => {
            if (sure) {
              onRemove();
            } else {
              setSure(true);
            }
          }}
          onBlur={() => {
            setSure(false);
          }}
        >
          {sure ? "Delete?" : <Trash2 size={14} />}
        </button>
      )}
    </div>
  );
}
