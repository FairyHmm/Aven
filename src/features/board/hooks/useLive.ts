import { useEffect, useState } from "react";

// False while the first paint happens, then true: what appears from then on
// (a label just added, a field just made) may come in with a transition,
// while what was already there when the card opened does not.
export function useLive() {
  const [live, setLive] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setLive(true);
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);
  return live;
}
