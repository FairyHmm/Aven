import type { TableModel } from "../../../lib/table/model";

// The new table, and the cell to put the caret in afterwards.
export type Change = (
  next: TableModel,
  focus?: { row: number; column: number },
) => void;

export type ItemProps = {
  model: TableModel;
  row: number; // -1 is the header
  column: number;
  onChange: Change;
};

// Where the menu was opened: the cell (`row` -1 is the header) and the pointer
// in viewport pixels. From a grip it is only about that `scope`; from a cell it
// also has the text field and what was selected in it.
export type Spot = {
  row: number;
  column: number;
  x: number;
  y: number;
  scope?: "row" | "column" | undefined;
  field?:
    | { element: HTMLTextAreaElement; from: number; to: number }
    | undefined;
};
