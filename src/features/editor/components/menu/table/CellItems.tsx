import { Menu } from "@mantine/core";
import { Columns3, Merge, Rows3, Unlink } from "lucide-react";

import type { Active } from "../../../lib/format/state";
import { ClipboardItems } from "../ClipboardItems";
import { FormatMenu } from "../FormatMenu";
import { type Host, runCommand } from "../host";
import { SubMenu } from "../SubMenu";
import { ColumnItems } from "./ColumnItems";
import { RowItems } from "./RowItems";
import type { ItemProps } from "./tableChange";
import { TableItems } from "./TableItems";

type Props = {
  host: Host;
  selected: boolean;
  items: ItemProps;
  active: Active | undefined;
  // Unmerging, when the cell is merged.
  onUnmerge: (() => void) | undefined;
  // Merging into the cell above / to the left, when that can be done.
  mergeUp: (() => void) | undefined;
  mergeLeft: (() => void) | undefined;
  onRemove: () => void;
};

// What the menu of a cell holds: its text (format, clipboard), the row and the
// column it is in, merging, and the table as a whole.
export function CellItems({
  host,
  selected,
  items,
  active,
  onUnmerge,
  mergeUp,
  mergeLeft,
  onRemove,
}: Props) {
  return (
    <>
      <FormatMenu
        active={active}
        run={command => {
          runCommand(host, command);
        }}
      />
      <SubMenu icon={<Rows3 size={14} />} label="Row">
        <RowItems {...items} />
      </SubMenu>
      <SubMenu icon={<Columns3 size={14} />} label="Column">
        <ColumnItems {...items} />
      </SubMenu>
      <SubMenu icon={<Merge size={14} />} label="Merge">
        <Menu.Item disabled={mergeUp === undefined} onClick={mergeUp}>
          Into the cell above
        </Menu.Item>
        <Menu.Item disabled={mergeLeft === undefined} onClick={mergeLeft}>
          Into the cell to the left
        </Menu.Item>
        <Menu.Item
          leftSection={<Unlink size={14} />}
          disabled={onUnmerge === undefined}
          onClick={onUnmerge}
        >
          Unmerge
        </Menu.Item>
      </SubMenu>
      <TableItems model={items.model} onRemove={onRemove} />
      <Menu.Divider />
      <ClipboardItems host={host} selected={selected} />
    </>
  );
}
