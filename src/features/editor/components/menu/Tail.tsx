import { Check } from "lucide-react";

import classes from "./menu.module.css";

type Props = {
  // A check: this is what the text is now.
  on?: boolean | undefined;
  // The keys that do it.
  hint?: string | undefined;
};

// The end of a menu item: its shortcut, and a check when it is the case now.
export function Tail({ on = false, hint }: Props) {
  if (!on && hint === undefined) {
    return null;
  }
  return (
    <span className={classes.tail}>
      {hint === undefined ? null : <span className={classes.hint}>{hint}</span>}
      {on ? <Check size={14} /> : null}
    </span>
  );
}
