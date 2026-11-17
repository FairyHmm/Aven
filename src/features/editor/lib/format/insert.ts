import {
  applyEdit,
  type Command,
  type Edit,
  lineEnd,
  linesOf,
  lineStart,
  type Range,
} from "./edit";

type Built = { text: string; caret: number };

const FENCE = "```";
const blank = (line: string) => line.trim() === "";

// Is there text on the line before the position (a line start) / after it (a
// line end)?
const textBefore = (text: string, at: number) =>
  at > 0 && !blank(text.slice(lineStart(text, at - 1), at - 1));
const textAfter = (text: string, at: number) =>
  at < text.length && !blank(text.slice(at + 1, lineEnd(text, at + 1)));

type Options = {
  // Wrap the selected lines, instead of putting the block beside them.
  wrap: boolean;
  // The caret goes on a line of its own after the block, not into it. A table
  // shows as a grid only while the caret is outside its markdown.
  after?: boolean;
};

// Puts a block of its own in the text, with a blank line round it (a `---`
// right under a line would make that line a heading).
function place(
  text: string,
  sel: Range,
  build: (content: string) => Built,
  { wrap, after = false }: Options,
): Edit {
  const lines = linesOf(text, sel);
  const content = text.slice(lines.from, lines.to);
  const empty = blank(content);
  // A blank line, or the lines to wrap, are replaced; otherwise the block
  // goes after the line the caret is on.
  const replacing = empty || wrap;
  const from = replacing ? lines.from : lines.to;
  const lead = replacing ? (textBefore(text, from) ? "\n" : "") : "\n\n";
  const built = build(wrap && !empty ? content : "");
  const gap = textAfter(text, lines.to);
  const trail = gap || (after && lines.to >= text.length) ? "\n" : "";
  const end = from + lead.length + built.text.length;
  const caret = after ? end + 1 : from + lead.length + built.caret;
  return {
    changes: [{ from, to: lines.to, insert: `${lead}${built.text}${trail}` }],
    anchor: caret,
    head: caret,
  };
}

const TABLE = [
  "| Column 1 | Column 2 | Column 3 |",
  "| --- | --- | --- |",
  "|  |  |  |",
  "|  |  |  |",
].join("\n");

export const insertTable: Command = (text, sel) =>
  place(text, sel, () => ({ text: TABLE, caret: TABLE.length }), {
    wrap: false,
    after: true,
  });

export const insertRule: Command = (text, sel) =>
  place(text, sel, () => ({ text: "---", caret: 3 }), {
    wrap: false,
    after: true,
  });

export const insertCodeBlock: Command = (text, sel) =>
  place(
    text,
    sel,
    content =>
      content === ""
        ? { text: `${FENCE}\n\n${FENCE}`, caret: FENCE.length + 1 }
        : { text: `${FENCE}\n${content}\n${FENCE}`, caret: FENCE.length },
    { wrap: true },
  );

export const insertMathBlock: Command = (text, sel) =>
  place(
    text,
    sel,
    content => {
      const block = `$$\n${content}\n$$`;
      return { text: block, caret: content === "" ? 3 : block.length };
    },
    { wrap: true },
  );

// `> [!type]` and the selected lines (or an empty one) quoted under it.
export function insertCallout(type: string): Command {
  const head = `> [!${type}]`;
  return (text, sel) =>
    place(
      text,
      sel,
      content => {
        if (content === "") {
          return { text: `${head}\n> `, caret: head.length + 3 };
        }
        const body = content
          .split("\n")
          .map(line => (line === "" ? ">" : `> ${line}`))
          .join("\n");
        return { text: `${head}\n${body}`, caret: head.length };
      },
      { wrap: true },
    );
}

const REFERENCE = /\[\^(\d+)\]/g;
const DEFINITION = /^\[\^[^\]]+\]:/;

// `[^n]` after the selection and `[^n]: ` at the end of the text, with the
// caret there to write the note.
export const insertFootnote: Command = (text, sel) => {
  const used = [...text.matchAll(REFERENCE)].map(found => Number(found[1]));
  const label = Math.max(0, ...used) + 1;
  const marker = `[^${label}]`;
  const body = text.trimEnd();
  const lastLine = body.slice(lineStart(body, body.length));
  const joiner = DEFINITION.test(lastLine) ? "\n" : "\n\n";
  const definition = `${joiner}[^${label}]: `;
  const at = Math.min(sel.to, body.length);
  const changes =
    at >= body.length
      ? [{ from: body.length, to: text.length, insert: marker + definition }]
      : [
          { from: at, to: at, insert: marker },
          { from: body.length, to: text.length, insert: definition },
        ];
  const end = applyEdit(text, { changes, anchor: 0, head: 0 }).length;
  return { changes, anchor: end, head: end };
};
