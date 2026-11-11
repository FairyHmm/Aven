import { describe, expect, it } from "vitest";

import { progressOf } from "./progress";

describe("progressOf", () => {
  it("counts checked items out of all items", () => {
    expect(progressOf("- [x] a\n- [ ] b\n- [x] c")).toEqual({
      done: 2,
      total: 3,
    });
  });

  it("weighs in progress as half and unchecked as nothing", () => {
    const body = "- [x] a\n- [/] b\n1. [ ] c";
    expect(progressOf(body)).toEqual({ done: 1.5, total: 3 });
  });

  it("leaves important, question, rescheduled, scheduled, cancelled and note items out entirely", () => {
    const body =
      "- [x] a\n- [!] b\n- [?] c\n- [>] d\n- [<] e\n- [-] f\n- [n] g";
    expect(progressOf(body)).toEqual({ done: 1, total: 1 });
  });

  it("is empty when the notes only have marks", () => {
    expect(progressOf("- [!] a\n- [?] b\n- [n] c")).toEqual({
      done: 0,
      total: 0,
    });
  });

  it("reads nested items and items inside callouts", () => {
    expect(progressOf("- [x] a\n  - [ ] b\n> - [ ] c")).toEqual({
      done: 1,
      total: 3,
    });
  });

  it("ignores code fences and plain text", () => {
    const body = "```md\n- [ ] not a task\n```\n- [text]\nnotes";
    expect(progressOf(body)).toEqual({ done: 0, total: 0 });
  });
});
