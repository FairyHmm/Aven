import { describe, expect, it } from "vitest";

import { convertValue, inferValue, lossNote } from "./convert";
import {
  customFields,
  FIELD_TYPES,
  fieldError,
  initialValue,
  knownValues,
  renameField,
  typeOf,
  withField,
  withoutField,
} from "./fields";
import { kindOf } from "./propView";

describe("custom fields", () => {
  it("starts each type with a value that reads back as that type", () => {
    const now = new Date(2026, 10, 8);
    const kinds = FIELD_TYPES.map(type => kindOf(initialValue(type, now)));
    expect(kinds).toEqual([
      "text",
      "number",
      "checkbox",
      "date",
      "datetime",
      "list",
      "text",
    ]);
    expect(initialValue("date", now)).toBe("2026-11-08");
  });

  it("lists a built-in key too once it holds something else", () => {
    const props = {
      tags: "a, b",
      due: "2026-11-10",
      members: ["x"],
      Owner: "F",
    };
    expect(customFields(props)).toEqual([
      ["tags", "a, b"],
      ["Owner", "F"],
    ]);
  });

  it("lists only keys that are not built in", () => {
    const props = { tags: ["a"], due: "2026-11-10", Owner: "Fairy", Points: 3 };
    expect(customFields(props)).toEqual([
      ["Owner", "Fairy"],
      ["Points", 3],
    ]);
  });

  it("refuses empty, built-in and repeated names", () => {
    const props = { Owner: "Fairy" };
    expect(fieldError("  ", props)).toBeDefined();
    expect(fieldError("Due", props)).toBeDefined();
    expect(fieldError("Owner", props)).toBeDefined();
    expect(fieldError(" Points ", props)).toBeUndefined();
  });

  it("adds and removes a field without touching the rest", () => {
    const added = withField({ tags: ["a"] }, "Points", 3);
    expect(added).toEqual({ tags: ["a"], Points: 3 });
    expect(withoutField(added, "Points")).toEqual({ tags: ["a"] });
  });

  it("carries a value over to another type as far as it can", () => {
    const now = new Date(2026, 10, 8, 14, 30);
    expect(convertValue(3, "text", now)).toBe("3");
    expect(convertValue("3.5 pts", "number", now)).toBe(3.5);
    expect(convertValue("none", "number", now)).toBe(0);
    expect(convertValue("yes", "checkbox", now)).toBe(true);
    expect(convertValue(0, "checkbox", now)).toBe(false);
    expect(convertValue("2026-11-02T08:15", "date", now)).toBe("2026-11-02");
    expect(convertValue("2026-11-02", "datetime", now)).toBe(
      "2026-11-02T09:00",
    );
    expect(convertValue("soon", "date", now)).toBe("2026-11-08");
    expect(convertValue("a, b ,,c", "list", now)).toEqual(["a", "b", "c"]);
    expect(convertValue(["a", "b"], "text", now)).toBe("a, b");
    expect(convertValue(["a", "b"], "dropdown", now)).toEqual(["a", "b"]);
  });

  it("is a dropdown only when a text value belongs to a dropdown field", () => {
    expect(typeOf("high", true)).toBe("dropdown");
    expect(typeOf("high", false)).toBe("text");
    expect(typeOf(3, true)).toBe("number");
  });

  it("renames a field where it is, and collects values once", () => {
    expect(renameField({ a: 1, Owner: "x", b: 2 }, "Owner", "Lead")).toEqual({
      a: 1,
      Lead: "x",
      b: 2,
    });
    expect(fieldError("Lead", { Lead: "x" }, "Lead")).toBeUndefined();
    const cards = [{ Owner: "A" }, { Owner: ["B", "A"] }, { Owner: 3 }, {}];
    expect(knownValues(cards, "Owner")).toEqual(["A", "B"]);
  });

  it("says what a change of type would lose, and nothing when it loses none", () => {
    expect(lossNote("3.5", "number")).toBeUndefined();
    expect(lossNote("yes", "checkbox")).toBeUndefined();
    expect(lossNote(1, "checkbox")).toBeUndefined();
    expect(lossNote("2026-11-08", "datetime")).toBeUndefined();
    expect(lossNote(["a", "b"], "text")).toBeUndefined();
    expect(lossNote("", "number")).toBeUndefined();
    expect(lossNote("hello", "number")).toContain("It would become 0");
    expect(lossNote(["a", "b"], "checkbox")).toContain("checked");
    expect(lossNote("soon", "date", new Date(2026, 10, 8))).toContain(
      "2026-11-08",
    );
    expect(lossNote("2026-11-08T14:30", "date")).toBeDefined();
    expect(lossNote(["a", "b"], "number")).toBeDefined();
  });

  it("reads a new field's first value as the type it is written in", () => {
    expect(inferValue("12")).toBe(12);
    expect(inferValue("-3.5")).toBe(-3.5);
    expect(inferValue("True")).toBe(true);
    expect(inferValue("007")).toBe("007");
    expect(inferValue("12 pts")).toBe("12 pts");
    expect(kindOf(inferValue("2026-11-08"))).toBe("date");
    expect(kindOf(inferValue("2026-11-08 14:30"))).toBe("datetime");
  });
});
