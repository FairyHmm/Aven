import { type RefObject, useLayoutEffect, useState } from "react";

import { inRect, parseCellId, type Rect } from "../../lib/table/range";

import classes from "./range.module.css";

type Box = {
  left: number;
  top: number;
  width: number;
  height: number;
  radius: string;
};

const SMALL = "3px";

// Where the cells of the block are, in the wrapper, and which corners of it are
// the table's own corners.
function measure(root: HTMLElement, rect: Rect): Box | undefined {
  const cells = [...root.querySelectorAll<HTMLElement>("[data-cell]")]
    .filter(field => {
      const cell = parseCellId(field.dataset["cell"]);
      return cell !== undefined && inRect(rect, cell.row, cell.column);
    })
    .map(field => (field.parentElement ?? field).getBoundingClientRect());
  const frame = root.querySelector("table")?.parentElement;
  if (cells.length === 0 || !frame) {
    return undefined;
  }
  const left = Math.min(...cells.map(box => box.left));
  const top = Math.min(...cells.map(box => box.top));
  const right = Math.max(...cells.map(box => box.right));
  const bottom = Math.max(...cells.map(box => box.bottom));
  const outer = frame.getBoundingClientRect();
  const round = getComputedStyle(frame).borderTopLeftRadius;
  const at = (a: number, b: number) => Math.abs(a - b) < 3;
  const corner = (x: boolean, y: boolean) => (x && y ? round : SMALL);
  const atLeft = at(left, outer.left);
  const atRight = at(right, outer.right);
  const atTop = at(top, outer.top);
  const atBottom = at(bottom, outer.bottom);
  const origin = root.getBoundingClientRect();
  return {
    left: left - origin.left,
    top: top - origin.top,
    width: right - left,
    height: bottom - top,
    radius: [
      corner(atTop, atLeft),
      corner(atTop, atRight),
      corner(atBottom, atRight),
      corner(atBottom, atLeft),
    ].join(" "),
  };
}

const same = (a: Box | undefined, b: Box | undefined) =>
  a === b ||
  (a !== undefined &&
    b !== undefined &&
    a.left === b.left &&
    a.top === b.top &&
    a.width === b.width &&
    a.height === b.height &&
    a.radius === b.radius);

type Props = {
  root: RefObject<HTMLElement | null>;
  rect: Rect | undefined;
};

// A border round the block of cells picked.
export function RangeOutline({ root, rect }: Props) {
  const [box, setBox] = useState<Box>();
  // After every render: the cells may have moved (text typed, a row added).
  useLayoutEffect(() => {
    const next =
      rect === undefined || root.current === null
        ? undefined
        : measure(root.current, rect);
    setBox(before => (same(before, next) ? before : next));
  });
  return box === undefined ? null : (
    <div
      className={classes.outline}
      style={{
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        borderRadius: box.radius,
      }}
    />
  );
}
