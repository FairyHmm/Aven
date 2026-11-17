import { type Axis, boxOf, cellsOf } from "./geometry";

import classes from "./editor.module.css";
import look from "./look.module.css";

// A copy of a row or column, built from its real cells and laid over them
// where they are, to be the picture the drag layer lifts. The text of a cell is
// the hidden copy that sizes it, shown here instead of the input.
export function ghostOf(
  root: HTMLElement,
  axis: Axis,
  index: number,
): HTMLElement | undefined {
  const cells = cellsOf(root, axis, index);
  const box = boxOf(root, axis, index);
  if (box === undefined) {
    return undefined;
  }
  const ghost = document.createElement("div");
  ghost.className = `${look.frame} ${classes.ghost}`;
  const body = document.createElement("table");
  body.className = look.table;
  ghost.append(body);
  const groups = axis === "row" ? [cells] : cells.map(cell => [cell]);
  for (const group of groups) {
    const row = body.insertRow();
    for (const cell of group) {
      const copy = cell.cloneNode(true);
      if (copy instanceof HTMLElement) {
        const size = cell.getBoundingClientRect();
        copy.style.width = `${size.width}px`;
        copy.style.height = `${size.height}px`;
        row.append(copy);
      }
    }
  }
  ghost.style.setProperty("--table-pad", "0");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${box.left}px`,
    top: `${box.top}px`,
    opacity: "0",
    pointerEvents: "none",
  });
  document.body.append(ghost);
  return ghost;
}
