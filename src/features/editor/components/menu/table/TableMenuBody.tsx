import { activeAt } from "../../../lib/format/state";
import { type Layout, isMerged, unmerge } from "../../../lib/table/layout";
import { type TableModel, setCell } from "../../../lib/table/model";
import { type Rect, mergeNeighbour } from "../../../lib/table/range";
import { fieldHost } from "../host";
import { CellItems } from "./CellItems";
import { ColumnItems } from "./ColumnItems";
import { RangeItems } from "./RangeItems";
import { RowItems } from "./RowItems";
import type { Change, Spot } from "./tableChange";

type Props = {
  model: TableModel;
  layout: Layout;
  spot: Spot | undefined;
  range: Rect | undefined;
  onChange: Change;
  onRemove: () => void;
};

// What is in the cell menu, by where it was opened: a grip (that row's or
// column's items), a block of cells picked, or a cell.
export function TableMenuBody({
  model,
  layout,
  spot,
  range,
  onChange,
  onRemove,
}: Props) {
  const row = spot?.row ?? 0;
  const column = spot?.column ?? 0;
  const items = { model, row, column, onChange };
  if (spot?.scope === "row") {
    return <RowItems {...items} />;
  }
  if (spot?.scope === "column") {
    return <ColumnItems {...items} />;
  }
  if (range !== undefined) {
    return <RangeItems model={model} rect={range} onChange={onChange} />;
  }
  const field = spot?.field;
  if (field === undefined) {
    return null;
  }
  const merge = (side: "up" | "left") => {
    const next = mergeNeighbour(model, layout, { row, column }, side);
    return next === undefined
      ? undefined
      : () => {
          onChange(next);
        };
  };
  return (
    <CellItems
      host={fieldHost(field.element, field, value => {
        onChange(setCell(model, row, column, value));
      })}
      selected={field.from !== field.to}
      items={items}
      active={activeAt(field.element.value, field)}
      onUnmerge={
        isMerged(layout, row, column)
          ? () => {
              onChange(unmerge(model, layout, row, column));
            }
          : undefined
      }
      mergeUp={merge("up")}
      mergeLeft={merge("left")}
      onRemove={onRemove}
    />
  );
}
