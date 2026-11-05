import { describe, expect, it } from "vitest";

import {
  addCard,
  cardsOf,
  moveCard,
  moveColumn,
  removeColumn,
  sortedColumns,
} from "./mutations";
import { keyAtIndex } from "./order";
import { applyPatch } from "./patch";
import { seedBoard } from "./seed";
import { snippet } from "./snippet";

describe("keyAtIndex", () => {
  it("prepends, appends and inserts between", () => {
    const first = keyAtIndex([], 0);
    const second = keyAtIndex([{ order: first }], 1);
    const middle = keyAtIndex([{ order: first }, { order: second }], 1);
    expect(first < middle && middle < second).toBe(true);
    expect(keyAtIndex([{ order: first }], 0) < first).toBe(true);
  });
});

describe("mutations", () => {
  it("moves a card across columns, only rewriting that card", () => {
    const data = seedBoard(1);
    const done = data.columns[2];
    const card = data.cards[0];
    const patch = moveCard(data, card.id, done.id, 99);
    expect(patch.cards).toHaveLength(1);
    const next = applyPatch(data, patch);
    const ids = cardsOf(next, done.id).map(c => c.id);
    expect(ids).toContain(card.id);
    expect(ids.at(-1)).toBe(card.id);
  });

  it("reorders within a column using the preview index", () => {
    const data = seedBoard(1);
    const [first, , third] = data.cards;
    // Preview index 0 = above the first card of the column.
    const patch = moveCard(data, third.id, first.columnId, 0);
    const ids = cardsOf(applyPatch(data, patch), first.columnId).map(c => c.id);
    expect(ids[0]).toBe(third.id);
  });

  it("is a no-op when dropped where it already is", () => {
    const data = seedBoard(1);
    const [first] = data.cards;
    // Dropping just above or just below itself changes nothing.
    expect(moveCard(data, first.id, first.columnId, 0).cards).toHaveLength(0);
    expect(moveCard(data, first.id, first.columnId, 1).cards).toHaveLength(0);
  });

  it("reorders columns", () => {
    const data = seedBoard(1);
    const last = data.columns[2];
    const patch = moveColumn(data, last.id, 0);
    const next = applyPatch(data, patch);
    expect(sortedColumns(next)[0].id).toBe(last.id);
    expect(patch.columns).toHaveLength(1);
  });

  it("splits the first line into title and the rest into the body", () => {
    const data = seedBoard(1);
    const patch = addCard(data, data.columns[0].id, "Title\n\nSome *body*");
    expect(patch.cards[0].title).toBe("Title");
    expect(patch.cards[0].body).toBe("Some *body*");
  });

  it("removing a column removes its cards", () => {
    const data = seedBoard(1);
    const column = data.columns[0];
    const next = applyPatch(data, removeColumn(data, column.id));
    expect(next.columns.some(c => c.id === column.id)).toBe(false);
    expect(next.cards.some(c => c.columnId === column.id)).toBe(false);
  });
});

describe("snippet", () => {
  it("strips markdown noise and truncates", () => {
    expect(snippet("# Hi\n**bold** [link](http://x) `code`")).toBe(
      "Hi bold link code",
    );
    expect(snippet("a".repeat(200), 10)).toBe(`${"a".repeat(10)}…`);
  });
});
