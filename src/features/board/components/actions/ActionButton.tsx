import type { ComponentPropsWithRef, ReactNode } from "react";

import classes from "./action.module.css";

type Action = Omit<ComponentPropsWithRef<"button">, "children"> & {
  label: string;
  icon?: ReactNode;
  // The hotkey, shown while the pointer or focus is on the button.
  hint?: string;
  // An error container instead of the brand tone.
  danger?: boolean;
  // The main action of a place (Save): the brand colour itself.
  filled?: boolean;
  // The small, content-wide size of a row of buttons; otherwise the button
  // fills the width it is given, as in a menu.
  compact?: boolean;
};

// The one look of the card's actions, in the quick-edit menu and on the card
// back: a tonal button (a tint of the brand colour over the dark surface)
// whose corners tighten under the pointer and again when pressed, with a
// state layer, as in Material You. It takes a `ref` and the rest of a
// button's props, so a popover can anchor to it.
export function ActionButton({
  label,
  icon,
  hint,
  danger,
  filled,
  compact,
  className,
  ...rest
}: Action) {
  return (
    <button
      type="button"
      // A popover that anchors to it adds a class of its own.
      className={[classes.action, className].filter(Boolean).join(" ")}
      data-danger={danger === true ? "" : undefined}
      data-compact={compact === true ? "" : undefined}
      data-filled={filled === true ? "" : undefined}
      {...rest}
    >
      {icon}
      <span className={classes.label}>{label}</span>
      {hint !== undefined && <kbd className={classes.hint}>{hint}</kbd>}
    </button>
  );
}
