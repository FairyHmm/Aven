import { describe, expect, it } from "vitest";

import {
  ARCHIVE_LIST,
  archivedCards,
  archiveCard,
  placeCard,
  restoreCard,
} from "./archive";
import { addCard, cardsOf, moveCard, removeColumn } from "./mutations";
import { applyPatch } from "./patch";
import { seedBoard } from "./seed";

describe("archive", () => {
  it("takes a card off its column and brings it back in the same place", () => {
    const data = seedBoard(1);
    const [card] = data.cards;
    const before = cardsOf(data, card.columnId).map(item => item.id);
    const archived = applyPatch(data, archiveCard(data, card.id, 5));
    expect(cardsOf(archived, card.columnId).map(item => item.id)).toEqual(
      before.filter(id => id !== card.id),
    );
    expect(archivedCards(archived).map(item => item.id)).toEqual([card.id]);
    const restored = applyPatch(archived, restoreCard(archived, card.id));
    expect(cardsOf(restored, card.columnId).map(item => item.id)).toEqual(
      before,
    );
    expect(restored.cards.find(item => item.id === card.id)).toEqual(card);
  });

  it("does nothing to a card that is already archived or not archived", () => {
    const data = seedBoard(1);
    const [card] = data.cards;
    expect(restoreCard(data, card.id).cards).toHaveLength(0);
    const archived = applyPatch(data, archiveCard(data, card.id, 5));
    expect(archiveCard(archived, card.id, 9).cards).toHaveLength(0);
  });

  it("lists the latest archived first", () => {
    let data = seedBoard(1);
    const [first, second] = data.cards;
    data = applyPatch(data, archiveCard(data, first.id, 1));
    data = applyPatch(data, archiveCard(data, second.id, 2));
    expect(archivedCards(data).map(item => item.id)).toEqual([
      second.id,
      first.id,
    ]);
  });

  it("is not counted when dropping or adding in the column", () => {
    const data = seedBoard(1);
    const [card] = data.cards;
    const archived = applyPatch(data, archiveCard(data, card.id, 5));
    const others = cardsOf(archived, card.columnId);
    const added = applyPatch(
      archived,
      addCard(archived, card.columnId, "Last"),
    );
    expect(cardsOf(added, card.columnId)).toHaveLength(others.length + 1);
    const moved = moveCard(archived, others[0].id, card.columnId, 99);
    expect(moved.cards).toHaveLength(1);
  });

  it("goes with its column when the column is deleted", () => {
    const data = seedBoard(1);
    const [card] = data.cards;
    const archived = applyPatch(data, archiveCard(data, card.id, 5));
    const patch = removeColumn(archived, card.columnId);
    expect(patch.removeCards).toContain(card.id);
  });
});

describe("placeCard", () => {
  it("archives a card dropped on the archive, and not again", () => {
    const data = seedBoard(1);
    const [card] = data.cards;
    const patch = placeCard(data, card.id, ARCHIVE_LIST, 0, 9);
    const after = applyPatch(data, patch);
    expect(archivedCards(after).map(item => item.id)).toEqual([card.id]);
    expect(placeCard(after, card.id, ARCHIVE_LIST, 0, 10).cards).toHaveLength(
      0,
    );
  });

  it("moves a card between columns as moveCard does", () => {
    const data = seedBoard(1);
    const [card] = data.cards;
    const other = data.columns.find(column => column.id !== card.columnId);
    expect(placeCard(data, card.id, other?.id ?? "", 0)).toEqual(
      moveCard(data, card.id, other?.id ?? "", 0),
    );
  });

  it("brings an archived card back into the column and place it is dropped on", () => {
    const data = seedBoard(1);
    const [card] = data.cards;
    const archived = applyPatch(data, archiveCard(data, card.id, 5));
    const target = data.columns.find(column => column.id !== card.columnId);
    const column = target?.id ?? "";
    const there = cardsOf(archived, column).map(item => item.id);
    const back = applyPatch(archived, placeCard(archived, card.id, column, 1));
    const moved = back.cards.find(item => item.id === card.id);
    expect(moved?.archivedAt).toBeUndefined();
    expect(moved?.columnId).toBe(column);
    expect(cardsOf(back, column).map(item => item.id)).toEqual([
      there[0],
      card.id,
      ...there.slice(1),
    ]);
    expect(archivedCards(back)).toHaveLength(0);
  });

  it("brings an archived card back to its own column too", () => {
    const data = seedBoard(1);
    const [card] = data.cards;
    const archived = applyPatch(data, archiveCard(data, card.id, 5));
    const back = applyPatch(
      archived,
      placeCard(archived, card.id, card.columnId, 0),
    );
    expect(
      back.cards.find(item => item.id === card.id)?.archivedAt,
    ).toBeUndefined();
    expect(cardsOf(back, card.columnId)[0]?.id).toBe(card.id);
  });
});
