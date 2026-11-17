import { describe, expect, it } from "vitest";

import { safeRedirect } from "./guard";

describe("safeRedirect", () => {
  it("allows internal relative paths", () => {
    expect(safeRedirect("/s/sp-1/b/b-1")).toBe("/s/sp-1/b/b-1");
    expect(safeRedirect("/")).toBe("/");
  });

  it("rejects protocol-relative, external, and non-string targets", () => {
    expect(safeRedirect("//evil.com")).toBe("/");
    expect(safeRedirect("https://evil.com")).toBe("/");
    expect(safeRedirect("javascript:alert(1)")).toBe("/");
    expect(safeRedirect(undefined)).toBe("/");
    expect(safeRedirect(123)).toBe("/");
  });
});
