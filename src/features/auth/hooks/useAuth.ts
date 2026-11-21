import { initAuth, useAuthStore } from "../stores/authStore";

export { type AuthStatus, type AuthUser } from "../lib/types";

export function useAuth() {
  const status = useAuthStore(state => state.status);
  const user = useAuthStore(state => state.user);
  const error = useAuthStore(state => state.error);
  const busy = useAuthStore(state => state.busy);
  const clearError = useAuthStore(state => state.clearError);
  const welcomeUid = useAuthStore(state => state.welcomeUid);
  const clearWelcome = useAuthStore(state => state.clearWelcome);
  const signInGuest = useAuthStore(state => state.signInGuest);
  const signInWithEmail = useAuthStore(state => state.signInWithEmail);
  const signUpWithEmail = useAuthStore(state => state.signUpWithEmail);
  const signInWithGoogle = useAuthStore(state => state.signInWithGoogle);
  const signOut = useAuthStore(state => state.signOut);

  return {
    status,
    user,
    error,
    busy,
    clearError,
    welcomeUid,
    clearWelcome,
    signInGuest,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  };
}

// Resolves once the first auth state is known, then returns the *current* user
// from the store. initAuth() only resolves once, so returning its value would
// leave the route guards stuck on the state at page load (sign-in would bounce
// back to /login, sign-out would bounce back to the app).
export async function waitForAuth() {
  await initAuth();
  return useAuthStore.getState().user;
}
