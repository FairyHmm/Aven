import { useState } from "react";

// The size a resize handle is showing while it is dragged, before it is
// stored: `size` is that, or the stored one. `bind` gives a ResizeHandle its
// callbacks, and forgets the live size once a drag is committed or reset.
export function useLiveSize(stored: number | undefined) {
  const [live, setLive] = useState<number | undefined>();
  return {
    live,
    size: live ?? stored,
    bind: (commit: (size: number) => void, reset: () => void) => ({
      onResize: setLive,
      onCommit: (size: number) => {
        commit(size);
        setLive(undefined);
      },
      onReset: () => {
        reset();
        setLive(undefined);
      },
    }),
  };
}
