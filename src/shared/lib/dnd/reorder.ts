// Pure maths shared by every sortable list (cards in a column, columns in a
// lane, boards in the sidebar).

// Where the pointer is, relative to the midpoints of the list's items:
// the index the dragged item would be inserted at (items.length = the end).
export function dropIndex(
  pointer: number,
  slots: readonly { mid: number }[],
): number {
  const found = slots.findIndex(slot => pointer < slot.mid);
  return found === -1 ? slots.length : found;
}

// A preview index counts the dragged item itself when it is in the same list.
// This converts it to an index in the list *without* the dragged item, which
// is where it will actually be inserted.
export function insertionIndex(
  ids: readonly string[],
  movingId: string,
  index: number,
): number {
  const from = ids.indexOf(movingId);
  const adjusted = from !== -1 && from < index ? index - 1 : index;
  const length = from === -1 ? ids.length : ids.length - 1;
  return Math.max(0, Math.min(adjusted, length));
}

// Where a list item sits relative to the open gap. `from` is the position of
// the dragged item in this same list (-1 if it comes from elsewhere). That
// item is lifted out of the layout while dragged, so it takes no room and the
// items after it count one position earlier.
export function gapBefore(
  target: { index: number; from?: number },
  index: number,
  count: number,
): { before: boolean; after: boolean } {
  const from = target.from ?? -1;
  const lifted = from !== -1;
  const slot = lifted && target.index > from ? target.index - 1 : target.index;
  const mine = lifted && index > from ? index - 1 : index;
  const visible = lifted ? count - 1 : count;
  return {
    before: slot === mine,
    after: visible > 0 && mine === visible - 1 && slot === visible,
  };
}
