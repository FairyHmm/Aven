// Board domain model. Declared as type aliases (not interfaces) so values are
// assignable to Firestore's DocumentData without casts.

export const ACCENTS = [
  "indigo",
  "sky",
  "emerald",
  "amber",
  "rose",
  "violet",
] as const;

export type Accent = (typeof ACCENTS)[number];

export type Column = {
  id: string;
  name: string;
  accent: Accent;
  order: string;
};

// One property value: text, number, checkbox, date / date & time (as an ISO
// string) or a list of strings. See lib/props.ts.
// The popups of the built-in properties (labels, dates, members).
export type PropertyPopup = "labels" | "dates" | "members";

// A new field is being named, and of what kind: a plain custom field (its
// type follows the first value) or a dropdown (made straight away).
export type NewFieldKind = "field" | "dropdown";

// What the card back has open: a built-in property popup, or a new field
// being named (either kind).
export type PopupKind = PropertyPopup | NewFieldKind;

export type PropValue = string | number | boolean | string[];
export type Props = Record<string, PropValue>;

export type Card = {
  id: string;
  columnId: string;
  title: string;
  // The YAML frontmatter shown right under the title (labels, dates, ...).
  props: Props;
  // Markdown document, without the frontmatter.
  body: string;
  order: string;
  createdAt: number;
  updatedAt: number;
};

export type BoardData = { columns: Column[]; cards: Card[] };

// A storage-agnostic change set: every mutation is expressed as one of these,
// applied to memory and handed to whichever storage backend is active.
export type BoardPatch = {
  columns: Column[];
  cards: Card[];
  removeColumns: string[];
  removeCards: string[];
};

export type BoardRef = { spaceId: string; boardId: string };

export function isAccent(value: unknown): value is Accent {
  return ACCENTS.some(accent => accent === value);
}
