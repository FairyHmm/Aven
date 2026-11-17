import { useEffect, useState } from "react";

import { cachedMath, renderMath } from "../../lib/math/render";

import classes from "./math.module.css";

type Props = {
  tex: string;
  display: boolean;
};

// A formula, typeset by MathJax (loaded on first use). Until it is ready, and
// if it fails, the source shows.
export function MathView({ tex, display }: Props) {
  const [svg, setSvg] = useState(() => cachedMath(tex, display));
  useEffect(() => {
    let current = true;
    const known = cachedMath(tex, display);
    if (known !== undefined) {
      setSvg(known);
      return undefined;
    }
    const run = async () => {
      try {
        const next = await renderMath(tex, display);
        if (current) {
          setSvg(next);
        }
      } catch {
        if (current) {
          setSvg(undefined);
        }
      }
    };
    void run();
    return () => {
      current = false;
    };
  }, [tex, display]);
  const shape = display ? classes.display : classes.inline;
  return svg === undefined ? (
    <span className={`${shape} ${classes.pending}`}>{tex}</span>
  ) : (
    <span
      className={shape}
      role="math"
      aria-label={tex}
      // MathJax's own output for the formula, built from the source above.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
