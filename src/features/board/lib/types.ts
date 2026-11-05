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

export type Card = {
  id: string;
  columnId: string;
  title: string;
  // Markdown document. The tile shows a plain-text snippet of it.
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
