import { Popover } from "@mantine/core";

import type { ShownMath } from "../../hooks/useMathPreview";
import { Anchor } from "../menu/Anchor";
import { MathView } from "./MathView";

import classes from "./math.module.css";

// The formula under the caret, drawn above its source while it is edited. It
// is only looked at: it takes no focus and no clicks.
export function MathPreview({ shown }: { shown: ShownMath | undefined }) {
  return (
    <Popover
      opened={shown !== undefined}
      position="top-start"
      offset={6}
      trapFocus={false}
      returnFocus={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Popover.Target>
        <Anchor x={shown?.x ?? 0} y={shown?.y ?? 0} />
      </Popover.Target>
      <Popover.Dropdown className={classes.preview} p="xs">
        {shown !== undefined && (
          <MathView tex={shown.tex} display={shown.display} />
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
