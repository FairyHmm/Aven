import { describe, expect, it } from "vitest";

import {
  datesOf,
  isBuiltIn,
  isPast,
  membersOf,
  tagsOf,
  withDates,
  withMembers,
  withTags,
} from "./defaults";

describe("tags", () => {
  it("reads and writes the list, and drops the key when it is empty", () => {
    const props = withTags({ Owner: "Fairy" }, ["bug", "area/ui"]);
    expect(props).toEqual({ Owner: "Fairy", tags: ["bug", "area/ui"] });
    expect(tagsOf(props)).toEqual(["bug", "area/ui"]);
    expect(withTags(props, [])).toEqual({ Owner: "Fairy" });
    expect(tagsOf({})).toEqual([]);
  });
});

describe("members", () => {
  it("reads string UIDs and drops the key when empty", () => {
    const props = withMembers({ tags: ["bug"] }, ["u1", "u2"]);
    expect(props).toEqual({ tags: ["bug"], members: ["u1", "u2"] });
    expect(membersOf(props)).toEqual(["u1", "u2"]);
    expect(withMembers(props, [])).toEqual({ tags: ["bug"] });
    expect(membersOf({})).toEqual([]);
  });
});

describe("dates", () => {
  const dates = {
    start: "2026-11-10",
    due: "2026-11-14T17:00",
    repeat: "weekly",
    reminder: "1 day before",
  };

  it("round-trips through the props, keeping the rest", () => {
    const props = withDates({ tags: ["a"] }, dates);
    expect(props).toEqual({ tags: ["a"], ...dates });
    expect(datesOf(props)).toEqual(dates);
  });

  it("does not keep repeat or reminder without a due date", () => {
    expect(withDates({}, { ...dates, due: "" })).toEqual({
      start: "2026-11-10",
    });
  });

  it("clears everything when nothing is set", () => {
    const empty = { start: "", due: "", repeat: "", reminder: "" };
    expect(withDates(withDates({}, dates), empty)).toEqual({});
  });
});

describe("isPast / isBuiltIn", () => {
  const now = new Date(2026, 10, 14, 12, 0);

  it("compares a date and time, and a date until the end of its day", () => {
    expect(isPast("2026-11-14T09:00", now)).toBe(true);
    expect(isPast("2026-11-14T17:00", now)).toBe(false);
    expect(isPast("2026-11-14", now)).toBe(false);
    expect(isPast("2026-11-13", now)).toBe(true);
    expect(isPast("soon", now)).toBe(false);
  });

  it("knows the built-in keys", () => {
    expect(isBuiltIn("due")).toBe(true);
    expect(isBuiltIn("Owner")).toBe(false);
  });
});
