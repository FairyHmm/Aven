// Label palette: 10 hues × 3 tones (`subtle`, regular, `bold`).
// Names: `green`, `green-subtle`, `green-bold`. Colour-only labels use the colour name.

export const HUES = [
  "green",
  "yellow",
  "orange",
  "red",
  "purple",
  "blue",
  "sky",
  "lime",
  "pink",
  "gray",
] as const;

export const TONES = ["subtle", "regular", "bold"] as const;

export type Hue = (typeof HUES)[number];
export type Tone = (typeof TONES)[number];
export type LabelColor = Hue | `${Hue}-subtle` | `${Hue}-bold`;

export function colorId(hue: Hue, tone: Tone): LabelColor {
  return tone === "regular" ? hue : `${hue}-${tone}`;
}

export function parseColor(
  value: string,
): { hue: Hue; tone: Tone } | undefined {
  const [name = "", tone = "regular", ...rest] = value.split("-");
  const hue = HUES.find(item => item === name);
  const shade = TONES.find(item => item === tone);
  return hue === undefined || shade === undefined || rest.length > 0
    ? undefined
    : { hue, tone: shade };
}

export function isLabelColor(value: string): value is LabelColor {
  const parsed = parseColor(value);
  return parsed !== undefined && colorId(parsed.hue, parsed.tone) === value;
}

// What a label's element carries so the stylesheet can colour it
// (`--label` and `--label-ink`, see styles/theme.css).
export function attrsOf(color: LabelColor) {
  const { hue, tone } = parseColor(color) ?? { hue: "gray", tone: "regular" };
  return { "data-hue": hue, "data-tone": tone };
}

// The colour picker: five hues across, the three tones down, then the other
// five hues the same way.
export const GRID: LabelColor[] = [HUES.slice(0, 5), HUES.slice(5)].flatMap(
  group => TONES.flatMap(tone => group.map(hue => colorId(hue, tone))),
);

// The labels every space starts with, colour only.
export const STARTER_LABELS: LabelColor[] = [
  "green",
  "yellow",
  "orange",
  "red",
  "purple",
  "blue",
];
