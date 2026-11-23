import { describe, expect, it } from "vitest";

import { archiveCard } from "./archive";
import { applyPatch } from "./patch";
import { seedBoard } from "./seed";
import { isNarrowed, matchesText, NOT_NARROWED, shownCards } from "./shown";

describe("shownCards", () => {
  it("shows a column's cards in order when nothing narrows them", () => {
    const data = seedBoard(1);
    const column = data.columns[0].id;
    const here = data.cards.filter(card => card.columnId === column);
    expect(shownCards(data, column, NOT_NARROWED)).toHaveLength(here.length);
    expect(isNarrowed(NOT_NARROWED)).toBe(false);
  });

  it("leaves archived cards out", () => {
    const data = seedBoard(1);
    const [card] = data.cards;
    const archived = applyPatch(data, archiveCard(data, card.id, 1));
    const ids = shownCards(archived, card.columnId, NOT_NARROWED).map(
      item => item.id,
    );
    expect(ids).not.toContain(card.id);
  });

  it("keeps only the cards whose words contain the text, ignoring case", () => {
    const data = seedBoard(1);
    const [card] = data.cards;
    const word = card.title.slice(0, 4).toUpperCase();
    const narrowing = { tag: undefined, text: ` ${word} ` };
    expect(isNarrowed(narrowing)).toBe(true);
    const found = shownCards(data, card.columnId, narrowing);
    expect(found.map(item => item.id)).toContain(card.id);
    expect(found.every(item => matchesText(item, word))).toBe(true);
    expect(
      shownCards(data, card.columnId, { tag: undefined, text: "§§§" }),
    ).toHaveLength(0);
  });

  it("looks in the notes too", () => {
    const [card] = seedBoard(1).cards;
    expect(matchesText({ ...card, body: "buy Milk" }, "milk")).toBe(true);
    expect(matchesText({ ...card, title: "x", body: "y" }, "milk")).toBe(false);
  });
});
