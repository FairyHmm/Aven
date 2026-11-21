// Local-mode accounts that behave like Firebase email/password auth: the same
// validation, the same error codes, and only created accounts can sign in.
import { newId } from "../../../shared/lib/id";
import {
  type KV,
  type LocalAccount,
  findAccountByEmail,
  findAccountByUid,
  readAccounts,
  writeAccounts,
} from "../../../shared/lib/localUsers";
import type { AuthUser } from "./types";

export const SESSION_KEY = "aven:v1:auth:session";

// The no-account trial: one shared user whose data stays in this browser.
export const GUEST_USER: AuthUser = {
  uid: "local-user",
  email: null,
  displayName: "Guest",
  photoURL: null,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string): boolean =>
  EMAIL_PATTERN.test(email.trim());

async function hashPassword(salt: string, password: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), byte =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function toUser(account: LocalAccount): AuthUser {
  return {
    uid: account.uid,
    email: account.email,
    displayName: account.displayName,
    photoURL: account.photoURL,
  };
}

export async function localSignUp(
  displayName: string,
  email: string,
  password: string,
  store: KV = localStorage,
): Promise<AuthUser> {
  const clean = email.trim();
  if (!isValidEmail(clean)) throw new Error("auth/invalid-email");
  if (password.length < 6) throw new Error("auth/weak-password");
  if (findAccountByEmail(clean, store) !== undefined) {
    throw new Error("auth/email-already-in-use");
  }
  const salt = newId();
  const name = displayName.trim();
  const account: LocalAccount = {
    uid: newId(),
    email: clean,
    displayName: name !== "" ? name : (clean.split("@")[0] ?? clean),
    photoURL: null,
    salt,
    hash: await hashPassword(salt, password),
    createdAt: Date.now(),
  };
  writeAccounts([...readAccounts(store), account], store);
  store.setItem(SESSION_KEY, account.uid);
  return toUser(account);
}

export async function localSignIn(
  email: string,
  password: string,
  store: KV = localStorage,
): Promise<AuthUser> {
  if (!isValidEmail(email)) throw new Error("auth/invalid-email");
  const account = findAccountByEmail(email, store);
  // Same error for an unknown email and a wrong password, like Firebase.
  if (
    account === undefined ||
    account.hash !== (await hashPassword(account.salt, password))
  ) {
    throw new Error("auth/invalid-credential");
  }
  store.setItem(SESSION_KEY, account.uid);
  return toUser(account);
}

export function localSignInGuest(store: KV = localStorage): AuthUser {
  store.setItem(SESSION_KEY, GUEST_USER.uid);
  return GUEST_USER;
}

export function localSignOut(store: KV = localStorage): void {
  store.removeItem(SESSION_KEY);
}

export function readLocalSession(store: KV = localStorage): AuthUser | null {
  const uid = store.getItem(SESSION_KEY);
  if (uid === null) return null;
  if (uid === GUEST_USER.uid) return GUEST_USER;
  const account = findAccountByUid(uid, store);
  return account === undefined ? null : toUser(account);
}
