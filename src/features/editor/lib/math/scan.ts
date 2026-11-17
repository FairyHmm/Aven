// Where the maths is in a text: `$x$` in a line, and `$$` … `$$` as a block.

export type MathSpan = {
  from: number;
  to: number;
  tex: string;
  // On a line of its own, centred.
  display: boolean;
};

// `$$x$$`, or `$x$` with no blank inside against the dollars and no digit
// right after (so "$5 and $6" is money).
const INLINE =
  /\$\$([^$\n]+?)\$\$|\$(?=\S)((?:\\.|[^$\\\n])+?)(?<=\S)\$(?!\d)/g;

// The maths in one line (not in code, and not a block), positions counted from
// `offset`. `isCode` says whether a position is in code.
export function inlineMath(
  line: string,
  offset: number,
  isCode: (pos: number) => boolean,
): MathSpan[] {
  const found: MathSpan[] = [];
  for (const match of line.matchAll(INLINE)) {
    const from = offset + match.index;
    const tex = (match[1] ?? match[2] ?? "").trim();
    if (tex !== "" && !isCode(from)) {
      found.push({
        from,
        to: from + match[0].length,
        tex,
        display: match[1] !== undefined,
      });
    }
  }
  return found;
}

// The `$$` blocks of a text: a line starting with `$$`, up to the line that
// ends with `$$` (the same line for `$$ x $$`). One that never closes is not a
// block.
export function mathBlocks(
  text: string,
  isCode: (pos: number) => boolean,
): MathSpan[] {
  const blocks: MathSpan[] = [];
  const lines = text.split("\n");
  const starts: number[] = [];
  let at = 0;
  for (const line of lines) {
    starts.push(at);
    at += line.length + 1;
  }
  for (let index = 0; index < lines.length; index += 1) {
    const first = lines[index]?.trim() ?? "";
    const start = starts[index] ?? 0;
    if (!first.startsWith("$$") || isCode(start)) {
      continue;
    }
    for (let end = index; end < lines.length; end += 1) {
      const last = lines[end]?.trim() ?? "";
      const closes =
        end === index
          ? first.length > 3 && first.endsWith("$$")
          : last.endsWith("$$");
      if (closes) {
        const to = (starts[end] ?? 0) + (lines[end]?.length ?? 0);
        const inner = text.slice(start, to).trim().slice(2, -2).trim();
        if (inner !== "") {
          blocks.push({ from: start, to, tex: inner, display: true });
        }
        index = end;
        break;
      }
    }
  }
  return blocks;
}
