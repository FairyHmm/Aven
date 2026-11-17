import { describe, expect, it } from "vitest";

import { stepFrom } from "./nav";

// Two body rows and three columns; row -1 is the header.
const step = (
  row: number,
  column: number,
  direction: Parameters<typeof stepFrom>[4],
) => stepFrom(2, 3, row, column, direction);

describe("stepFrom", () => {
  it("moves along a row with left and right, on through the rows", () => {
    expect(step(0, 0, "right")).toMatchObject({
      row: 0,
      column: 1,
      where: "start",
    });
    expect(step(0, 2, "right")).toMatchObject({ row: 1, column: 0 });
    expect(step(0, 1, "left")).toMatchObject({
      row: 0,
      column: 0,
      where: "end",
    });
    expect(step(1, 0, "left")).toMatchObject({
      row: 0,
      column: 2,
      where: "end",
    });
    expect(step(0, 0, "left")).toMatchObject({ row: -1, column: 2 });
  });

  it("leaves the table past the first and the last cell", () => {
    expect(step(-1, 0, "left")).toEqual({ kind: "out", direction: "up" });
    expect(step(-1, 1, "up")).toEqual({ kind: "out", direction: "up" });
    expect(step(1, 2, "right")).toEqual({ kind: "out", direction: "down" });
    expect(step(1, 0, "down")).toEqual({ kind: "out", direction: "down" });
  });

  it("stays in the column for up and down", () => {
    expect(step(0, 1, "down")).toMatchObject({ row: 1, column: 1 });
    expect(step(0, 1, "up")).toMatchObject({ row: -1, column: 1 });
  });

  it("goes down on Enter and adds a row after the last one", () => {
    expect(step(0, 1, "enter")).toMatchObject({ row: 1, grow: false });
    expect(step(1, 1, "enter")).toMatchObject({ row: 2, grow: true });
    expect(stepFrom(0, 2, -1, 0, "enter")).toMatchObject({
      row: 0,
      grow: true,
    });
  });
});
