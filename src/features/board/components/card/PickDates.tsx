import { type ReactNode, useState } from "react";

import type { Props } from "../../lib/types";
import { PropPopover } from "../cardBack/PropPopover";

// Clickable date chip that opens the dates picker.
// Stops events from bubbling to the card tile.
export function PickDates({
  props,
  onProps,
  chip,
}: {
  props: Props;
  onProps: (props: Props) => void;
  // The chip, given what it needs to open the popup.
  chip: (toggle: () => void) => ReactNode;
}) {
  const [opened, setOpened] = useState(false);
  return (
    <span
      style={{ display: "contents" }}
      onClick={event => {
        event.stopPropagation();
      }}
      onKeyDown={event => {
        event.stopPropagation();
      }}
    >
      <PropPopover
        kind="dates"
        opened={opened}
        onOpened={setOpened}
        props={props}
        onChange={onProps}
      >
        {chip(() => {
          setOpened(open => !open);
        })}
      </PropPopover>
    </span>
  );
}
