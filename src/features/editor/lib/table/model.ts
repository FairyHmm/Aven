// A markdown table as data, so a visual editor can change it and write it
// back as the same kind of pipe table.

export type Align = "none" | "left" | "center" | "right";

export type TableModel = {
  header: string[];
  align: Align[];
  rows: string[][];
};

const DELIMITER = /^:?-+:?$/;

// Cells of one row: the outer pipes are optional, `\|` is a pipe in the text.
function splitRow(line: string): string[] {
  const text = line
    .trim()
    .replace(/^\|/, "")
    .replace(/(?<!\\)\|$/, "");
  return text.split(/(?<!\\)\|/).map(cell =>
    cell
      .trim()
      .replaceAll("\\|", "|")
      .replaceAll(/<br\s*\/?>/gi, "\n"),
  );
}

function alignOf(cell: string): Align {
  const left = cell.startsWith(":");
  const right = cell.endsWith(":");
  if (left && right) {
    return "center";
  }
  return left ? "left" : right ? "right" : "none";
}

const fit = (cells: string[], width: number) =>
  Array.from({ length: width }, (_, index) => cells[index] ?? "");

export function parseTable(source: string): TableModel | undefined {
  const lines = source.split("\n").filter(line => line.trim() !== "");
  const [head, rule, ...body] = lines;
  if (head === undefined || rule === undefined) {
    return undefined;
  }
  const header = splitRow(head);
  const marks = splitRow(rule);
  if (marks.length === 0 || !marks.every(mark => DELIMITER.test(mark))) {
    return undefined;
  }
  return {
    header,
    align: fit(marks, header.length).map(mark =>
      mark === "" ? "none" : alignOf(mark),
    ),
    rows: body.map(line => fit(splitRow(line), header.length)),
  };
}

// A line break inside a cell is `<br>`, as in Obsidian.
const escape = (cell: string) =>
  cell.replaceAll("|", "\\|").replaceAll("\n", "<br>");

const RULE: Record<Align, string> = {
  none: "---",
  left: ":--",
  center: ":-:",
  right: "--:",
};

export function serializeTable(model: TableModel): string {
  const row = (cells: string[]) => `| ${cells.map(escape).join(" | ")} |`;
  return [
    row(model.header),
    `| ${model.align.map(align => RULE[align]).join(" | ")} |`,
    ...model.rows.map(row),
  ].join("\n");
}

// `row` -1 is the header.
export function setCell(
  model: TableModel,
  row: number,
  column: number,
  value: string,
): TableModel {
  const put = (cells: string[]) =>
    cells.map((cell, index) => (index === column ? value : cell));
  return row < 0
    ? { ...model, header: put(model.header) }
    : {
        ...model,
        rows: model.rows.map((cells, index) =>
          index === row ? put(cells) : cells,
        ),
      };
}

// `row` -1 is the header.
export const rowOf = (model: TableModel, row: number): string[] | undefined =>
  row < 0 ? model.header : model.rows[row];

export const valueAt = (model: TableModel, row: number, column: number) =>
  rowOf(model, row)?.[column] ?? "";

// The same change to the header, the alignments and every row: for what is
// done to a column.
export const mapColumns = (
  model: TableModel,
  change: <T>(cells: T[]) => T[],
): TableModel => ({
  header: change(model.header),
  align: change(model.align),
  rows: model.rows.map(row => change(row)),
});

export function addRow(model: TableModel, at = model.rows.length): TableModel {
  const blank = model.header.map(() => "");
  return {
    ...model,
    rows: [...model.rows.slice(0, at), blank, ...model.rows.slice(at)],
  };
}

export function removeRow(model: TableModel, at: number): TableModel {
  return { ...model, rows: model.rows.filter((_, index) => index !== at) };
}

export function addColumn(
  model: TableModel,
  at = model.header.length,
): TableModel {
  const put = (cells: string[], value: string) => [
    ...cells.slice(0, at),
    value,
    ...cells.slice(at),
  ];
  return {
    header: put(model.header, ""),
    align: [...model.align.slice(0, at), "none", ...model.align.slice(at)],
    rows: model.rows.map(cells => put(cells, "")),
  };
}

// The last column cannot be removed: a table without columns is not one.
export function removeColumn(model: TableModel, at: number): TableModel {
  if (model.header.length <= 1) {
    return model;
  }
  return mapColumns(model, cells => cells.filter((_, index) => index !== at));
}

export function setAlign(
  model: TableModel,
  column: number,
  align: Align,
): TableModel {
  return {
    ...model,
    align: model.align.map((current, index) =>
      index === column ? align : current,
    ),
  };
}

// Where an item ends up when it is put back before position `to` of the list
// as it was (so `to` is where a drop preview points, 0 to length).
export const landing = (from: number, to: number) => (to > from ? to - 1 : to);

// Takes the item at `from` out and puts it back before position `to`.
function reorder<T>(items: T[], from: number, to: number): T[] {
  const moving = items[from];
  if (moving === undefined) {
    return items;
  }
  const rest = items.filter((_, index) => index !== from);
  const at = landing(from, to);
  return [...rest.slice(0, at), moving, ...rest.slice(at)];
}

export function moveRow(model: TableModel, from: number, to: number) {
  return { ...model, rows: reorder(model.rows, from, to) };
}

export function moveColumn(
  model: TableModel,
  from: number,
  to: number,
): TableModel {
  return mapColumns(model, cells => reorder(cells, from, to));
}
