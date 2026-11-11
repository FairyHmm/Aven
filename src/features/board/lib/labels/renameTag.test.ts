import { describe, expect, it } from "vitest";

import { applyPatch } from "../patch";
import { tagsOf } from "../props/defaults";
import { seedBoard } from "../seed";
import { renameTag } from "./renameTag";

describe("renameTag", () => {
  it("rewrites the cards that carry the tag, and only those", () => {
    const data = seedBoard(1);
    const next = applyPatch(data, renameTag(data, "design", "ux", 9));
    const before = data.cards.filter(card =>
      tagsOf(card.props).includes("design"),
    );
    expect(before.length).toBeGreaterThan(0);
    for (const card of next.cards) {
      expect(tagsOf(card.props)).not.toContain("design");
    }
    expect(
      next.cards.filter(card => tagsOf(card.props).includes("ux")),
    ).toHaveLength(before.length);
    expect(next.cards.filter(card => card.updatedAt === 9)).toHaveLength(
      before.length,
    );
  });

  it("does nothing when the name is the same", () => {
    const data = seedBoard(1);
    expect(renameTag(data, "design", "design").cards ?? []).toHaveLength(0);
  });
});
