import type { Element, Root, RootContent } from "hast";

// Merged table cells, spreadsheet-style: a cell that holds only `^` joins the
// cell above it (rowspan), one that holds only `<` joins the cell to its left
// (colspan). A rehype plugin, so it works on the rendered table and leaves
// remark-gfm alone.
//
// The behaviour follows `rehype-extended-table` (MIT, `mergeTo: "left"`),
// which can't be used as is: it imports `node:assert`, which doesn't exist in
// the browser. This is a small typed rewrite of the same idea.
//
// Because it runs after markdown is parsed, `\^` and `\<` are already plain
// `^` and `<` by now, so a cell that really is just one of them can't be
// escaped. A `^` or `<` with nothing to merge into (first row or first
// column) is left as text.

type Cell = Element & { tagName: "td" | "th" };

function isElement(node: RootContent): node is Element {
  return node.type === "element";
}

function isCell(node: RootContent): node is Cell {
  return isElement(node) && (node.tagName === "td" || node.tagName === "th");
}

function isMark(cell: Cell, mark: string): boolean {
  const [only, ...rest] = cell.children;
  return (
    rest.length === 0 && only?.type === "text" && only.value.trim() === mark
  );
}

function span(cell: Cell, name: "colSpan" | "rowSpan"): number {
  const value = cell.properties[name];
  return typeof value === "number" ? value : 1;
}

function join(into: Cell, from: Cell, name: "colSpan" | "rowSpan"): void {
  into.properties[name] = span(into, name) + span(from, name);
}

function mergeSection(rows: Element[]): void {
  const grid = rows.map(row => row.children.filter(isCell));
  const gone = new Set<Cell>();

  // Right to left, so a run of `<` collects into the cell at its start.
  for (const cells of grid) {
    for (let at = cells.length - 1; at > 0; at -= 1) {
      const cell = cells[at];
      const left = cells[at - 1];
      if (cell !== undefined && left !== undefined && isMark(cell, "<")) {
        join(left, cell, "colSpan");
        gone.add(cell);
      }
    }
  }

  // Bottom to top, for the same reason. In a 2x2 block the `^` under the
  // merged-away cell just goes with it, and the `^` under the first cell gives
  // the block its second row.
  for (let row = grid.length - 1; row > 0; row -= 1) {
    grid[row]?.forEach((cell, at) => {
      const above = grid[row - 1]?.[at];
      if (above !== undefined && !gone.has(cell) && isMark(cell, "^")) {
        join(above, cell, "rowSpan");
        gone.add(cell);
      }
    });
  }

  for (const row of rows) {
    row.children = row.children.filter(
      child => !isCell(child) || !gone.has(child),
    );
  }
}

function visit(node: Root | Element): void {
  if (node.type === "element" && node.tagName === "table") {
    for (const section of node.children) {
      if (
        isElement(section) &&
        ["thead", "tbody", "tfoot"].includes(section.tagName)
      ) {
        mergeSection(
          section.children.filter(
            (row): row is Element => isElement(row) && row.tagName === "tr",
          ),
        );
      }
    }
  }
  for (const child of node.children) {
    if (isElement(child)) {
      visit(child);
    }
  }
}

export function rehypeTableMerge() {
  return (tree: Root) => {
    visit(tree);
  };
}
