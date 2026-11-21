// Local stand-in for Firebase's `users` collection and auth accounts, used
// only when STORAGE_MODE is "local". Passwords are salted+hashed, but this is
// a dev convenience stored in the browser, not real security.

export type KV = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type LocalAccount = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  salt: string;
  hash: string;
  createdAt: number;
};

export const USERS_KEY = "aven:v1:auth:users";

function toAccount(row: unknown): LocalAccount | undefined {
  if (typeof row !== "object" || row === null) return undefined;
  const r: Record<string, unknown> = Object.fromEntries(Object.entries(row));
  const { uid, email, displayName, salt, hash } = r;
  if (
    typeof uid !== "string" ||
    typeof email !== "string" ||
    typeof displayName !== "string" ||
    typeof salt !== "string" ||
    typeof hash !== "string"
  ) {
    return undefined;
  }
  return {
    uid,
    email,
    displayName,
    photoURL: typeof r.photoURL === "string" ? r.photoURL : null,
    salt,
    hash,
    createdAt: typeof r.createdAt === "number" ? r.createdAt : 0,
  };
}

export function readAccounts(store: KV = localStorage): LocalAccount[] {
  try {
    const raw = store.getItem(USERS_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((row: unknown) => {
      const account = toAccount(row);
      return account === undefined ? [] : [account];
    });
  } catch {
    return [];
  }
}

export function writeAccounts(
  accounts: readonly LocalAccount[],
  store: KV = localStorage,
): void {
  store.setItem(USERS_KEY, JSON.stringify(accounts));
}

export function findAccountByEmail(
  email: string,
  store: KV = localStorage,
): LocalAccount | undefined {
  const clean = email.trim().toLowerCase();
  if (clean === "") return undefined;
  return readAccounts(store).find(a => a.email.toLowerCase() === clean);
}

export function findAccountByUid(
  uid: string,
  store: KV = localStorage,
): LocalAccount | undefined {
  return readAccounts(store).find(a => a.uid === uid);
}
