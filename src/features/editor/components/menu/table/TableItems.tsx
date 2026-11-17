import { Menu } from "@mantine/core";
import { ClipboardCopy, Table2, Trash2 } from "lucide-react";

import type { TableModel } from "../../../lib/table/model";
import { tableText } from "../../../lib/table/text";
import { writeClipboard } from "../clipboard";
import { SubMenu } from "../SubMenu";

type Props = {
  model: TableModel;
  onRemove: () => void;
};

const copy = (text: string) => {
  void writeClipboard(text);
};

// What can be done with the table as a whole.
export function TableItems({ model, onRemove }: Props) {
  return (
    <SubMenu icon={<Table2 size={14} />} label="Table">
      <Menu.Item
        leftSection={<ClipboardCopy size={14} />}
        onClick={() => {
          copy(tableText(model, "markdown"));
        }}
      >
        Copy as markdown
      </Menu.Item>
      <Menu.Item
        leftSection={<ClipboardCopy size={14} />}
        onClick={() => {
          copy(tableText(model, "csv"));
        }}
      >
        Copy as CSV
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        color="red"
        leftSection={<Trash2 size={14} />}
        onClick={onRemove}
      >
        Delete table
      </Menu.Item>
    </SubMenu>
  );
}
