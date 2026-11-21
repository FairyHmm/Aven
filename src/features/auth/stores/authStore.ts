import { create } from "zustand";

import { STORAGE_MODE } from "../../../shared/lib/storageMode";
import {
  emailSignIn,
  emailSignUp,
  firebaseSignOut,
  googleSignIn,
  subscribeAuth,
} from "../lib/firebaseAuth";
import {
  GUEST_USER,
  SESSION_KEY,
  localSignIn,
  localSignInGuest,
  localSignOut,
  localSignUp,
  readLocalSession,
} from "../lib/localAuth";
import type { AuthStatus, AuthUser } from "../lib/types";

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | undefined;
  busy: boolean;
  // Set when an account was just created (or a trial started), so the app can
  // give it the guide space once; cleared by whoever acts on it.
  welcomeUid: string | null;
  clearError: () => void;
  clearWelcome: () => void;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (
    displayName: string,
    email: string,
    password: string,
  ) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signInGuest: () => void;
  signOut: () => Promise<void>;
};

function describeAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/invalid-email/i.test(message)) {
    return "Enter a valid email address.";
  }
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

const isLocal = STORAGE_MODE === "local";

export const useAuthStore = create<AuthState>()(set => {
  const run = async (
    task: () => Promise<{ user: AuthUser; isNew: boolean }>,
  ): Promise<boolean> => {
    set({ busy: true, error: undefined });
    try {
      const { user, isNew } = await task();
      set({
        user,
        status: "authenticated",
        busy: false,
        welcomeUid: isNew ? user.uid : null,
      });
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
    welcomeUid: null,
    clearError: () => {
      set({ error: undefined });
    },
    clearWelcome: () => {
      set({ welcomeUid: null });
    },
    signInWithEmail: (email, password) =>
      run(async () => ({
        user: await (isLocal
          ? localSignIn(email, password)
          : emailSignIn(email, password)),
        isNew: false,
      })),
    signUpWithEmail: (displayName, email, password) =>
      run(async () => ({
        user: await (isLocal
          ? localSignUp(displayName, email, password)
          : emailSignUp(displayName, email, password)),
        isNew: true,
      })),
    signInWithGoogle: () => run(() => googleSignIn()),
    signInGuest: () => {
      localSignInGuest();
      set({
        user: GUEST_USER,
        status: "authenticated",
        error: undefined,
        welcomeUid: GUEST_USER.uid,
      });
    },
    signOut: async () => {
      if (isLocal) {
        localSignOut();
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
  if (isLocal) {
    const apply = (user: AuthUser | null) => {
      useAuthStore.setState({
        status: user === null ? "unauthenticated" : "authenticated",
        user,
      });
    };
    const user = readLocalSession();
    apply(user);
    // Like Firebase, a sign-in or sign-out in another tab is picked up here.
    window.addEventListener("storage", event => {
      if (event.key === SESSION_KEY || event.key === null) {
        apply(readLocalSession());
      }
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
