import type { RefObject } from "react";

import type { Layout } from "../lib/table/layout";
import { addRow, type TableModel } from "../lib/table/model";
import { type Direction, stepFrom } from "../lib/table/nav";
import { cellId } from "../lib/table/range";

type Options = {
  root: RefObject<HTMLElement | null>;
  model: TableModel;
  layout: Layout;
  write: (model: TableModel) => void;
  leave: (direction: "up" | "down") => void;
};

// Moving the caret about the grid: into a cell by its place (row -1 is the
// header), and out of one by the key that left it.
export function useTableNav({ root, model, layout, write, leave }: Options) {
  // Once the rewrite has been drawn. A cell merged into another is reached
  // through the cell that shows it.
  const focus = (row: number, column: number, where: "start" | "end") => {
    const shown = layout.shownBy(row, column);
    requestAnimationFrame(() => {
      const field = root.current?.querySelector<HTMLTextAreaElement>(
        `[data-cell="${cellId(shown.row, shown.column)}"]`,
      );
      field?.focus();
      const at = where === "end" ? (field?.value.length ?? 0) : 0;
      field?.setSelectionRange(at, at);
    });
  };

  // Right and down leave a merged cell by its far edge, so they don't land on
  // the cell they came from.
  const navigate = (row: number, column: number, direction: Direction) => {
    const { colSpan, rowSpan } = layout.span(row, column);
    const step = stepFrom(
      model.rows.length,
      model.header.length,
      direction === "down" || direction === "enter" ? row + rowSpan - 1 : row,
      direction === "right" ? column + colSpan - 1 : column,
      direction,
    );
    if (step.kind === "out") {
      leave(step.direction);
      return;
    }
    if (step.grow) {
      write(addRow(model));
    }
    focus(step.row, step.column, step.where);
  };

  return { focus, navigate };
}
