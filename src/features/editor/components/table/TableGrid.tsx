import type { ReactNode } from "react";

import type { Layout } from "../../lib/table/layout";
import type { TableModel } from "../../lib/table/model";

import look from "./look.module.css";

type Props = {
  model: TableModel;
  layout: Layout;
  // The cell at this place (row -1 is the header).
  renderCell: (row: number, column: number, value: string) => ReactNode;
};

// The table's markup. Cells merged into another are left out; the cell that
// shows them spans their places.
export function TableGrid({ model, layout, renderCell }: Props) {
  const row = (cells: string[], at: number) =>
    cells.map((value, column) =>
      layout.hidden(at, column) ? null : renderCell(at, column, value),
    );
  return (
    <div className={look.frame}>
      <table className={look.table}>
        <thead>
          <tr>{row(model.header, -1)}</tr>
        </thead>
        <tbody>
          {model.rows.map((cells, at) => (
            <tr key={at}>{row(cells, at)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
