import { describe, expect, it } from "vitest";

import { resizeCard, resizeColumn } from "./resize";
import type { BoardData } from "./types";

const data: BoardData = {
  columns: [{ id: "c", name: "To do", accent: "indigo", order: "a0" }],
  cards: [
    {
      id: "k",
      columnId: "c",
      title: "A",
      props: {},
      body: "text",
      order: "a0",
      createdAt: 1,
      updatedAt: 2,
    },
  ],
};

describe("resizeColumn", () => {
  it("stores the width, kept within the limits", () => {
    expect(resizeColumn(data, "c", 333.4).columns[0]?.width).toBe(333);
    expect(resizeColumn(data, "c", 10).columns[0]?.width).toBe(200);
    expect(resizeColumn(data, "c", 5000).columns[0]?.width).toBe(720);
  });

  it("drops the width key when reset", () => {
    const wide = { ...data, columns: [{ ...data.columns[0], width: 400 }] };
    const column = resizeColumn(wide, "c", undefined).columns[0];
    expect(Object.keys(column ?? {})).not.toContain("width");
  });

  it("ignores a column that is not there", () => {
    expect(resizeColumn(data, "nope", 300).columns).toEqual([]);
  });
});

describe("resizeCard", () => {
  it("stores the height and is not an edit", () => {
    const card = resizeCard(data, "k", 400).cards[0];
    expect(card?.height).toBe(400);
    expect(card?.updatedAt).toBe(2);
  });

  it("drops the height key when reset", () => {
    const tall = { ...data, cards: [{ ...data.cards[0], height: 400 }] };
    const card = resizeCard(tall, "k", undefined).cards[0];
    expect(Object.keys(card ?? {})).not.toContain("height");
  });
});
