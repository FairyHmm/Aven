import { dropIndex } from "../../../../shared/lib/dnd/reorder";
import { parseCellId } from "../../lib/table/range";

export type Axis = "row" | "column";

// The grip to show for the pointer: the column or row it is by, and where the
// grip sits along the edge, relative to the wrapper.
export type Hover = { axis: Axis; index: number; at: number };

// The insertion line of a drop preview, relative to the editor's wrapper.
export type Line = { axis: Axis; x: number; y: number; length: number };

// The cells of one row (the body's rows, 0-based) or one column (header
// included), found by the place their input records: merged-away cells are
// not drawn, so counting cells would be wrong.
export function cellsOf(
  root: HTMLElement,
  axis: Axis,
  index: number,
): HTMLElement[] {
  const selector =
    axis === "row" ? `[data-cell^="${index}:"]` : `[data-cell$=":${index}"]`;
  return [...root.querySelectorAll<HTMLElement>(selector)]
    .map(field => field.closest("td, th"))
    .filter((cell): cell is HTMLElement => cell instanceof HTMLElement);
}

// What a row or column covers on screen.
export function boxOf(
  root: HTMLElement,
  axis: Axis,
  index: number,
): DOMRect | undefined {
  const rects = cellsOf(root, axis, index).map(cell =>
    cell.getBoundingClientRect(),
  );
  if (rects.length === 0) {
    return undefined;
  }
  const left = Math.min(...rects.map(rect => rect.left));
  const top = Math.min(...rects.map(rect => rect.top));
  return new DOMRect(
    left,
    top,
    Math.max(...rects.map(rect => rect.right)) - left,
    Math.max(...rects.map(rect => rect.bottom)) - top,
  );
}

// The columns, left to right, as far as x goes. A merged cell is shared out
// evenly over the columns it covers, unless a plain cell shows one better.
function columnRects(root: HTMLElement): DOMRect[] {
  const found = new Map<
    number,
    { left: number; right: number; plain: boolean }
  >();
  for (const field of root.querySelectorAll<HTMLElement>("[data-cell]")) {
    const cell = field.closest("td, th");
    const column = parseCellId(field.dataset["cell"])?.column;
    if (!(cell instanceof HTMLTableCellElement) || column === undefined) {
      continue;
    }
    const box = cell.getBoundingClientRect();
    const share = box.width / cell.colSpan;
    for (let at = 0; at < cell.colSpan; at += 1) {
      const known = found.get(column + at);
      if (known === undefined || (cell.colSpan === 1 && !known.plain)) {
        found.set(column + at, {
          left: box.left + at * share,
          right: box.left + (at + 1) * share,
          plain: cell.colSpan === 1,
        });
      }
    }
  }
  return [...found.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, { left, right }]) => new DOMRect(left, 0, right - left, 0));
}

// The movable lanes along the axis: body rows, or the columns.
const lanes = (root: HTMLElement, axis: Axis) =>
  axis === "column"
    ? columnRects(root)
    : [...root.querySelectorAll<HTMLElement>("tbody tr")].map(lane =>
        lane.getBoundingClientRect(),
      );

// Where a dragged row or column would go, by the pointer against the middles
// of the others: the index it is put back before (0 to the count).
export function targetIndex(
  root: HTMLElement,
  axis: Axis,
  pointer: { x: number; y: number },
): number {
  const slots = lanes(root, axis).map(rect => ({
    mid:
      axis === "row" ? rect.top + rect.height / 2 : rect.left + rect.width / 2,
  }));
  return dropIndex(axis === "row" ? pointer.y : pointer.x, slots);
}

export function lineAt(
  root: HTMLElement,
  axis: Axis,
  to: number,
): Line | undefined {
  const rects = lanes(root, axis);
  const next = rects[to];
  const last = rects.at(-1);
  const table = root.querySelector("table")?.getBoundingClientRect();
  if (last === undefined || table === undefined) {
    return undefined;
  }
  const box = root.getBoundingClientRect();
  if (axis === "column") {
    return {
      axis,
      x: (next?.left ?? last.right) - box.left,
      y: table.top - box.top,
      length: table.height,
    };
  }
  return {
    axis,
    x: table.left - box.left,
    y: (next?.top ?? last.bottom) - box.top,
    length: table.width,
  };
}

const BAND = 10; // how far into the table the edge reaches

// The grip for the pointer, if it is by the table's top edge (a column's grip)
// or left edge (a row's), in the wrapper's padding or the first few pixels of
// the table. Anywhere else there is none.
export function hoverOf(
  root: HTMLElement,
  pointer: { x: number; y: number },
): Hover | undefined {
  const table = root.querySelector("table")?.getBoundingClientRect();
  if (table === undefined) {
    return undefined;
  }
  const box = root.getBoundingClientRect();
  const insideX = pointer.x >= table.left && pointer.x <= table.right;
  const insideY = pointer.y >= table.top && pointer.y <= table.bottom;
  const top = insideX && pointer.y >= box.top && pointer.y - table.top <= BAND;
  const left =
    insideY && pointer.x >= box.left && pointer.x - table.left <= BAND;
  // In the corner, the edge the pointer is nearer to.
  const byTop =
    top && (!left || pointer.y - table.top <= pointer.x - table.left);
  if (byTop) {
    const rects = lanes(root, "column");
    const index = rects.findIndex(
      rect => pointer.x >= rect.left && pointer.x < rect.right,
    );
    const rect = rects[index];
    return rect === undefined
      ? undefined
      : { axis: "column", index, at: rect.left + rect.width / 2 - box.left };
  }
  if (left) {
    const rects = lanes(root, "row");
    const index = rects.findIndex(
      rect => pointer.y >= rect.top && pointer.y < rect.bottom,
    );
    const rect = rects[index];
    return rect === undefined
      ? undefined
      : { axis: "row", index, at: rect.top + rect.height / 2 - box.top };
  }
  return undefined;
}
