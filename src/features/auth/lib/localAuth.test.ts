import { describe, expect, it } from "vitest";

import type { KV } from "../../../shared/lib/localUsers";
import {
  isValidEmail,
  localSignIn,
  localSignOut,
  localSignUp,
  readLocalSession,
} from "./localAuth";

function fakeStore(): KV {
  const data = new Map<string, string>();
  return {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: key => {
      data.delete(key);
    },
  };
}

describe("isValidEmail", () => {
  it("accepts normal addresses and rejects malformed ones", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("1@1")).toBe(false);
    expect(isValidEmail("no-at.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("local accounts", () => {
  it("rejects invalid emails and short passwords on sign-up", async () => {
    const store = fakeStore();
    await expect(localSignUp("A", "1@1", "123456", store)).rejects.toThrow(
      /invalid-email/,
    );
    await expect(localSignUp("A", "a@b.co", "1", store)).rejects.toThrow(
      /weak-password/,
    );
  });

  it("signs up, signs out and signs back in with the right password", async () => {
    const store = fakeStore();
    const created = await localSignUp("Ada", "Ada@Test.io", "secret1", store);
    expect(created.displayName).toBe("Ada");
    expect(readLocalSession(store)?.uid).toBe(created.uid);

    localSignOut(store);
    expect(readLocalSession(store)).toBeNull();

    const back = await localSignIn("ada@test.io", "secret1", store);
    expect(back.uid).toBe(created.uid);
  });

  it("only lets created accounts sign in, with Firebase's error codes", async () => {
    const store = fakeStore();
    await localSignUp("Ada", "ada@test.io", "secret1", store);
    await expect(localSignIn("ada@test.io", "wrong-pw", store)).rejects.toThrow(
      /invalid-credential/,
    );
    await expect(
      localSignIn("nobody@test.io", "secret1", store),
    ).rejects.toThrow(/invalid-credential/);
    await expect(localSignIn("1@1", "1", store)).rejects.toThrow(
      /invalid-email/,
    );
  });

  it("rejects a second sign-up with the same email", async () => {
    const store = fakeStore();
    await localSignUp("Ada", "ada@test.io", "secret1", store);
    await expect(
      localSignUp("Other", "ADA@test.io", "secret2", store),
    ).rejects.toThrow(/email-already-in-use/);
  });
});
