import type { Hue } from "../highlight/highlights";
import { type Block, blockAt } from "./block";
import type { Range } from "./edit";
import { hueAt } from "./highlight";
import { isMarked, type Mark } from "./inline";

const MARKS: Mark[] = ["bold", "italic", "strike", "code", "math"];

// What the selection (or the caret) is now, for the checkmarks of the menus.
export type Active = {
  marks: Mark[];
  hue: Hue | undefined;
  block: Block | undefined;
  quote: boolean;
};

export function activeAt(text: string, sel: Range): Active {
  return {
    marks: MARKS.filter(mark => isMarked(text, sel, mark)),
    hue: hueAt(text, sel),
    ...blockAt(text, sel),
  };
}
