import { describe, expect, it } from "vitest";

import type { BoardData } from "../types";
import { fieldsOn, rewriteProps, rewriteValues } from "./dropdowns";

const card = (id: string, props: BoardData["cards"][number]["props"]) => ({
  id,
  columnId: "c",
  title: id,
  body: "",
  props,
  order: "a0",
  createdAt: 1,
  updatedAt: 1,
});

describe("dropdown lists", () => {
  it("finds the fields on a list", () => {
    const links = { Priority: "Level", Severity: "Level", Owner: "People" };
    expect(fieldsOn(links, "Level")).toEqual(["Priority", "Severity"]);
  });

  it("renames or clears a value in the fields given, and only there", () => {
    const props = { Priority: "High", Severity: "High", Note: "High" };
    expect(
      rewriteProps(props, ["Priority", "Severity"], "High", "Urgent"),
    ).toEqual({ Priority: "Urgent", Severity: "Urgent", Note: "High" });
    expect(rewriteProps(props, ["Priority"], "High", "")).toEqual({
      Priority: "",
      Severity: "High",
      Note: "High",
    });
  });

  it("patches only the cards that hold the value", () => {
    const data: BoardData = {
      columns: [],
      cards: [card("a", { Priority: "High" }), card("b", { Priority: "Low" })],
    };
    const patch = rewriteValues(data, ["Priority"], "High", "Urgent", 5);
    expect(patch.cards.map(item => item.id)).toEqual(["a"]);
    expect(patch.cards[0]?.props).toEqual({ Priority: "Urgent" });
    expect(rewriteValues(data, ["Priority"], "High", "High").cards).toEqual([]);
  });
});

describe("dropdowns that take several options", () => {
  it("renames, removes and de-duplicates inside a list", () => {
    const props = { Tags: ["a", "b", "c"], Note: ["a"] };
    expect(rewriteProps(props, ["Tags"], "b", "x")).toEqual({
      Tags: ["a", "x", "c"],
      Note: ["a"],
    });
    expect(rewriteProps(props, ["Tags"], "b", "")).toEqual({
      Tags: ["a", "c"],
      Note: ["a"],
    });
    expect(rewriteProps(props, ["Tags"], "b", "c")).toEqual({
      Tags: ["a", "c"],
      Note: ["a"],
    });
  });

  it("patches the cards that hold the option among several", () => {
    const data: BoardData = {
      columns: [],
      cards: [card("a", { Tags: ["x", "y"] }), card("b", { Tags: ["z"] })],
    };
    const patch = rewriteValues(data, ["Tags"], "y", "", 5);
    expect(patch.cards?.map(item => item.id)).toEqual(["a"]);
    expect(patch.cards?.[0]?.props).toEqual({ Tags: ["x"] });
  });
});
