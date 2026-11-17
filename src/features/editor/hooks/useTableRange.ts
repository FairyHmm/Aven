import {
  type ClipboardEvent,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

import type { TableModel } from "../lib/table/model";
import {
  type Cell,
  clearRect,
  inRect,
  isSingle,
  type Rect,
  parseCellId,
  rectOf,
} from "../lib/table/range";
import { parseTsv, pasteCells, rectText } from "../lib/table/text";

type Props = {
  root: RefObject<HTMLElement | null>;
  model: TableModel;
  write: (model: TableModel) => void;
};

// The cell a pointer or key event is in, from the `data-cell` of its field.
function cellOf(target: EventTarget | null): Cell | undefined {
  const field =
    target instanceof Element ? target.closest("[data-cell]") : null;
  return parseCellId(field?.getAttribute("data-cell"));
}

// Picking a block of cells: drag from one cell into another, or Shift+click.
// While more than one cell is picked, Delete clears them, and copy, cut and
// paste work on them as tab-separated text (what spreadsheets use). Pasting
// tab-separated text into a single cell fills cells from there.
export function useTableRange({ root, model, write }: Props) {
  const [picked, setPicked] = useState<{ anchor: Cell; head: Cell }>();
  const drag = useRef<Cell | undefined>(undefined);
  // The cell that had the caret last, where Shift+click starts from.
  const last = useRef<Cell>({ row: 0, column: 0 });
  const rect: Rect | undefined =
    picked === undefined ? undefined : rectOf(picked.anchor, picked.head);
  const active = rect !== undefined && !isSingle(rect) ? rect : undefined;

  useEffect(() => {
    const end = () => {
      drag.current = undefined;
    };
    window.addEventListener("pointerup", end);
    return () => {
      window.removeEventListener("pointerup", end);
    };
  }, []);

  const clear = () => {
    setPicked(undefined);
  };

  return {
    active,
    has: (row: number, column: number) =>
      active !== undefined && inRect(active, row, column),
    clear,
    // A menu opens on this cell: a block picked stays if the cell is in it.
    settle: (row: number, column: number) => {
      if (active === undefined || !inRect(active, row, column)) {
        clear();
      }
    },
    remember: (cell: Cell) => {
      last.current = cell;
    },
    // A pointer went down in a cell.
    press: (cell: Cell, event: PointerEvent) => {
      if (event.button !== 0) {
        return;
      }
      if (event.shiftKey) {
        event.preventDefault();
        setPicked({ anchor: last.current, head: cell });
        return;
      }
      drag.current = cell;
      setPicked(undefined);
    },
    // The handlers of the wrapper around the table.
    onPointerMove: (event: PointerEvent) => {
      const from = drag.current;
      const to = cellOf(
        root.current?.ownerDocument.elementFromPoint(
          event.clientX,
          event.clientY,
        ) ?? null,
      );
      if (
        from !== undefined &&
        to !== undefined &&
        event.buttons === 1 &&
        (from.row !== to.row || from.column !== to.column)
      ) {
        setPicked({ anchor: from, head: to });
        window.getSelection()?.removeAllRanges();
      }
    },
    onKeyDownCapture: (event: KeyboardEvent) => {
      if (active === undefined) {
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        event.stopPropagation();
        write(clearRect(model, active));
      } else if (event.key === "Escape") {
        clear();
      }
    },
    onCopy: (event: ClipboardEvent) => {
      if (active !== undefined) {
        event.preventDefault();
        event.clipboardData.setData("text/plain", rectText(model, active));
      }
    },
    onCut: (event: ClipboardEvent) => {
      if (active !== undefined) {
        event.preventDefault();
        event.clipboardData.setData("text/plain", rectText(model, active));
        write(clearRect(model, active));
      }
    },
    onPaste: (event: ClipboardEvent) => {
      const text = event.clipboardData.getData("text/plain");
      if (active === undefined && !text.includes("\t")) {
        return;
      }
      event.preventDefault();
      const at =
        active === undefined
          ? last.current
          : { row: active.top, column: active.left };
      write(pasteCells(model, at, parseTsv(text)));
      clear();
    },
  };
}
