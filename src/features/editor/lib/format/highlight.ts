import {
  emojiOf,
  findHighlights,
  type Highlight,
  type Hue,
} from "../highlight/highlights";
import {
  type Change,
  type Command,
  lineEnd,
  lineStart,
  makeEdit,
  type Range,
} from "./edit";
import { segments } from "./segments";

function highlightAround(text: string, seg: Range): Highlight | undefined {
  const start = lineStart(text, seg.from);
  const line = text.slice(start, lineEnd(text, seg.from));
  return findHighlights(line, start).find(
    item => item.from <= seg.from && seg.to <= item.to,
  );
}

function unhighlight(item: Highlight): Change[] {
  return [
    {
      from: item.from,
      to: item.from + 2 + (item.emoji?.length ?? 0),
      insert: "",
    },
    { from: item.to - 2, to: item.to, insert: "" },
  ];
}

function recolor(item: Highlight, hue: Hue): Change[] {
  const from = item.from + 2;
  return [{ from, to: from + (item.emoji?.length ?? 0), insert: emojiOf(hue) }];
}

// Highlights the selection (each line of it) in a colour. Text that is
// highlighted already changes colour, and goes back to plain when it has that
// colour. With only a caret it is the word under it, or the highlight it is in.
export function toggleHighlight(hue: Hue): Command {
  const open = `==${emojiOf(hue)}`;
  return (text, sel) => {
    const found = segments(text, sel);
    const caret = sel.from === sel.to;
    if (found.length === 0 && !caret) {
      return undefined;
    }
    const pieces = found.length > 0 ? found : [{ from: sel.from, to: sel.to }];
    const hits = pieces.map(seg => ({ seg, hit: highlightAround(text, seg) }));
    if (found.length === 0 && hits[0]?.hit === undefined) {
      // Not on a word: a pair to type between.
      const at = sel.from + open.length;
      return {
        changes: [{ from: sel.from, to: sel.from, insert: `${open}==` }],
        anchor: at,
        head: at,
      };
    }
    const remove = hits.every(({ hit }) => hit?.hue === hue);
    const changes = hits.flatMap(({ seg, hit }): Change[] => {
      if (hit !== undefined) {
        return remove ? unhighlight(hit) : recolor(hit, hue);
      }
      if (text.slice(seg.from, seg.to).includes("==")) {
        return [];
      }
      return [
        { from: seg.from, to: seg.from, insert: open },
        { from: seg.to, to: seg.to, insert: "==" },
      ];
    });
    return makeEdit(
      changes,
      pieces[0]?.from ?? sel.from,
      pieces.at(-1)?.to ?? sel.to,
    );
  };
}

// The colour of the highlight the selection (or caret) is in, if it is in one.
export function hueAt(text: string, sel: Range): Hue | undefined {
  const [first] = segments(text, sel);
  return highlightAround(text, first ?? { from: sel.from, to: sel.to })?.hue;
}
