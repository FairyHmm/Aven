import { useRef, useState } from "react";

import { useHoldEscape } from "../../../board/stores/escapeStore";
import { markOf, useTableDrag } from "../../hooks/useTableDrag";
import { useTableHover } from "../../hooks/useTableHover";
import { useTableMenu } from "../../hooks/useTableMenu";
import { useTableNav } from "../../hooks/useTableNav";
import { useTableRange } from "../../hooks/useTableRange";
import { layoutOf, unmerge } from "../../lib/table/layout";
import {
  addColumn,
  addRow,
  moveColumn,
  moveRow,
  parseTable,
  serializeTable,
  setCell,
  type TableModel,
} from "../../lib/table/model";
import { RangeOutline } from "./RangeOutline";
import { TableCell } from "./TableCell";
import { TableEdges } from "./TableEdges";
import { TableGrid } from "./TableGrid";
import { TableGrips } from "./TableGrips";
import { TableMenu } from "./TableMenu";

import classes from "./editor.module.css";

type Props = {
  source: string;
  change: (source: string) => void;
  leave: (direction: "up" | "down") => void;
};

// The grid of a markdown table, edited in place. Every change is written
// straight back as markdown, so the document is always the truth. The markdown
// itself shows when the caret walks into it from the lines around the table.
export function TableEditor({ source, change, leave }: Props) {
  const model = parseTable(source);
  if (model === undefined) {
    return <pre>{source}</pre>;
  }
  return (
    <Grid
      model={model}
      leave={leave}
      remove={() => {
        change("");
      }}
      write={next => {
        change(serializeTable(next));
      }}
    />
  );
}

type GridProps = {
  model: TableModel;
  write: (model: TableModel) => void;
  leave: (direction: "up" | "down") => void;
  remove: () => void;
};

function Grid({ model, write, leave, remove }: GridProps) {
  const wrap = useRef<HTMLDivElement>(null);
  // The cell with the caret: a merge marker typed in it waits until it leaves.
  const [editing, setEditing] = useState<{ row: number; column: number }>();
  const layout = layoutOf(model, editing);
  const menu = useTableMenu();
  const range = useTableRange({ root: wrap, model, write });
  const { drag, press } = useTableDrag({
    root: wrap,
    onMove: (axis, from, to) => {
      write(
        axis === "row" ? moveRow(model, from, to) : moveColumn(model, from, to),
      );
    },
    onPick: (axis, index) => {
      const grip = wrap.current?.querySelector(
        `.${axis === "row" ? classes.gripRow : classes.gripColumn}`,
      );
      const at = grip?.getBoundingClientRect() ?? { left: 0, bottom: 0 };
      menu.open(
        axis === "row" ? index : -1,
        axis === "column" ? index : 0,
        at,
        axis,
      );
    },
  });
  const busy = drag !== undefined || menu.opened;
  const hovering = useTableHover(wrap, busy);
  const { focus, navigate } = useTableNav({
    root: wrap,
    model,
    layout,
    write,
    leave,
  });
  // Esc ends a drag or closes the menu, not the card around the table.
  useHoldEscape(busy || range.active !== undefined);
  const cell = (row: number, column: number, value: string) => {
    const { colSpan, rowSpan } = layout.span(row, column);
    return (
      <TableCell
        key={column}
        row={row}
        column={column}
        value={value}
        align={model.align[column] ?? "none"}
        mark={markOf(drag, menu.picked, row, column)}
        ranged={range.has(row, column)}
        colSpan={colSpan}
        rowSpan={rowSpan}
        merged={colSpan > 1 || rowSpan > 1}
        onChange={next => {
          range.clear();
          write(setCell(model, row, column, next));
        }}
        onPress={event => {
          range.press({ row, column }, event);
        }}
        onNavigate={direction => {
          navigate(row, column, direction);
        }}
        onContext={event => {
          event.preventDefault();
          range.settle(row, column);
          menu.open(
            row,
            column,
            { left: event.clientX, bottom: event.clientY },
            undefined,
            event.currentTarget,
          );
        }}
        onUnmerge={() => {
          write(unmerge(model, layout, row, column));
        }}
        onFocusCell={() => {
          setEditing({ row, column });
          range.remember({ row, column });
        }}
        onBlurCell={() => {
          setEditing(undefined);
        }}
      />
    );
  };

  return (
    <div
      ref={wrap}
      className={classes.wrap}
      onKeyDownCapture={range.onKeyDownCapture}
      onCopy={range.onCopy}
      onCut={range.onCut}
      onPaste={range.onPaste}
      onPointerMove={event => {
        range.onPointerMove(event);
        hovering.onMove(event);
      }}
      onPointerLeave={hovering.onLeave}
    >
      <TableGrid model={model} layout={layout} renderCell={cell} />
      <RangeOutline root={wrap} rect={range.active} />
      <TableGrips
        hover={drag === undefined ? hovering.hover : undefined}
        line={drag?.line}
        onPress={press}
      />
      <TableEdges
        onAddColumn={() => {
          write(addColumn(model));
          focus(-1, model.header.length, "start");
        }}
        onAddRow={() => {
          write(addRow(model));
          focus(model.rows.length, 0, "start");
        }}
      />
      <TableMenu
        model={model}
        layout={layout}
        spot={menu.spot}
        opened={menu.opened}
        range={menu.spot?.scope === undefined ? range.active : undefined}
        onClose={menu.close}
        onRemove={remove}
        onChange={(next, at) => {
          range.clear();
          write(next);
          if (at !== undefined) {
            focus(at.row, at.column, "start");
          }
        }}
      />
    </div>
  );
}
