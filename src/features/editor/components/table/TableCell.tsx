import {
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  useState,
} from "react";

import { shortcutFor } from "../../lib/format/shortcuts";
import type { Align } from "../../lib/table/model";
import type { Direction } from "../../lib/table/nav";
import { cellId } from "../../lib/table/range";
import { MarkdownView } from "../MarkdownView";
import { runOnField } from "../menu/host";

import cellClasses from "./cell.module.css";
import classes from "./editor.module.css";
import rangeClasses from "./range.module.css";

// A key that leaves the cell or acts on it: Enter and the arrows at the edge
// of its text, and Backspace at the very start of a merged cell, which
// unmerges it. Shift+Enter breaks the line inside the cell instead.
type Exit = Direction | "break" | "unmerge";

function exitOf(
  event: KeyboardEvent<HTMLTextAreaElement>,
  merged: boolean,
): Exit | undefined {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return undefined;
  }
  if (event.key === "Enter") {
    return event.shiftKey ? "break" : "enter";
  }
  const { selectionStart: from, selectionEnd: to, value } = event.currentTarget;
  const caret = from === to && !event.shiftKey;
  const exits: Record<string, { exit: Exit; when: boolean }> = {
    Backspace: { exit: "unmerge", when: caret && from === 0 && merged },
    ArrowUp: {
      exit: "up",
      when: caret && !value.slice(0, from).includes("\n"),
    },
    ArrowDown: { exit: "down", when: caret && !value.slice(to).includes("\n") },
    ArrowLeft: { exit: "left", when: caret && from === 0 },
    ArrowRight: { exit: "right", when: caret && to === value.length },
  };
  const found = exits[event.key];
  return found?.when === true ? found.exit : undefined;
}

type Props = {
  row: number; // -1 is the header
  column: number;
  value: string;
  align: Align;
  mark: "lift" | "pick" | undefined;
  // Part of a block of cells picked.
  ranged: boolean;
  colSpan: number;
  rowSpan: number;
  // Whether this is a merged cell.
  merged: boolean;
  onChange: (value: string) => void;
  onNavigate: (direction: Direction) => void;
  onContext: (event: MouseEvent<HTMLTextAreaElement>) => void;
  onPress: (event: PointerEvent<HTMLTextAreaElement>) => void;
  onUnmerge: () => void;
  // The caret is in the cell: a typed merge marker waits until it leaves.
  onFocusCell: () => void;
  onBlurCell: () => void;
};

export function TableCell({
  row,
  column,
  value,
  align,
  mark,
  ranged,
  colSpan,
  rowSpan,
  merged,
  onChange,
  onNavigate,
  onContext,
  onPress,
  onUnmerge,
  onFocusCell,
  onBlurCell,
}: Props) {
  const Tag = row < 0 ? "th" : "td";
  const [focused, setFocused] = useState(false);
  const label =
    row < 0 ? `Header ${column + 1}` : `Row ${row + 1}, column ${column + 1}`;
  return (
    <Tag
      className={[
        classes.field,
        cellClasses.box,
        ranged ? rangeClasses.ranged : "",
      ].join(" ")}
      data-mark={mark}
      colSpan={colSpan > 1 ? colSpan : undefined}
      rowSpan={rowSpan > 1 ? rowSpan : undefined}
    >
      {focused ? (
        <div className={classes.sizer} data-value={value} />
      ) : (
        <div className={cellClasses.view}>
          <MarkdownView body={value.replaceAll("\n", "\\\n")} />
        </div>
      )}
      <textarea
        className={`${classes.cell} ${cellClasses.round} ${focused ? "" : cellClasses.hidden}`}
        rows={1}
        data-cell={cellId(row, column)}
        value={value}
        aria-label={label}
        style={{ textAlign: align === "none" ? undefined : align }}
        onChange={event => {
          onChange(event.target.value);
        }}
        onFocus={() => {
          setFocused(true);
          onFocusCell();
        }}
        onBlur={() => {
          setFocused(false);
          onBlurCell();
        }}
        onContextMenu={onContext}
        onPointerDown={onPress}
        onKeyDown={event => {
          const format = shortcutFor(event);
          if (format !== undefined) {
            event.preventDefault();
            runOnField(event.currentTarget, format, onChange);
            return;
          }
          const exit = exitOf(event, merged);
          if (exit === undefined) {
            return;
          }
          event.preventDefault();
          if (exit === "unmerge") {
            onUnmerge();
          } else if (exit !== "break") {
            onNavigate(exit);
          } else {
            const field = event.currentTarget;
            const at = field.selectionStart;
            onChange(
              `${value.slice(0, at)}\n${value.slice(field.selectionEnd)}`,
            );
            requestAnimationFrame(() => {
              field.setSelectionRange(at + 1, at + 1);
            });
          }
        }}
      />
    </Tag>
  );
}
