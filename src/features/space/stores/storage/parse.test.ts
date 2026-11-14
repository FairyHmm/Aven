import { describe, expect, it } from "vitest";

import { toBoard, toSpace } from "./parse";

describe("toSpace", () => {
  it("parses valid space documents including settings and members", () => {
    const space = toSpace("sp-1", {
      name: "Engineering",
      ownerId: "u1",
      memberIds: ["u1", 42, "u2"],
      members: {
        u1: {
          uid: "u1",
          email: "a@example.com",
          displayName: "Alice",
          photoURL: null,
          role: "owner",
          addedAt: 100,
        },
        u2: {
          email: "b@example.com",
          role: "invalid-role",
        },
      },
      tagColors: { bug: "rose", ok: 123 },
      fieldConfig: {
        lists: { Priority: ["High", "Low", 99] },
        links: { Repo: "https://example.com" },
        colors: { Priority: { High: "rose" } },
      },
      createdAt: 10,
      updatedAt: 20,
    });

    expect(space).toEqual({
      id: "sp-1",
      name: "Engineering",
      ownerId: "u1",
      memberIds: ["u1", "u2"],
      members: {
        u1: {
          uid: "u1",
          email: "a@example.com",
          displayName: "Alice",
          photoURL: null,
          role: "owner",
          addedAt: 100,
        },
        u2: {
          uid: "u2",
          email: "b@example.com",
          displayName: "User",
          photoURL: null,
          role: "viewer",
          addedAt: 0,
        },
      },
      tagColors: { bug: "rose" },
      fieldConfig: {
        lists: { Priority: ["High", "Low"] },
        links: { Repo: "https://example.com" },
        colors: { Priority: { High: "rose" } },
      },
      createdAt: 10,
      updatedAt: 20,
    });
  });

  it("falls back safely when fields are missing or malformed", () => {
    expect(toSpace("sp-2", {})).toEqual({
      id: "sp-2",
      name: "Untitled space",
      ownerId: "",
      memberIds: [],
      members: {},
      createdAt: 0,
      updatedAt: 0,
    });
  });
});

describe("toBoard", () => {
  it("parses board fields and uses defaults when absent", () => {
    expect(
      toBoard("sp-1", "b-1", {
        name: "Roadmap",
        order: "a1",
        createdAt: 5,
        updatedAt: 6,
      }),
    ).toEqual({
      id: "b-1",
      spaceId: "sp-1",
      name: "Roadmap",
      order: "a1",
      createdAt: 5,
      updatedAt: 6,
    });

    expect(toBoard("sp-1", "b-2", {})).toEqual({
      id: "b-2",
      spaceId: "sp-1",
      name: "Untitled board",
      order: "a0",
      createdAt: 0,
      updatedAt: 0,
    });
  });
});
