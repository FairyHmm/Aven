import { asTaskState } from "../../../editor/lib/tasks";

// How far a card's task boxes are: `done` of `total`. Each counted box is
// worth: checked 1, in progress half, unchecked 0. Important and question
// boxes are marks in the notes, not work to do, and rescheduled, scheduled,
// cancelled and note boxes are not either: none of them count at all, not even
// in the total. Code fences are skipped.
export type Progress = { done: number; total: number };

const WEIGHT: Partial<Record<string, number>> = {
  " ": 0,
  "/": 0.5,
  x: 1,
};

const FENCE = /^\s*(?:>\s*)*(```|~~~)/;
const TASK = /^\s*(?:>\s*)*(?:[-*+]|\d{1,9}[.)])[ \t]+\[(.)\](?=\s|$)/;

export function progressOf(body: string): Progress {
  let done = 0;
  let total = 0;
  let fence = "";
  for (const line of body.split("\n")) {
    const mark = FENCE.exec(line)?.[1];
    if (mark !== undefined) {
      fence = fence === "" ? mark : fence === mark ? "" : fence;
      continue;
    }
    if (fence !== "") {
      continue;
    }
    const state = asTaskState(TASK.exec(line)?.[1]);
    const weight = state === undefined ? undefined : WEIGHT[state];
    if (weight === undefined) {
      continue;
    }
    total += 1;
    done += weight;
  }
  return { done, total };
}
