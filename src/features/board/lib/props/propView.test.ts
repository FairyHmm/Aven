import { describe, expect, it } from "vitest";

import { formatDate, isEmptyValue, kindOf } from "./propView";

describe("kindOf", () => {
  it("guesses the kind from the value", () => {
    expect(kindOf(true)).toBe("checkbox");
    expect(kindOf(3)).toBe("number");
    expect(kindOf(["a"])).toBe("list");
    expect(kindOf("2026-11-14")).toBe("date");
    expect(kindOf("2026-11-14T09:30")).toBe("datetime");
    expect(kindOf("Bug")).toBe("text");
  });
});

describe("formatDate", () => {
  const now = new Date(2026, 5, 1);

  it("omits the year within the current year", () => {
    expect(formatDate("2026-11-14", now, "en-US")).toBe("Nov 14");
  });

  it("adds the year for another year and the time for date & time", () => {
    expect(formatDate("2027-01-02", now, "en-US")).toBe("Jan 2, 2027");
    expect(formatDate("2026-11-14T09:30", now, "en-US")).toBe(
      "Nov 14, 09:30 AM",
    );
  });

  it("can leave the time off, for a tile", () => {
    expect(formatDate("2026-11-14T09:30", now, "en-US", false)).toBe("Nov 14");
  });

  it("returns anything else untouched", () => {
    expect(formatDate("soon", now, "en-US")).toBe("soon");
  });
});

describe("isEmptyValue", () => {
  it("is true for empty text and empty lists only", () => {
    expect(isEmptyValue("")).toBe(true);
    expect(isEmptyValue([])).toBe(true);
    expect(isEmptyValue(false)).toBe(false);
    expect(isEmptyValue(0)).toBe(false);
  });
});
