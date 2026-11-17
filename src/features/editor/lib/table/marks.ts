// Merge markers: a cell holding only one of these joins its neighbour.
export const MERGE_UP = "^";
export const MERGE_LEFT = "<";
export type MergeMark = typeof MERGE_UP | typeof MERGE_LEFT;

// Whether a cell's text is a merge marker (either kind, or `only` one).
export const isMergeMark = (value: string, only?: MergeMark) => {
  const text = value.trim();
  return only === undefined
    ? text === MERGE_UP || text === MERGE_LEFT
    : text === only;
};
