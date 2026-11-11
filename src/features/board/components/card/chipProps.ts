import type { KeyboardEvent, MouseEvent } from "react";

// A chip that is clicked for something of its own: the click is not the
// card's (which opens it).
export function pressable(act: () => void) {
  return {
    role: "button",
    tabIndex: 0,
    "data-pressable": "",
    onClick: (event: MouseEvent) => {
      event.stopPropagation();
      act();
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        act();
      }
    },
  };
}

// What a chip needs to leave with a picture (see glideAround), and, where the
// row is in an editor (`scope` is that editor's), to glide when its neighbours
// come and go.
export function leaves(scope: string | undefined, id: string) {
  return scope === undefined
    ? { "data-leave": "" }
    : { "data-leave": "", "data-flip": `${scope}:${id}` };
}
