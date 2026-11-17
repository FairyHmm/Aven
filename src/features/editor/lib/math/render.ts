// Typesetting maths, with MathJax loaded the first time it is needed and every
// result kept: the same formula is drawn again whenever its widget is rebuilt.

const done = new Map<string, string>();
let loading: Promise<typeof import("./mathjax")> | undefined;

const keyOf = (tex: string, display: boolean) =>
  `${display ? "d" : "i"}:${tex}`;

// The svg, if it has been made already.
export function cachedMath(tex: string, display: boolean): string | undefined {
  return done.get(keyOf(tex, display));
}

export async function renderMath(
  tex: string,
  display: boolean,
): Promise<string> {
  const key = keyOf(tex, display);
  const known = done.get(key);
  if (known !== undefined) {
    return known;
  }
  loading ??= import("./mathjax");
  const svg = (await loading).typeset(tex, display);
  done.set(key, svg);
  return svg;
}
