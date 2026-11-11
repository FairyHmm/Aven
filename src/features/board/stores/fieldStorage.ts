import { parseColors, type TagColors } from "../lib/labels/tags";
import type { Links, Lists } from "../lib/props/dropdowns";

// What the field store keeps in localStorage for a space (until spaces move to
// Firestore), and reading it back without trusting it.

// The colours are those of the options of each list, by list: an option's
// colour belongs to its list, not to the labels of the space.
export type OptionColors = Record<string, TagColors>;

export type Saved = { lists: Lists; links: Links; colors: OptionColors };

export const keyOf = (spaceId: string) => `aven:v1:space:${spaceId}:dropdowns`;

const NONE: Saved = { lists: {}, links: {}, colors: {} };

function recordOf(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? Object.fromEntries(Object.entries(value))
    : {};
}

function isStrings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}

export function read(spaceId: string): Saved {
  try {
    const raw = localStorage.getItem(keyOf(spaceId));
    if (raw === null) {
      return NONE;
    }
    const saved = recordOf(JSON.parse(raw));
    return {
      lists: Object.fromEntries(
        Object.entries(recordOf(saved["lists"])).filter(
          (entry): entry is [string, string[]] => isStrings(entry[1]),
        ),
      ),
      links: Object.fromEntries(
        Object.entries(recordOf(saved["links"])).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
      ),
      colors: Object.fromEntries(
        Object.entries(recordOf(saved["colors"])).map(([list, own]) => [
          list,
          parseColors(own),
        ]),
      ),
    };
  } catch {
    return NONE;
  }
}
