import type { Layout } from "../../lib/table/layout";
import type { TableModel } from "../../lib/table/model";
import type { Rect } from "../../lib/table/range";
import { MenuShell } from "../menu/MenuShell";
import type { Change, Spot } from "../menu/table/tableChange";
import { TableMenuBody } from "../menu/table/TableMenuBody";

type Props = {
  model: TableModel;
  layout: Layout;
  spot: Spot | undefined;
  opened: boolean;
  // The block of cells picked, if there is one.
  range: Rect | undefined;
  onClose: () => void;
  onChange: Change;
  onRemove: () => void;
};

// The right-click menu of a cell: format and clipboard for its text, the row
// and the column it is in, merging, the table. On a block of cells picked it
// is what applies to all of them. Opened from a grip it is only the row's or
// the column's items.
export function TableMenu({
  model,
  layout,
  spot,
  opened,
  range,
  onClose,
  onChange,
  onRemove,
}: Props) {
  return (
    <MenuShell
      opened={opened}
      onClose={onClose}
      x={spot?.x ?? 0}
      y={spot?.y ?? 0}
    >
      <TableMenuBody
        model={model}
        layout={layout}
        spot={spot}
        range={range}
        onChange={onChange}
        onRemove={onRemove}
      />
    </MenuShell>
  );
}
