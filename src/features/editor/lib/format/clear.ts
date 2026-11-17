import { HUES } from "../highlight/highlights";
import {
  type Change,
  type Command,
  lineEnd,
  linesOf,
  lineStart,
  makeEdit,
  type Range,
} from "./edit";
import { segments } from "./segments";

const CIRCLES = HUES.map(item => item.emoji).join("|");

// Each rule takes one kind of mark off: the marks go, the text stays.
const RULES: RegExp[] = [
  new RegExp(
    `==(?:${CIRCLES})?(?![\\s=])((?:(?!==)[^\\n])+?)(?<![\\s=])==`,
    "gu",
  ),
  /(\*\*|__|~~)(?=\S)(.+?)(?<=\S)\1/gu,
  /\*(?=\S)([^*\n]+?)(?<=\S)\*/gu,
  /(?<!\w)_(?=\S)([^_\n]+?)(?<=\S)_(?!\w)/gu,
  /`([^`\n]+)`/gu,
];

const REPLACEMENTS = ["$1", "$2", "$1", "$1", "$1"];

// The text without bold, italic, strikethrough, highlight and code marks.
export function stripMarks(value: string): string {
  let out = value;
  for (let round = 0; round < 3; round += 1) {
    const before = out;
    RULES.forEach((rule, index) => {
      out = out.replace(rule, REPLACEMENTS[index] ?? "$1");
    });
    if (out === before) {
      break;
    }
  }
  return out;
}

const EDGE = new RegExp(`(?:[*_~=\`]|${CIRCLES})+$`, "u");

// A piece that has only part of a mark in it takes the rest of the mark too.
function widen(text: string, seg: Range): Range {
  const before = text.slice(lineStart(text, seg.from), seg.from);
  const after = text.slice(seg.to, lineEnd(text, seg.to));
  return {
    from: seg.from - (EDGE.exec(before)?.[0].length ?? 0),
    to: seg.to + (/^[*_~=`]+/.exec(after)?.[0].length ?? 0),
  };
}

// Takes bold, italic, strikethrough, highlight and code off the selection; with
// only a caret, off the line.
export const clearFormat: Command = (text, sel) => {
  let pieces: Range[];
  if (sel.from === sel.to) {
    const line = linesOf(text, sel);
    pieces = segments(text, line);
  } else {
    pieces = segments(text, sel).map(seg => widen(text, seg));
  }
  const changes: Change[] = [];
  for (const seg of pieces) {
    const old = text.slice(seg.from, seg.to);
    const next = stripMarks(old);
    if (next !== old) {
      changes.push({ from: seg.from, to: seg.to, insert: next });
    }
  }
  const first = pieces[0];
  const last = pieces.at(-1);
  if (changes.length === 0 || first === undefined || last === undefined) {
    return undefined;
  }
  return makeEdit(changes, first.from, last.to);
};
