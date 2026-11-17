// Text edits as plain data. One command works the same on the document, on
// the textarea of a table cell and in a test, with no browser involved.

export type Range = { from: number; to: number };

export type Change = { from: number; to: number; insert: string };

// `changes` use the positions of the old text, in order and apart from each
// other; the selection uses the positions of the new text.
export type Edit = { changes: Change[]; anchor: number; head: number };

// Reads the text and the selection and says what to change (or nothing).
export type Command = (text: string, selection: Range) => Edit | undefined;

// At an insertion exactly on a position: stay before it (-1) or after (1).
export type Side = 1 | -1;

export function applyEdit(text: string, edit: Edit): string {
  let out = text;
  for (const { from, to, insert } of [...edit.changes].reverse()) {
    out = out.slice(0, from) + insert + out.slice(to);
  }
  return out;
}

export function lineStart(text: string, pos: number): number {
  return pos <= 0 ? 0 : text.lastIndexOf("\n", pos - 1) + 1;
}

export function lineEnd(text: string, pos: number): number {
  const at = text.indexOf("\n", pos);
  return at < 0 ? text.length : at;
}

// The lines a selection touches. One that ends right after a line break does
// not take the next line.
export function linesOf(text: string, { from, to }: Range): Range {
  const last = to > from && text[to - 1] === "\n" ? to - 1 : to;
  return { from: lineStart(text, from), to: lineEnd(text, last) };
}

// Where a position of the old text is in the new one.
export function mapPos(changes: Change[], pos: number, side: Side): number {
  let delta = 0;
  for (const { from, to, insert } of changes) {
    if (to < pos) {
      delta += insert.length - (to - from);
    } else if (from > pos) {
      break;
    } else if (from === to) {
      delta += side > 0 ? insert.length : 0;
      break;
    } else if (pos === from) {
      break;
    } else {
      // Inside what was replaced: after what replaced it.
      return from + delta + insert.length;
    }
  }
  return pos + delta;
}

// An edit whose selection is the old one `from` to `to`, carried over.
export function makeEdit(
  changes: Change[],
  from: number,
  to: number,
  sides: [Side, Side] = [1, -1],
): Edit {
  return {
    changes,
    anchor: mapPos(changes, from, sides[0]),
    head: mapPos(changes, to, sides[1]),
  };
}
