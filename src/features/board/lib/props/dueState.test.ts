import { describe, expect, it } from "vitest";

import { dueState, dueWord } from "./dueState";

// Wednesday 25 Nov 2026, mid-afternoon.
const now = new Date(2026, 10, 25, 15, 0);

describe("dueState", () => {
  it("is overdue once the day (or the time) has passed", () => {
    expect(dueState("2026-11-24", now)).toBe("overdue");
    expect(dueState("2026-11-25T09:00", now)).toBe("overdue");
  });

  it("is today for the whole of its day", () => {
    expect(dueState("2026-11-25", now)).toBe("today");
    expect(dueState("2026-11-25T18:30", now)).toBe("today");
  });

  it("is soon the day after, and nothing further away", () => {
    expect(dueState("2026-11-26", now)).toBe("soon");
    expect(dueState("2026-11-27", now)).toBeUndefined();
  });

  it("is nothing for no date or something that isn't one", () => {
    expect(dueState("", now)).toBeUndefined();
    expect(dueState("later", now)).toBeUndefined();
  });
});

describe("dueWord", () => {
  it("names yesterday, today and tomorrow", () => {
    expect(dueWord("2026-11-24", now)).toBe("Yesterday");
    expect(dueWord("2026-11-25", now)).toBe("Today");
    expect(dueWord("2026-11-26", now)).toBe("Tomorrow");
  });

  it("leaves other days and dates with a time as they are", () => {
    expect(dueWord("2026-11-30", now)).toBeUndefined();
    expect(dueWord("2026-11-25T18:30", now)).toBeUndefined();
    expect(dueWord("", now)).toBeUndefined();
  });

  it("reads the month right at the end of a month", () => {
    expect(dueWord("2026-12-01", new Date(2026, 10, 30, 8))).toBe("Tomorrow");
  });
});
