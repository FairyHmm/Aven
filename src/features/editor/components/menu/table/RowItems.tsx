import { Menu } from "@mantine/core";
import {
  ArrowDown,
  ArrowUp,
  BetweenHorizontalEnd,
  BetweenHorizontalStart,
  CopyPlus,
  Eraser,
  Trash2,
} from "lucide-react";

import { addRow, removeRow } from "../../../lib/table/model";
import { clearRow, duplicateRow, shiftRow } from "../../../lib/table/ops";
import type { ItemProps } from "./tableChange";

// Add, move, duplicate, clear and delete: the row of the cell. The header is
// a row that can only have one added under it, or be cleared.
export function RowItems({ model, row, column, onChange }: ItemProps) {
  const header = row < 0;
  const last = model.rows.length - 1;
  return (
    <>
      <Menu.Item
        leftSection={<BetweenHorizontalStart size={14} />}
        disabled={header}
        onClick={() => {
          onChange(addRow(model, row), { row, column });
        }}
      >
        Add above
      </Menu.Item>
      <Menu.Item
        leftSection={<BetweenHorizontalEnd size={14} />}
        onClick={() => {
          onChange(addRow(model, row + 1), { row: row + 1, column });
        }}
      >
        Add below
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        leftSection={<ArrowUp size={14} />}
        disabled={header || row === 0}
        onClick={() => {
          onChange(shiftRow(model, row, -1), { row: row - 1, column });
        }}
      >
        Move up
      </Menu.Item>
      <Menu.Item
        leftSection={<ArrowDown size={14} />}
        disabled={header || row === last}
        onClick={() => {
          onChange(shiftRow(model, row, 1), { row: row + 1, column });
        }}
      >
        Move down
      </Menu.Item>
      <Menu.Item
        leftSection={<CopyPlus size={14} />}
        disabled={header}
        onClick={() => {
          onChange(duplicateRow(model, row), { row: row + 1, column });
        }}
      >
        Duplicate
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        leftSection={<Eraser size={14} />}
        onClick={() => {
          onChange(clearRow(model, row), { row, column });
        }}
      >
        Clear contents
      </Menu.Item>
      <Menu.Item
        color="red"
        leftSection={<Trash2 size={14} />}
        disabled={header}
        onClick={() => {
          onChange(removeRow(model, row));
        }}
      >
        Delete row
      </Menu.Item>
    </>
  );
}
