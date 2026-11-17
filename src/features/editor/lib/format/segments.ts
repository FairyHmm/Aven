import { lineEnd, linesOf, type Range } from "./edit";

// What comes before the text of a line: quote, list and task markers, `#`s.
const PREFIX =
  /^[ \t]*(?:>[ \t]*)*(?:(?:[-*+]|\d{1,9}[.)])[ \t]+(?:\[.\][ \t]+)?|#{1,6}[ \t]+)?/;
const WORD = /[\p{L}\p{N}_]/u;
const SPACE = /\s/;

function wordAround(text: string, pos: number): Range | undefined {
  let from = pos;
  let to = pos;
  while (from > 0 && WORD.test(text[from - 1] ?? "")) {
    from -= 1;
  }
  while (to < text.length && WORD.test(text[to] ?? "")) {
    to += 1;
  }
  return from < to ? { from, to } : undefined;
}

function trim(text: string, { from, to }: Range): Range {
  let start = from;
  let end = to;
  while (start < end && SPACE.test(text[start] ?? "")) {
    start += 1;
  }
  while (end > start && SPACE.test(text[end - 1] ?? "")) {
    end -= 1;
  }
  return { from: start, to: end };
}

// The pieces of text a format goes round: the word at the caret, or the text
// of each selected line (not its list or quote markers, not the blanks).
export function segments(text: string, sel: Range): Range[] {
  if (sel.from === sel.to) {
    const word = wordAround(text, sel.from);
    return word === undefined ? [] : [word];
  }
  const lines = linesOf(text, sel);
  const found: Range[] = [];
  let at = lines.from;
  while (at <= lines.to) {
    const end = lineEnd(text, at);
    const start = at + (PREFIX.exec(text.slice(at, end))?.[0].length ?? 0);
    const piece = trim(text, {
      from: Math.max(sel.from, start),
      to: Math.min(sel.to, end),
    });
    if (piece.from < piece.to) {
      found.push(piece);
    }
    at = end + 1;
  }
  return found;
}
