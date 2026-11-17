import { useState } from "react";

import type { Spot } from "../components/menu/table/tableChange";
import type { Axis } from "../components/table/geometry";

// Where the cell menu hangs and whether it is open. `at` is in viewport
// coordinates.
export function useTableMenu() {
  const [spot, setSpot] = useState<Spot>();
  const [opened, setOpened] = useState(false);
  const open = (
    row: number,
    column: number,
    at: { left: number; bottom: number },
    scope?: Axis,
    field?: HTMLTextAreaElement,
  ) => {
    setSpot({
      row,
      column,
      scope,
      field:
        field === undefined
          ? undefined
          : {
              element: field,
              from: field.selectionStart,
              to: field.selectionEnd,
            },
      x: at.left,
      y: at.bottom,
    });
    setOpened(true);
  };
  const close = () => {
    setOpened(false);
  };
  // The row or column picked with its grip, while its menu is open.
  const picked =
    opened && spot?.scope !== undefined
      ? {
          axis: spot.scope,
          index: spot.scope === "row" ? spot.row : spot.column,
        }
      : undefined;
  return { spot, opened, open, close, picked };
}
