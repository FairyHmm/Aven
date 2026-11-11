import { SquareCheck } from "lucide-react";

import { progressOf } from "../../lib/props/progress";

import classes from "./cardProps.module.css";

// `3/7` and a thin bar for the card's task boxes, on a tile that has progress
// switched on. Nothing for a card without boxes.
export function ProgressBadge({ body }: { body: string }) {
  const { done, total } = progressOf(body);
  // In progress boxes make halves: 2.5, not 2.5000000001.
  const shown = String(Math.round(done * 10) / 10);
  if (total === 0) {
    return null;
  }
  return (
    <span
      className={classes.progress}
      data-complete={done === total ? "" : undefined}
      title={`${shown} of ${total} done`}
    >
      <SquareCheck size={12} aria-hidden />
      {shown}/{total}
      <span className={classes.track} aria-hidden>
        <span
          className={classes.fill}
          style={{ width: `${(done / total) * 100}%` }}
        />
      </span>
    </span>
  );
}
