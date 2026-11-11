import { describe, expect, it } from "vitest";

import {
  attrsOf,
  colorId,
  GRID,
  isLabelColor,
  parseColor,
} from "./labelColors";

describe("label colours", () => {
  it("names a colour by hue, adding the tone unless it is the regular one", () => {
    expect(colorId("green", "regular")).toBe("green");
    expect(colorId("sky", "bold")).toBe("sky-bold");
    expect(parseColor("pink-subtle")).toEqual({ hue: "pink", tone: "subtle" });
    expect(parseColor("green")).toEqual({ hue: "green", tone: "regular" });
  });

  it("only knows its own names", () => {
    expect(isLabelColor("lime-bold")).toBe(true);
    expect(isLabelColor("green-regular")).toBe(false);
    expect(isLabelColor("bug")).toBe(false);
    expect(isLabelColor("area/ui")).toBe(false);
    expect(isLabelColor("indigo")).toBe(false);
  });

  it("lays 30 distinct colours out five across", () => {
    expect(GRID).toHaveLength(30);
    expect(new Set(GRID).size).toBe(30);
    expect(GRID.slice(0, 5)).toEqual([
      "green-subtle",
      "yellow-subtle",
      "orange-subtle",
      "red-subtle",
      "purple-subtle",
    ]);
    expect(GRID.every(isLabelColor)).toBe(true);
  });

  it("gives the stylesheet a hue and a tone", () => {
    expect(attrsOf("red-bold")).toEqual({
      "data-hue": "red",
      "data-tone": "bold",
    });
  });
});
