import { Plus } from "lucide-react";

import classes from "./editor.module.css";

type Props = {
  onAddColumn: () => void;
  onAddRow: () => void;
};

// The strips along the right and bottom edges, flush against the table: they
// only draw while the pointer is on them.
export function TableEdges({ onAddColumn, onAddRow }: Props) {
  return (
    <>
      <button
        type="button"
        className={`${classes.edge} ${classes.edgeRight}`}
        title="Add column"
        onClick={onAddColumn}
      >
        <Plus size={12} />
      </button>
      <button
        type="button"
        className={`${classes.edge} ${classes.edgeBottom}`}
        title="Add row"
        onClick={onAddRow}
      >
        <Plus size={12} />
      </button>
    </>
  );
}
