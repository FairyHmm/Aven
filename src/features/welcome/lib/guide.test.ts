import { describe, expect, it } from "vitest";

import { guideBoards } from "./guide";

describe("guideBoards", () => {
  it("makes several small boards, the first being a very short Start here", () => {
    const boards = guideBoards();
    expect(boards.length).toBeGreaterThan(2);
    expect(boards[0]?.name).toBe("Start here");
    expect(boards[0]?.data.cards.length).toBeLessThanOrEqual(5);
    expect(new Set(boards.map(b => b.id)).size).toBe(boards.length);
    for (const board of boards) {
      expect(board.data.cards.length).toBeLessThanOrEqual(10);
    }
  });

  it("puts every card in a column that exists, with unique ids", () => {
    for (const { data } of guideBoards()) {
      const columnIds = new Set(data.columns.map(c => c.id));
      expect(data.cards.every(card => columnIds.has(card.columnId))).toBe(true);
      expect(new Set(data.cards.map(c => c.id)).size).toBe(data.cards.length);
    }
  });

  it("orders columns and the cards inside each column", () => {
    for (const { data } of guideBoards()) {
      const sorted = [...data.columns].sort((a, b) =>
        a.order < b.order ? -1 : 1,
      );
      expect(sorted.map(c => c.id)).toEqual(data.columns.map(c => c.id));
      for (const column of data.columns) {
        const orders = data.cards
          .filter(c => c.columnId === column.id)
          .map(c => c.order);
        expect([...orders].sort()).toEqual(orders);
      }
    }
  });

  it("asks for things to try, with real properties and every card labelled", () => {
    const cards = guideBoards(Date.UTC(2026, 10, 18, 12)).flatMap(
      b => b.data.cards,
    );
    expect(cards.every(c => Array.isArray(c.props.tags))).toBe(true);
    expect(cards.some(c => c.props.start === "2026-11-18")).toBe(true);
    expect(cards.some(c => c.body.includes("| Team | Task | Status |"))).toBe(
      true,
    );
    expect(cards.some(c => c.body.includes("![A kanban board]("))).toBe(true);
  });

  it("keeps each card to a few lines", () => {
    for (const card of guideBoards().flatMap(b => b.data.cards)) {
      expect(card.body.length).toBeLessThan(500);
    }
  });
});
