import { isMergeMark, MERGE_LEFT, type MergeMark, MERGE_UP } from "./marks";
import { type TableModel } from "./model";

// Merged cells as the editor draws them, by the same rules as the read view
// (`merge.ts`): a cell holding only `^` joins the cell above it, one
// holding only `<` joins the cell on its left. The header and the body are
// separate sections, so a `^` in the first body row has nothing to join.

export type Span = { colSpan: number; rowSpan: number };

export type Layout = {
  // How far the cell at this place reaches (1 and 1 for a plain cell).
  span: (row: number, column: number) => Span;
  // The cell that shows the one at this place: itself, or what it is merged
  // into.
  shownBy: (row: number, column: number) => { row: number; column: number };
  // A cell that is only a marker, drawn as part of another.
  hidden: (row: number, column: number) => boolean;
};

type Place = { row: number; column: number };

const key = (row: number, column: number) => `${row}:${column}`;

// `exempt` is a cell being typed in: it stays as plain text until the caret
// leaves it, so typing `^` does not make the cell vanish under the caret.
export function layoutOf(model: TableModel, exempt?: Place): Layout {
  const spans = new Map<string, Span>();
  const gone = new Set<string>();
  const shown = new Map<string, Place>();

  // Row -1 is the header, a section of its own.
  const sections: { first: number; rows: string[][] }[] = [
    { first: -1, rows: [model.header] },
    { first: 0, rows: model.rows },
  ];
  for (const { first, rows } of sections) {
    const isMark = (row: number, column: number, mark: MergeMark) =>
      !(exempt?.row === first + row && exempt.column === column) &&
      isMergeMark(rows[row]?.[column] ?? "", mark);
    const spanAt = (row: number, column: number) =>
      spans.get(key(first + row, column)) ?? { colSpan: 1, rowSpan: 1 };
    const join = (into: Place, from: Place, name: keyof Span) => {
      const target = spanAt(into.row, into.column);
      const added = spanAt(from.row, from.column)[name];
      spans.set(key(first + into.row, into.column), {
        ...target,
        [name]: target[name] + added,
      });
      gone.add(key(first + from.row, from.column));
    };
    // Right to left, so a run of `<` collects into the cell at its start.
    rows.forEach((cells, row) => {
      for (let column = cells.length - 1; column > 0; column -= 1) {
        if (isMark(row, column, MERGE_LEFT)) {
          join({ row, column: column - 1 }, { row, column }, "colSpan");
        }
      }
    });
    // Bottom to top, for the same reason.
    for (let row = rows.length - 1; row > 0; row -= 1) {
      rows[row]?.forEach((_, column) => {
        if (
          !gone.has(key(first + row, column)) &&
          isMark(row, column, MERGE_UP)
        ) {
          join({ row: row - 1, column }, { row, column }, "rowSpan");
        }
      });
    }
    // Every place a visible cell reaches is shown by that cell.
    rows.forEach((cells, row) => {
      cells.forEach((_, column) => {
        const id = key(first + row, column);
        if (gone.has(id)) {
          return;
        }
        const { colSpan, rowSpan } = spanAt(row, column);
        for (let down = 0; down < rowSpan; down += 1) {
          for (let across = 0; across < colSpan; across += 1) {
            shown.set(key(first + row + down, column + across), {
              row: first + row,
              column,
            });
          }
        }
      });
    });
  }

  return {
    span: (row, column) =>
      spans.get(key(row, column)) ?? { colSpan: 1, rowSpan: 1 },
    shownBy: (row, column) => shown.get(key(row, column)) ?? { row, column },
    hidden: (row, column) => gone.has(key(row, column)),
  };
}

// Whether the cell at this place is a merged cell, or part of one.
export function isMerged(layout: Layout, row: number, column: number) {
  const at = layout.shownBy(row, column);
  const { colSpan, rowSpan } = layout.span(at.row, at.column);
  return colSpan > 1 || rowSpan > 1;
}

// Takes the merge markers out of the merged cell at this place, so its cells
// are plain and empty again. The cell's own text stays where it is.
export function unmerge(
  model: TableModel,
  layout: Layout,
  row: number,
  column: number,
): TableModel {
  const origin = layout.shownBy(row, column);
  const { colSpan, rowSpan } = layout.span(origin.row, origin.column);
  const covered = (r: number, c: number) =>
    r >= origin.row &&
    r < origin.row + rowSpan &&
    c >= origin.column &&
    c < origin.column + colSpan &&
    (r !== origin.row || c !== origin.column);
  const clear = (cells: string[], r: number) =>
    cells.map((cell, c) => (covered(r, c) && isMergeMark(cell) ? "" : cell));
  return {
    ...model,
    header: clear(model.header, -1),
    rows: model.rows.map((cells, r) => clear(cells, r)),
  };
}
