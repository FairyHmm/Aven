import { describe, expect, it } from "vitest";

import { archivedCards } from "./archive";
import { archiveColumnCards, sortColumn } from "./columnOps";
import { addCard, cardsOf } from "./mutations";
import { applyPatch } from "./patch";
import { seedBoard } from "./seed";
import type { BoardData } from "./types";

function withCards(titles: string[]): { data: BoardData; column: string } {
  let data = seedBoard(1);
  const column = data.columns[0].id;
  data = {
    ...data,
    cards: data.cards.filter(card => card.columnId !== column),
  };
  for (const [index, title] of titles.entries()) {
    data = applyPatch(data, addCard(data, column, title, 1000 + index));
  }
  return { data, column };
}

const titlesOf = (data: BoardData, column: string) =>
  cardsOf(data, column).map(card => card.title);

describe("sortColumn", () => {
  it("sorts by title, numbers by their value", () => {
    const { data, column } = withCards([
      "card 10",
      "Banana",
      "card 2",
      "apple",
    ]);
    const sorted = applyPatch(data, sortColumn(data, column, "title"));
    expect(titlesOf(sorted, column)).toEqual([
      "apple",
      "Banana",
      "card 2",
      "card 10",
    ]);
  });

  it("sorts newest or oldest first", () => {
    const { data, column } = withCards(["first", "second", "third"]);
    const newest = applyPatch(data, sortColumn(data, column, "newest"));
    expect(titlesOf(newest, column)).toEqual(["third", "second", "first"]);
    const oldest = applyPatch(newest, sortColumn(newest, column, "oldest"));
    expect(titlesOf(oldest, column)).toEqual(["first", "second", "third"]);
  });

  it("puts the soonest due date first and cards without one last", () => {
    const { data, column } = withCards(["none", "later", "sooner"]);
    const byTitle = (title: string) =>
      data.cards.find(card => card.title === title);
    const later = byTitle("later");
    const sooner = byTitle("sooner");
    const dated: BoardData = {
      ...data,
      cards: data.cards.map(card =>
        card.id === later?.id
          ? { ...card, props: { due: "2026-12-30" } }
          : card.id === sooner?.id
            ? { ...card, props: { due: "2026-11-30" } }
            : card,
      ),
    };
    const sorted = applyPatch(dated, sortColumn(dated, column, "due"));
    expect(titlesOf(sorted, column)).toEqual(["sooner", "later", "none"]);
  });

  it("writes nothing when the cards are in that order already", () => {
    const { data, column } = withCards(["a", "b", "c"]);
    expect(sortColumn(data, column, "title").cards).toHaveLength(0);
  });

  it("leaves other columns and archived cards alone", () => {
    const { data, column } = withCards(["b", "a"]);
    const patch = sortColumn(data, column, "title");
    expect(patch.cards.every(card => card.columnId === column)).toBe(true);
  });
});

describe("archiveColumnCards", () => {
  it("sets every card of the column aside and no others", () => {
    const { data, column } = withCards(["a", "b", "c"]);
    const after = applyPatch(data, archiveColumnCards(data, column, 7));
    expect(cardsOf(after, column)).toHaveLength(0);
    expect(archivedCards(after)).toHaveLength(3);
    expect(after.cards).toHaveLength(data.cards.length);
  });

  it("writes nothing for an empty column", () => {
    const { data, column } = withCards([]);
    expect(archiveColumnCards(data, column).cards).toHaveLength(0);
  });
});
