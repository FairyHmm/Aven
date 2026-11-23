import { describe, expect, it } from "vitest";

import {
  type History,
  type HistoryEntry,
  HISTORY_SIZE,
  invertPatch,
  MERGE_WITHIN_MS,
  NO_HISTORY,
  record,
  stepBack,
  stepForward,
} from "./history";
import { addCard, editCard, removeColumn } from "./mutations";
import { applyPatch, patchOf } from "./patch";
import { seedBoard } from "./seed";

const ids = (items: { id: string }[]) =>
  items
    .map(item => item.id)
    .sort()
    .join();

describe("invertPatch", () => {
  it("brings back an edited card as it was", () => {
    const data = seedBoard(1);
    const [card] = data.cards;
    const patch = editCard(data, card.id, { title: "Changed", body: "x" });
    const after = applyPatch(data, patch);
    const back = applyPatch(after, invertPatch(data, patch));
    expect(back.cards.find(item => item.id === card.id)).toEqual(card);
  });

  it("removes what the change created", () => {
    const data = seedBoard(1);
    const patch = addCard(data, data.columns[0].id, "New one");
    const after = applyPatch(data, patch);
    expect(after.cards).toHaveLength(data.cards.length + 1);
    const back = applyPatch(after, invertPatch(data, patch));
    expect(ids(back.cards)).toBe(ids(data.cards));
  });

  it("brings back a deleted column with all its cards", () => {
    const data = seedBoard(1);
    const patch = removeColumn(data, data.columns[0].id);
    const after = applyPatch(data, patch);
    expect(after.columns).toHaveLength(data.columns.length - 1);
    const back = applyPatch(after, invertPatch(data, patch));
    expect(ids(back.columns)).toBe(ids(data.columns));
    expect(ids(back.cards)).toBe(ids(data.cards));
  });

  it("is empty for a change that touched nothing", () => {
    const undo = invertPatch(seedBoard(1), patchOf());
    expect(undo.cards).toHaveLength(0);
    expect(undo.removeCards).toHaveLength(0);
  });
});

const entry = (label: string, at: number, key?: string): HistoryEntry => ({
  label,
  undo: patchOf(),
  redo: patchOf(),
  key,
  at,
});

describe("history", () => {
  it("steps back and forward between the stacks", () => {
    const one = record(NO_HISTORY, entry("a", 0));
    const two = record(one, entry("b", 5000));
    const back = stepBack(two);
    expect(back.undo.map(item => item.label)).toEqual(["a"]);
    expect(back.redo.map(item => item.label)).toEqual(["b"]);
    expect(stepForward(back)).toEqual(two);
  });

  it("does nothing when there is nothing to step to", () => {
    expect(stepBack(NO_HISTORY)).toBe(NO_HISTORY);
    expect(stepForward(NO_HISTORY)).toBe(NO_HISTORY);
  });

  it("forgets what could be redone once something new happens", () => {
    const back = stepBack(record(NO_HISTORY, entry("a", 0)));
    expect(back.redo).toHaveLength(1);
    expect(record(back, entry("b", 9000)).redo).toHaveLength(0);
  });

  it("joins quick changes with the same key into one step", () => {
    const typed = ["a", "b", "c"].reduce<History>(
      (history, label, index) =>
        record(history, entry(label, index * 100, "edit:1")),
      NO_HISTORY,
    );
    expect(typed.undo).toHaveLength(1);
    expect(typed.undo[0]?.label).toBe("a");
  });

  it("keeps changes apart when the key differs or time has passed", () => {
    const first = record(NO_HISTORY, entry("a", 0, "edit:1"));
    expect(record(first, entry("b", 10, "edit:2")).undo).toHaveLength(2);
    expect(
      record(first, entry("b", MERGE_WITHIN_MS + 1, "edit:1")).undo,
    ).toHaveLength(2);
    expect(record(first, entry("b", 10)).undo).toHaveLength(2);
  });

  it("keeps only the most recent steps", () => {
    let history = NO_HISTORY;
    for (let index = 0; index < HISTORY_SIZE + 10; index += 1) {
      history = record(history, entry(String(index), index * 10_000));
    }
    expect(history.undo).toHaveLength(HISTORY_SIZE);
    expect(history.undo.at(-1)?.label).toBe(String(HISTORY_SIZE + 9));
  });
});
