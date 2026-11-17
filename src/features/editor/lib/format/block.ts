import { asTaskState, type TaskState } from "../tasks";
import { type Command, lineEnd, linesOf, makeEdit, type Range } from "./edit";

// What a line can be turned into.
export type Block =
  | { kind: "bullet" }
  | { kind: "number" }
  | { kind: "task"; state: TaskState }
  | { kind: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6 }
  | { kind: "quote" }
  | { kind: "plain" };

type Marker =
  | { kind: "heading"; level: number }
  | { kind: "bullet"; char: string; task: string | undefined }
  | { kind: "number" };

// A line taken apart: `  > - [ ] text` is an indent, a quote, a marker and
// the rest.
type Parts = {
  indent: string;
  quote: string;
  marker: Marker | undefined;
  markerText: string;
  rest: string;
};

const LEVELS = [1, 2, 3, 4, 5, 6] as const;
const LEAD = /^([ \t]*)((?:>[ \t]?)*)/;
const HEADING = /^(#{1,6})(?:[ \t]+|$)/;
const BULLET = /^([-*+])(?:[ \t]+|$)(?:\[(.)\](?:[ \t]+|$))?/;
const NUMBER = /^\d{1,9}[.)](?:[ \t]+|$)/;

function parse(line: string): Parts {
  const lead = LEAD.exec(line);
  const indent = lead?.[1] ?? "";
  const quote = lead?.[2] ?? "";
  const body = line.slice(indent.length + quote.length);
  const part = (marker: Marker | undefined, markerText: string): Parts => ({
    indent,
    quote,
    marker,
    markerText,
    rest: body.slice(markerText.length),
  });
  const heading = HEADING.exec(body);
  if (heading !== null) {
    return part(
      { kind: "heading", level: heading[1]?.length ?? 1 },
      heading[0],
    );
  }
  const bullet = BULLET.exec(body);
  if (bullet !== null) {
    const task = bullet[2]?.replace("X", "x");
    return part({ kind: "bullet", char: bullet[1] ?? "-", task }, bullet[0]);
  }
  const number = NUMBER.exec(body);
  return number === null
    ? part(undefined, "")
    : part({ kind: "number" }, number[0]);
}

// Is the line this block already?
function matches({ marker, quote }: Parts, block: Block): boolean {
  switch (block.kind) {
    case "bullet":
      return marker?.kind === "bullet" && marker.task === undefined;
    case "task":
      return marker?.kind === "bullet" && marker.task === block.state;
    case "number":
      return marker?.kind === "number";
    case "heading":
      return marker?.kind === "heading" && marker.level === block.level;
    case "quote":
      return quote !== "";
    default:
      return false;
  }
}

// The start of the line as it becomes `block`; `position` counts the lines
// being changed, for numbers.
function prefixFor(parts: Parts, block: Block, position: number): string {
  const { indent, quote, marker, markerText } = parts;
  switch (block.kind) {
    case "plain":
      return "";
    case "heading":
      return `${quote}${"#".repeat(block.level)} `;
    case "bullet":
      return `${indent}${quote}${marker?.kind === "bullet" ? marker.char : "-"} `;
    case "task":
      return `${indent}${quote}- [${block.state}] `;
    case "number":
      return `${indent}${quote}${position}. `;
    default:
      return `${indent}> ${quote}${markerText}`;
  }
}

// The start of the line with `block` taken off.
function without(parts: Parts, block: Block): string {
  const { indent, quote, markerText } = parts;
  return block.kind === "quote"
    ? `${indent}${quote.replace(/^>[ \t]?/, "")}${markerText}`
    : `${indent}${quote}`;
}

type Line = { from: number; text: string; parts: Parts };

function linesIn(text: string, from: number, to: number): Line[] {
  const found: Line[] = [];
  let at = from;
  while (at <= to) {
    const end = lineEnd(text, at);
    const line = text.slice(at, end);
    found.push({ from: at, text: line, parts: parse(line) });
    at = end + 1;
  }
  return found;
}

// Turns the selected lines into a list, a heading, a quote or plain text; the
// same again takes it off. Blank lines are left alone.
export function setBlock(block: Block): Command {
  return (text, sel) => {
    const range = linesOf(text, sel);
    const lines = linesIn(text, range.from, range.to);
    const filled = lines.filter(line => line.text.trim() !== "");
    const targets = filled.length > 0 ? filled : lines;
    const off =
      block.kind !== "plain" &&
      targets.every(line => matches(line.parts, block));
    const changes = targets.map((line, index) => ({
      from: line.from,
      to: line.from + line.text.length - line.parts.rest.length,
      insert: off
        ? without(line.parts, block)
        : prefixFor(line.parts, block, index + 1),
    }));
    // A caret stays after what is put in front of it.
    const side = sel.from === sel.to ? 1 : -1;
    return makeEdit(changes, sel.from, sel.to, [side, side]);
  };
}

// What the first selected line is: the block it can be switched off by, and
// whether it is quoted.
export function blockAt(
  text: string,
  sel: Range,
): { block: Block | undefined; quote: boolean } {
  const range = linesOf(text, sel);
  const parts = parse(text.slice(range.from, lineEnd(text, range.from)));
  const { marker } = parts;
  const quote = parts.quote !== "";
  if (marker?.kind === "heading") {
    const level = LEVELS.find(item => item === marker.level) ?? 1;
    return { block: { kind: "heading", level }, quote };
  }
  if (marker?.kind === "number") {
    return { block: { kind: "number" }, quote };
  }
  if (marker?.kind === "bullet") {
    return {
      block:
        marker.task === undefined
          ? { kind: "bullet" }
          : { kind: "task", state: asTaskState(marker.task) ?? " " },
      quote,
    };
  }
  return { block: undefined, quote };
}
