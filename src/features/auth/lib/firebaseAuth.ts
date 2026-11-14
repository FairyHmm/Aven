import type { User } from "firebase/auth";

import type { AuthUser } from "./types";

async function sdk() {
  const [{ auth, firestore }, fbAuth, fbStore] = await Promise.all([
    import("../../../shared/lib/firebase/app"),
    import("firebase/auth"),
    import("firebase/firestore"),
  ]);
  return { auth, firestore, fbAuth, fbStore };
}

export function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName ?? user.email?.split("@")[0] ?? "User",
    photoURL: user.photoURL,
  };
}

export async function syncUserProfile(user: AuthUser): Promise<void> {
  if (user.email === null) {
    return;
  }
  const { firestore, fbStore } = await sdk();
  await fbStore.setDoc(
    fbStore.doc(firestore, "users", user.uid),
    {
      uid: user.uid,
      email: user.email,
      emailLower: user.email.toLowerCase(),
      displayName: user.displayName ?? user.email.split("@")[0] ?? "User",
      photoURL: user.photoURL,
      updatedAt: Date.now(),
    },
    { merge: true },
  );
}

export async function subscribeAuth(
  onUser: (user: AuthUser | null) => void,
): Promise<() => void> {
  const { auth, fbAuth } = await sdk();
  return fbAuth.onAuthStateChanged(auth, raw => {
    if (raw === null) {
      onUser(null);
      return;
    }
    const mapped = toAuthUser(raw);
    void syncUserProfile(mapped).catch(() => {
      // Best-effort profile sync; auth state itself stays valid.
    });
    onUser(mapped);
  });
}

export async function emailSignIn(
  email: string,
  password: string,
): Promise<AuthUser> {
  const { auth, fbAuth } = await sdk();
  const cred = await fbAuth.signInWithEmailAndPassword(auth, email, password);
  const mapped = toAuthUser(cred.user);
  await syncUserProfile(mapped);
  return mapped;
}

export async function emailSignUp(
  displayName: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  const { auth, fbAuth } = await sdk();
  const cred = await fbAuth.createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const name = displayName.trim();
  if (name !== "") {
    await fbAuth.updateProfile(cred.user, { displayName: name });
  }
  const mapped: AuthUser = {
    ...toAuthUser(cred.user),
    displayName: name !== "" ? name : toAuthUser(cred.user).displayName,
  };
  await syncUserProfile(mapped);
  return mapped;
}

export async function googleSignIn(): Promise<AuthUser> {
  const { auth, fbAuth } = await sdk();
  const provider = new fbAuth.GoogleAuthProvider();
  const cred = await fbAuth.signInWithPopup(auth, provider);
  const mapped = toAuthUser(cred.user);
  await syncUserProfile(mapped);
  return mapped;
}

export async function firebaseSignOut(): Promise<void> {
  const { auth, fbAuth } = await sdk();
  await fbAuth.signOut(auth);
}
