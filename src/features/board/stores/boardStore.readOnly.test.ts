import { beforeEach, describe, expect, it, vi } from "vitest";

const { apply } = vi.hoisted(() => ({
  apply: vi.fn(() => Promise.resolve()),
}));

vi.mock("./storage", () => ({
  storage: { apply, load: vi.fn(), subscribe: undefined },
}));
vi.mock("../../../shared/lib/dnd/flip", () => ({ captureLayout: vi.fn() }));
vi.mock("../../../shared/lib/dnd/glide", () => ({
  ghostOut: vi.fn(),
}));

import { useBoardStore } from "./boardStore";

const ref = { spaceId: "s", boardId: "b" };

// Writes go through a queue, so let it run before looking at what was written.
const settle = () => new Promise(resolve => setTimeout(resolve, 0));

function open(canEdit: boolean) {
  useBoardStore.setState({
    ref,
    columns: [],
    cards: [],
    status: "ready",
    pending: 0,
    error: undefined,
  });
  useBoardStore.getState().actions.setCanEdit(canEdit);
}

describe("board store, read-only", () => {
  beforeEach(() => {
    apply.mockClear();
  });

  it("starts out unable to change anything, until the role is known", () => {
    expect(useBoardStore.getInitialState().canEdit).toBe(false);
  });

  it("ignores every change for someone who may only read", async () => {
    open(false);
    const { actions } = useBoardStore.getState();
    actions.addColumn("To do");
    await settle();
    expect(useBoardStore.getState().columns).toHaveLength(0);
    expect(apply).not.toHaveBeenCalled();
  });

  it("lets owners and editors change the board, and writes it", async () => {
    open(true);
    useBoardStore.getState().actions.addColumn("To do");
    await settle();
    expect(useBoardStore.getState().columns).toHaveLength(1);
    expect(apply).toHaveBeenCalledTimes(1);
  });

  it("stops writing as soon as the role drops to viewer", async () => {
    open(true);
    const { actions } = useBoardStore.getState();
    actions.addColumn("One");
    actions.setCanEdit(false);
    actions.addColumn("Two");
    await settle();
    expect(useBoardStore.getState().columns).toHaveLength(1);
    expect(apply).toHaveBeenCalledTimes(1);
  });
});
