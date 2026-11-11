// The three timings the app moves at. They live in styles/theme.css (so CSS
// uses them as variables); this reads them for what is animated from code,
// so that a CSS transition and a script animation of the same kind of thing
// always take the same time.
//
//   fast: a thing's colour, a fade, a press
//   base: things appearing, leaving, resizing, moving between places
//   slow: shapes that settle on the spring (see --spring)
const VARIABLE = {
  fast: "--dur-fast",
  base: "--dur",
  slow: "--dur-spatial",
} as const;

const FALLBACK = { fast: 120, base: 200, slow: 420 } as const;

export type Timing = keyof typeof VARIABLE;

const read: Partial<Record<Timing, number>> = {};

export function ms(timing: Timing): number {
  const known = read[timing];
  if (known !== undefined) {
    return known;
  }
  const value = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(
      VARIABLE[timing],
    ),
  );
  if (Number.isNaN(value)) {
    // Styles not loaded (yet), or no DOM: don't remember the guess.
    return FALLBACK[timing];
  }
  read[timing] = value;
  return value;
}
