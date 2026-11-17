import { describe, expect, it } from "vitest";

import { addAttachment, formatBytes, removeAttachment } from "./attachments";
import { patchOf } from "./patch";
import type { Attachment, BoardData } from "./types";

const sampleData = (attachments?: Attachment[]): BoardData => ({
  columns: [{ id: "col-1", name: "Todo", accent: "indigo", order: "a0" }],
  cards: [
    {
      id: "card-1",
      columnId: "col-1",
      title: "Task",
      props: {},
      body: "",
      order: "a0",
      ...(attachments !== undefined ? { attachments } : {}),
      createdAt: 100,
      updatedAt: 100,
    },
  ],
});

const item: Attachment = {
  id: "att-1",
  name: "spec.pdf",
  size: 2048,
  contentType: "application/pdf",
  url: "https://example.com/spec.pdf",
  storagePath: "spaces/s1/boards/b1/cards/card-1/att-1-spec.pdf",
  uploadedBy: "u1",
  uploadedAt: 200,
};

describe("attachments", () => {
  it("adds an attachment and updates timestamp", () => {
    const patch = addAttachment(sampleData(), "card-1", item, 500);
    expect(patch.cards?.[0]?.attachments).toEqual([item]);
    expect(patch.cards?.[0]?.updatedAt).toBe(500);
  });

  it("returns empty patch when adding to a missing card", () => {
    expect(addAttachment(sampleData(), "missing", item, 500)).toEqual(
      patchOf(),
    );
  });

  it("removes the attachment and drops the field when empty", () => {
    const patch = removeAttachment(sampleData([item]), "card-1", "att-1", 600);
    expect(patch.cards?.[0]?.attachments).toBeUndefined();
    expect(patch.cards?.[0]?.updatedAt).toBe(600);
  });

  it("keeps remaining attachments when removing one of several", () => {
    const second: Attachment = { ...item, id: "att-2", name: "img.png" };
    const patch = removeAttachment(
      sampleData([item, second]),
      "card-1",
      "att-1",
      700,
    );
    expect(patch.cards?.[0]?.attachments).toEqual([second]);
  });

  it("formats byte sizes cleanly", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(2 * 1024 * 1024)).toBe("2.0 MB");
  });
});
