import { create } from "zustand";

import { STORAGE_MODE } from "../../../shared/lib/storageMode";
import {
  emailSignIn,
  emailSignUp,
  firebaseSignOut,
  googleSignIn,
  subscribeAuth,
} from "../lib/firebaseAuth";
import type { AuthStatus, AuthUser } from "../lib/types";

const LOCAL_OUT_KEY = "aven:local-signed-out";

export const LOCAL_USER: AuthUser = {
  uid: "local-user",
  email: "local@aven.app",
  displayName: "Local User",
  photoURL: null,
};

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | undefined;
  busy: boolean;
  clearError: () => void;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (
    displayName: string,
    email: string,
    password: string,
  ) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signInLocal: (name?: string) => void;
  signOut: () => Promise<void>;
};

function describeAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/invalid-credential|wrong-password|user-not-found/i.test(message)) {
    return "Invalid email or password.";
  }
  if (/email-already-in-use/i.test(message)) {
    return "An account with this email already exists.";
  }
  if (/weak-password/i.test(message)) {
    return "Password must be at least 6 characters.";
  }
  if (/popup-closed-by-user/i.test(message)) {
    return "Sign-in window was closed before completing.";
  }
  return message;
}

function isLocalSignedOut(): boolean {
  try {
    return sessionStorage.getItem(LOCAL_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

function setLocalSignedOut(out: boolean): void {
  try {
    if (out) {
      sessionStorage.setItem(LOCAL_OUT_KEY, "1");
    } else {
      sessionStorage.removeItem(LOCAL_OUT_KEY);
    }
  } catch {
    // Ignore storage errors in restricted environments.
  }
}

export const useAuthStore = create<AuthState>()(set => {
  const run = async (task: () => Promise<AuthUser>): Promise<boolean> => {
    set({ busy: true, error: undefined });
    try {
      const user = await task();
      set({ user, status: "authenticated", busy: false });
      return true;
    } catch (error: unknown) {
      set({ error: describeAuthError(error), busy: false });
      return false;
    }
  };

  return {
    status: "loading",
    user: null,
    error: undefined,
    busy: false,
    clearError: () => {
      set({ error: undefined });
    },
    signInWithEmail: (email, password) =>
      run(() => emailSignIn(email, password)),
    signUpWithEmail: (displayName, email, password) =>
      run(() => emailSignUp(displayName, email, password)),
    signInWithGoogle: () => run(() => googleSignIn()),
    signInLocal: name => {
      setLocalSignedOut(false);
      const trimmed = name?.trim();
      set({
        status: "authenticated",
        user:
          trimmed !== undefined && trimmed !== ""
            ? { ...LOCAL_USER, displayName: trimmed }
            : LOCAL_USER,
        error: undefined,
      });
    },
    signOut: async () => {
      if (STORAGE_MODE === "local") {
        setLocalSignedOut(true);
        set({ status: "unauthenticated", user: null, error: undefined });
        return;
      }
      set({ busy: true, error: undefined });
      try {
        await firebaseSignOut();
        set({ status: "unauthenticated", user: null, busy: false });
      } catch (error: unknown) {
        set({ error: describeAuthError(error), busy: false });
      }
    },
  };
});

let readyPromise: Promise<AuthUser | null> | undefined;

export function initAuth(): Promise<AuthUser | null> {
  if (readyPromise !== undefined) {
    return readyPromise;
  }
  if (STORAGE_MODE === "local") {
    const signedOut = isLocalSignedOut();
    const user = signedOut ? null : LOCAL_USER;
    useAuthStore.setState({
      status: signedOut ? "unauthenticated" : "authenticated",
      user,
    });
    readyPromise = Promise.resolve(user);
    return readyPromise;
  }
  readyPromise = new Promise<AuthUser | null>(resolve => {
    let settled = false;
    void subscribeAuth(user => {
      useAuthStore.setState({
        status: user === null ? "unauthenticated" : "authenticated",
        user,
      });
      if (!settled) {
        settled = true;
        resolve(user);
      }
    }).catch((error: unknown) => {
      useAuthStore.setState({
        status: "unauthenticated",
        user: null,
        error: describeAuthError(error),
      });
      if (!settled) {
        settled = true;
        resolve(null);
      }
    });
  });
  return readyPromise;
}
