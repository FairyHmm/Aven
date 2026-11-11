import { insertionIndex } from "../../../shared/lib/dnd/reorder";
import { newId } from "./id";
import { byOrder, keyAtIndex } from "./order";
import { patchOf } from "./patch";
import { splitCard } from "./text";
import {
  ACCENTS,
  type Accent,
  type BoardData,
  type BoardPatch,
  type Card,
  type Column,
  type Props,
} from "./types";

// Pure mutations: each takes the current board and returns the patch that
// performs the change. The store applies the patch and persists it.

export function sortedColumns(data: Pick<BoardData, "columns">): Column[] {
  return [...data.columns].sort(byOrder);
}

export function cardsOf(
  data: Pick<BoardData, "cards">,
  columnId: string,
): Card[] {
  return data.cards.filter(card => card.columnId === columnId).sort(byOrder);
}

export function addColumn(data: BoardData, name: string): BoardPatch {
  const label = name.trim();
  if (label === "") {
    return patchOf();
  }
  const columns = sortedColumns(data);
  return patchOf({
    columns: [
      {
        id: newId(),
        name: label,
        accent: ACCENTS[columns.length % ACCENTS.length],
        order: keyAtIndex(columns, columns.length),
      },
    ],
  });
}

function changeColumn(
  data: BoardData,
  id: string,
  change: Partial<Pick<Column, "name" | "accent">>,
): BoardPatch {
  const column = data.columns.find(item => item.id === id);
  return column === undefined
    ? patchOf()
    : patchOf({ columns: [{ ...column, ...change }] });
}

export function renameColumn(
  data: BoardData,
  id: string,
  name: string,
): BoardPatch {
  const label = name.trim();
  return label === "" ? patchOf() : changeColumn(data, id, { name: label });
}

export function recolorColumn(
  data: BoardData,
  id: string,
  accent: Accent,
): BoardPatch {
  return changeColumn(data, id, { accent });
}

export function removeColumn(data: BoardData, id: string): BoardPatch {
  return patchOf({
    removeColumns: [id],
    removeCards: cardsOf(data, id).map(card => card.id),
  });
}

// First line becomes the title, anything after it the markdown body; the
// properties start empty and are set with the property controls.
export function addCard(
  data: BoardData,
  columnId: string,
  text: string,
  now = Date.now(),
): BoardPatch {
  const { title, body } = splitCard(text.trim());
  if (title === "") {
    return patchOf();
  }
  const siblings = cardsOf(data, columnId);
  return patchOf({
    cards: [
      {
        id: newId(),
        columnId,
        title,
        props: {},
        body,
        order: keyAtIndex(siblings, siblings.length),
        createdAt: now,
        updatedAt: now,
      },
    ],
  });
}

export function editCard(
  data: BoardData,
  id: string,
  changes: { title: string; body: string; props?: Props | undefined },
  now = Date.now(),
): BoardPatch {
  const card = data.cards.find(item => item.id === id);
  if (card === undefined) {
    return patchOf();
  }
  const title = changes.title.trim();
  return patchOf({
    cards: [
      {
        ...card,
        title: title === "" ? "Untitled" : title,
        // Callers that only touch the text (a ticked task) leave them be.
        props: changes.props ?? card.props,
        body: changes.body,
        updatedAt: now,
      },
    ],
  });
}

export function removeCard(id: string): BoardPatch {
  return patchOf({ removeCards: [id] });
}

// `index` is the drop preview position in the target list's full order (it
// still counts the moved item when the list is its own). Only the moved item
// is rewritten thanks to fractional order keys.
export function moveCard(
  data: BoardData,
  id: string,
  toColumnId: string,
  index: number,
): BoardPatch {
  const card = data.cards.find(item => item.id === id);
  if (card === undefined || !data.columns.some(c => c.id === toColumnId)) {
    return patchOf();
  }
  const column = cardsOf(data, toColumnId);
  const at = insertionIndex(
    column.map(item => item.id),
    id,
    index,
  );
  if (card.columnId === toColumnId && column.indexOf(card) === at) {
    return patchOf();
  }
  const others = column.filter(item => item.id !== id);
  return patchOf({
    cards: [{ ...card, columnId: toColumnId, order: keyAtIndex(others, at) }],
  });
}

export function moveColumn(
  data: BoardData,
  id: string,
  index: number,
): BoardPatch {
  const columns = sortedColumns(data);
  const column = columns.find(item => item.id === id);
  if (column === undefined) {
    return patchOf();
  }
  const at = insertionIndex(
    columns.map(item => item.id),
    id,
    index,
  );
  if (columns.indexOf(column) === at) {
    return patchOf();
  }
  const others = columns.filter(item => item.id !== id);
  return patchOf({ columns: [{ ...column, order: keyAtIndex(others, at) }] });
}
