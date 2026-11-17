import { Menu } from "@mantine/core";
import { ClipboardPaste, Copy, Eraser, Merge, Scissors } from "lucide-react";

import { applyEdit, type Command } from "../../../lib/format/edit";
import type { TableModel } from "../../../lib/table/model";
import {
  clearRect,
  mapCells,
  mergeable,
  mergeRect,
  type Rect,
} from "../../../lib/table/range";
import { parseTsv, pasteCells, rectText } from "../../../lib/table/text";
import { readClipboard, writeClipboard } from "../clipboard";
import { FormatMenu } from "../FormatMenu";
import type { Change } from "./tableChange";

type Props = {
  model: TableModel;
  rect: Rect;
  onChange: Change;
};

// The menu of a block of cells: what applies to all of them at once.
export function RangeItems({ model, rect, onChange }: Props) {
  const copy = () => writeClipboard(rectText(model, rect));
  const format = (command: Command) => {
    onChange(
      mapCells(model, rect, value => {
        const edit = command(value, { from: 0, to: value.length });
        return edit === undefined ? value : applyEdit(value, edit);
      }),
    );
  };
  return (
    <>
      <FormatMenu run={format} active={undefined} />
      <Menu.Item
        leftSection={<Merge size={14} />}
        disabled={!mergeable(rect)}
        onClick={() => {
          onChange(mergeRect(model, rect));
        }}
      >
        Merge cells
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        leftSection={<Scissors size={14} />}
        onClick={() => {
          void copy().then(copied => {
            if (copied) {
              onChange(clearRect(model, rect));
            }
          });
        }}
      >
        Cut
      </Menu.Item>
      <Menu.Item
        leftSection={<Copy size={14} />}
        onClick={() => {
          void copy();
        }}
      >
        Copy
      </Menu.Item>
      <Menu.Item
        leftSection={<ClipboardPaste size={14} />}
        onClick={() => {
          void readClipboard().then(text => {
            if (text !== undefined) {
              onChange(
                pasteCells(
                  model,
                  { row: rect.top, column: rect.left },
                  parseTsv(text),
                ),
              );
            }
          });
        }}
      >
        Paste
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        leftSection={<Eraser size={14} />}
        onClick={() => {
          onChange(clearRect(model, rect));
        }}
      >
        Clear contents
      </Menu.Item>
    </>
  );
}
