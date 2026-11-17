import { Menu } from "@mantine/core";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownAZ,
  ArrowDownZA,
  ArrowLeft,
  ArrowRight,
  BetweenVerticalEnd,
  BetweenVerticalStart,
  Check,
  CopyPlus,
  Eraser,
  Trash2,
} from "lucide-react";

import {
  addColumn,
  type Align,
  removeColumn,
  setAlign,
} from "../../../lib/table/model";
import {
  canSort,
  clearColumn,
  duplicateColumn,
  shiftColumn,
  sortRows,
} from "../../../lib/table/ops";
import type { ItemProps } from "./tableChange";

const ALIGNS: { align: Align; label: string; icon: typeof AlignLeft }[] = [
  { align: "left", label: "Align left", icon: AlignLeft },
  { align: "center", label: "Align center", icon: AlignCenter },
  { align: "right", label: "Align right", icon: AlignRight },
];

// The same for the column, with its alignment and sorting of the rows by it.
export function ColumnItems({ model, row, column, onChange }: ItemProps) {
  const current = model.align[column] ?? "none";
  const sortable = canSort(model);
  const why = sortable ? undefined : "Needs two rows and no merged (^) cells";
  return (
    <>
      <Menu.Item
        leftSection={<BetweenVerticalStart size={14} />}
        onClick={() => {
          onChange(addColumn(model, column), { row, column });
        }}
      >
        Add left
      </Menu.Item>
      <Menu.Item
        leftSection={<BetweenVerticalEnd size={14} />}
        onClick={() => {
          onChange(addColumn(model, column + 1), { row, column: column + 1 });
        }}
      >
        Add right
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        leftSection={<ArrowLeft size={14} />}
        disabled={column === 0}
        onClick={() => {
          onChange(shiftColumn(model, column, -1), { row, column: column - 1 });
        }}
      >
        Move left
      </Menu.Item>
      <Menu.Item
        leftSection={<ArrowRight size={14} />}
        disabled={column === model.header.length - 1}
        onClick={() => {
          onChange(shiftColumn(model, column, 1), { row, column: column + 1 });
        }}
      >
        Move right
      </Menu.Item>
      <Menu.Item
        leftSection={<CopyPlus size={14} />}
        onClick={() => {
          onChange(duplicateColumn(model, column), { row, column: column + 1 });
        }}
      >
        Duplicate
      </Menu.Item>
      <Menu.Divider />
      {ALIGNS.map(item => (
        <Menu.Item
          key={item.align}
          leftSection={<item.icon size={14} />}
          rightSection={current === item.align ? <Check size={14} /> : null}
          onClick={() => {
            onChange(setAlign(model, column, item.align));
          }}
        >
          {item.label}
        </Menu.Item>
      ))}
      <Menu.Divider />
      <Menu.Item
        leftSection={<ArrowDownAZ size={14} />}
        disabled={!sortable}
        title={why}
        onClick={() => {
          onChange(sortRows(model, column, "asc"));
        }}
      >
        Sort A to Z
      </Menu.Item>
      <Menu.Item
        leftSection={<ArrowDownZA size={14} />}
        disabled={!sortable}
        title={why}
        onClick={() => {
          onChange(sortRows(model, column, "desc"));
        }}
      >
        Sort Z to A
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        leftSection={<Eraser size={14} />}
        onClick={() => {
          onChange(clearColumn(model, column), { row, column });
        }}
      >
        Clear contents
      </Menu.Item>
      <Menu.Item
        color="red"
        leftSection={<Trash2 size={14} />}
        disabled={model.header.length <= 1}
        onClick={() => {
          onChange(removeColumn(model, column));
        }}
      >
        Delete column
      </Menu.Item>
    </>
  );
}
