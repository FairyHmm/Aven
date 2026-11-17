import { type Change, type Command, makeEdit, type Range } from "./edit";
import { segments } from "./segments";

// Marks written round a piece of text: `**bold**`, `*italic*`, `~~strike~~`,
// `code` and `$math$`.
export type Mark = "bold" | "italic" | "strike" | "code" | "math";

const MARKS: Record<Mark, { char: string; size: number }> = {
  bold: { char: "*", size: 2 },
  italic: { char: "*", size: 1 },
  strike: { char: "~", size: 2 },
  code: { char: "`", size: 1 },
  math: { char: "$", size: 1 },
};

// How many `char`s there are in a row, starting at `from` and going on (1) or
// back (-1).
function run(text: string, char: string, from: number, step: 1 | -1): number {
  let count = 0;
  while (text[step === 1 ? from + count : from - 1 - count] === char) {
    count += 1;
  }
  return count;
}

// A selection that holds the marks itself (`**bold**`) is the text inside.
function core(text: string, seg: Range, char: string): Range {
  const room = Math.floor((seg.to - seg.from - 1) / 2);
  const inside = Math.min(
    run(text, char, seg.from, 1),
    run(text, char, seg.to, -1),
    room,
  );
  return inside > 0 ? { from: seg.from + inside, to: seg.to - inside } : seg;
}

// Is the piece already inside this mark? Bold and italic share the star, so
// `**x**` is bold only, and `***x***` is both.
function covered(text: string, seg: Range, mark: Mark): boolean {
  const { char, size } = MARKS[mark];
  const around = Math.min(
    run(text, char, seg.from, -1),
    run(text, char, seg.to, 1),
  );
  return mark === "italic" ? around % 2 === 1 : around >= size;
}

const wrap = (seg: Range, marker: string): Change[] => [
  { from: seg.from, to: seg.from, insert: marker },
  { from: seg.to, to: seg.to, insert: marker },
];

const unwrap = (seg: Range, size: number): Change[] => [
  { from: seg.from - size, to: seg.from, insert: "" },
  { from: seg.to, to: seg.to + size, insert: "" },
];

// Puts a mark round the selection (each line of it), or takes it off when
// everything is marked already. With only a caret it is the word under it.
export function toggleMark(mark: Mark): Command {
  const { char, size } = MARKS[mark];
  const marker = char.repeat(size);
  return (text, sel) => {
    const pieces = segments(text, sel).map(seg => core(text, seg, char));
    const first = pieces[0];
    const last = pieces.at(-1);
    if (first === undefined || last === undefined) {
      if (sel.from !== sel.to) {
        return undefined;
      }
      // Not on a word: a pair to type between.
      const caret = sel.from + size;
      const insert = marker + marker;
      return {
        changes: [{ from: sel.from, to: sel.from, insert }],
        anchor: caret,
        head: caret,
      };
    }
    const marked = pieces.map(seg => covered(text, seg, mark));
    const remove = marked.every(Boolean);
    const changes = pieces.flatMap((seg, index) => {
      if (remove) {
        return unwrap(seg, size);
      }
      return marked[index] === true ? [] : wrap(seg, marker);
    });
    return makeEdit(changes, first.from, last.to);
  };
}

// Is everything selected (or the word at the caret) inside this mark?
export function isMarked(text: string, sel: Range, mark: Mark): boolean {
  const { char } = MARKS[mark];
  const pieces = segments(text, sel).map(seg => core(text, seg, char));
  return pieces.length > 0 && pieces.every(seg => covered(text, seg, mark));
}
