import { describe, expect, it } from "vitest";

import {
  colorOf,
  isNamed,
  knownTags,
  normalizeTag,
  renamed,
  underTag,
} from "./tags";

describe("normalizeTag", () => {
  it("makes a tag of what was typed", () => {
    expect(normalizeTag("  #Area / Front end ")).toBe("area-/-front-end");
    expect(normalizeTag("#Area/Frontend")).toBe("area/frontend");
    expect(normalizeTag("a//b/")).toBe("a/b");
    expect(normalizeTag("bug!?")).toBe("bug");
    expect(normalizeTag("###")).toBe("");
  });
});

describe("underTag", () => {
  it("matches the tag itself and what is beneath it, not look-alikes", () => {
    expect(underTag(["area/frontend"], "area")).toBe(true);
    expect(underTag(["area"], "area")).toBe(true);
    expect(underTag(["areas"], "area")).toBe(false);
    expect(underTag(["area"], "area/frontend")).toBe(false);
  });
});

describe("colorOf / isNamed", () => {
  it("uses its own colour, then the nearest parent's", () => {
    const colors = { area: "red", "area/ui": "sky-bold" } as const;
    expect(colorOf("area/ui", colors)).toBe("sky-bold");
    expect(colorOf("area/ui/forms", colors)).toBe("sky-bold");
    expect(colorOf("area/api", colors)).toBe("red");
  });

  it("is the colour a colour-only label is named after", () => {
    expect(colorOf("green-bold", {})).toBe("green-bold");
    expect(isNamed("green-bold")).toBe(false);
    expect(isNamed("bug")).toBe(true);
  });

  it("is stable for a named tag without one", () => {
    expect(colorOf("bug", {})).toBe(colorOf("bug", {}));
    expect(colorOf("bug/x", {})).toBe(colorOf("bug", {}));
  });
});

describe("renamed / knownTags", () => {
  it("moves a tag and what is beneath it, without doubles", () => {
    expect(renamed(["a", "a/x", "b"], "a", "c")).toEqual(["c", "c/x", "b"]);
    expect(renamed(["a", "c"], "a", "c")).toEqual(["c"]);
  });

  it("lists the starter labels and every tag once, sorted", () => {
    const tags = knownTags([["b", "a"], ["b"]], { c: "sky" }, ["a/x"]);
    expect(tags).toEqual(
      expect.arrayContaining(["a", "a/x", "b", "c", "green", "blue"]),
    );
    expect(new Set(tags).size).toBe(tags.length);
    expect(tags).toEqual([...tags].sort());
  });
});
