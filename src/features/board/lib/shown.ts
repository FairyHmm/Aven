import { archivedCards } from "./archive";
import { underTag } from "./labels/tags";
import { cardsOf } from "./mutations";
import { tagsOf } from "./props/defaults";
import type { BoardData, Card } from "./types";

// What the board is narrowed to: cards under one label, and/or whose words
// contain some text.
export type Narrowing = { tag: string | undefined; text: string };

export const NOT_NARROWED: Narrowing = { tag: undefined, text: "" };

export function isNarrowed(narrowing: Narrowing): boolean {
  return narrowing.tag !== undefined || narrowing.text.trim() !== "";
}

// The title, the notes and the labels, ignoring case.
export function matchesText(card: Card, text: string): boolean {
  const wanted = text.trim().toLowerCase();
  if (wanted === "") {
    return true;
  }
  return [card.title, card.body, ...tagsOf(card.props)].some(part =>
    part.toLowerCase().includes(wanted),
  );
}

// Whether a card fits what the board is narrowed to.
function fits(card: Card, narrowing: Narrowing): boolean {
  return (
    (narrowing.tag === undefined ||
      underTag(tagsOf(card.props), narrowing.tag)) &&
    matchesText(card, narrowing.text)
  );
}

// A column's cards as the board shows them: in order, archived ones left out,
// and only those that fit the narrowing.
export function shownCards(
  data: Pick<BoardData, "cards">,
  columnId: string,
  narrowing: Narrowing,
): Card[] {
  const all = cardsOf(data, columnId);
  return isNarrowed(narrowing)
    ? all.filter(card => fits(card, narrowing))
    : all;
}

// The archive's cards as the archive column shows them: the latest archived
// first, and only those that fit the narrowing.
export function shownArchived(
  data: Pick<BoardData, "cards">,
  narrowing: Narrowing,
): Card[] {
  const all = archivedCards(data);
  return isNarrowed(narrowing)
    ? all.filter(card => fits(card, narrowing))
    : all;
}
