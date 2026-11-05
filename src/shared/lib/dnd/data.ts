// Typed wrappers over pragmatic-drag-and-drop's untyped `data` bags.
type Bag = Record<string | symbol, unknown>;

export type ItemData = { kind: string; id: string; listId: string };

export function itemData(data: ItemData): Bag {
  return { sortable: true, ...data };
}

export function readItem(data: Bag): ItemData | undefined {
  const { sortable, kind, id, listId } = data;
  return sortable === true &&
    typeof kind === "string" &&
    typeof id === "string" &&
    typeof listId === "string"
    ? { kind, id, listId }
    : undefined;
}

export function listData(kind: string, listId: string): Bag {
  return { sortableList: true, kind, listId };
}

export type Axis = "vertical" | "horizontal";

// What a sortable item is doing. dragging: folded away out of its list while a
// clone follows the pointer. settling: dropped, back to full size but unseen
// until the clone has landed on it.
export type Phase = "idle" | "dragging" | "settling";

// How a dragged item folds away: its `size` along the list's axis shrinks to
// nothing and the list's `gap` is taken back through its end margin.
export type Collapse = { size: number; gap: number; shrunk: boolean };

// Size of a dragged item, taken as the drag starts: while it is dragged the
// item is lifted out of the layout and can no longer be measured.
export const liftedSize = new WeakMap<
  Element,
  { width: number; height: number }
>();

// A completed drag: `index` is the preview position in the target list's full
// item order; run it through `insertionIndex` before applying it.
export type SortableMove = {
  kind: string;
  id: string;
  fromListId: string;
  toListId: string;
  index: number;
};
