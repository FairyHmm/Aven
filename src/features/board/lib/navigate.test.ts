import { describe, expect, it } from "vitest";

import { moveCard, cardsOf } from "./mutations";
import { moveStep, neighbour, type Lane } from "./navigate";
import { applyPatch } from "./patch";
import { seedBoard } from "./seed";

const lane: Lane = [
  { id: "todo", cards: ["a", "b", "c"] },
  { id: "doing", cards: [] },
  { id: "done", cards: ["d", "e"] },
];

describe("neighbour", () => {
  it("goes up and down inside the column and stops at its ends", () => {
    expect(neighbour(lane, "b", "up")).toBe("a");
    expect(neighbour(lane, "b", "down")).toBe("c");
    expect(neighbour(lane, "a", "up")).toBeUndefined();
    expect(neighbour(lane, "c", "down")).toBeUndefined();
  });

  it("goes sideways to the same height, skipping empty columns", () => {
    expect(neighbour(lane, "a", "right")).toBe("d");
    expect(neighbour(lane, "c", "right")).toBe("e");
    expect(neighbour(lane, "e", "left")).toBe("b");
    expect(neighbour(lane, "d", "right")).toBeUndefined();
    expect(neighbour(lane, "a", "left")).toBeUndefined();
  });

  it("knows nothing of a card that is not on the lane", () => {
    expect(neighbour(lane, "zzz", "up")).toBeUndefined();
  });
});

describe("moveStep", () => {
  it("moves within the column one place", () => {
    expect(moveStep(lane, "b", "up")).toEqual({ columnId: "todo", index: 0 });
    expect(moveStep(lane, "b", "down")).toEqual({ columnId: "todo", index: 3 });
    expect(moveStep(lane, "a", "up")).toBeUndefined();
    expect(moveStep(lane, "c", "down")).toBeUndefined();
  });

  it("moves to the next column, empty or not, at the same height", () => {
    expect(moveStep(lane, "c", "right")).toEqual({
      columnId: "doing",
      index: 0,
    });
    expect(moveStep(lane, "d", "left")).toEqual({
      columnId: "doing",
      index: 0,
    });
    expect(moveStep(lane, "b", "left")).toBeUndefined();
    expect(moveStep(lane, "e", "right")).toBeUndefined();
  });

  it("lands where it says once moveCard has it", () => {
    const data = seedBoard(1);
    const first = cardsOf(data, data.columns[0].id).map(card => card.id);
    const [a, b] = first;
    const column = data.columns[0].id;
    const asLane: Lane = [{ id: column, cards: first }];
    const down = moveStep(asLane, a, "down");
    expect(down).toBeDefined();
    const moved = applyPatch(
      data,
      moveCard(data, a, down?.columnId ?? "", down?.index ?? 0),
    );
    expect(
      cardsOf(moved, column)
        .map(card => card.id)
        .slice(0, 2),
    ).toEqual([b, a]);
  });
});
