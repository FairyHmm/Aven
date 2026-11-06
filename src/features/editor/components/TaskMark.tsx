import {
  Calendar,
  Check,
  CircleQuestionMark,
  Minus,
  Pin,
  SendHorizontal,
  Star,
} from "lucide-react";
import type { ReactNode } from "react";

import type { TaskState } from "../lib/tasks";

// The four round states carry a small glyph inside their circle (in progress
// is drawn by the CSS alone). Every other state is just a filled icon that
// fills the whole box, so there is no border and no inner padding to align.
const FILLED = {
  size: "100%",
  fill: "currentColor",
  strokeWidth: 2,
  strokeLinejoin: "round",
} as const;

const ICONS: Record<TaskState, ReactNode> = {
  " ": null,
  x: <Check size={12} strokeWidth={3} />,
  "-": <Minus size={12} strokeWidth={3} />,
  "/": null,
  ">": <SendHorizontal {...FILLED} />,
  "<": <Calendar {...FILLED} />,
  "!": <Star {...FILLED} />,
  "?": <CircleQuestionMark {...FILLED} />,
  n: <Pin {...FILLED} />,
};

export function TaskMark({ state }: { state: TaskState }) {
  return <>{ICONS[state]}</>;
}
