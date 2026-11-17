import { initAuth, useAuthStore } from "../stores/authStore";

export { type AuthStatus, type AuthUser } from "../lib/types";

export function useAuth() {
  const status = useAuthStore(state => state.status);
  const user = useAuthStore(state => state.user);
  const error = useAuthStore(state => state.error);
  const busy = useAuthStore(state => state.busy);
  const clearError = useAuthStore(state => state.clearError);
  const signInWithEmail = useAuthStore(state => state.signInWithEmail);
  const signUpWithEmail = useAuthStore(state => state.signUpWithEmail);
  const signInWithGoogle = useAuthStore(state => state.signInWithGoogle);
  const signInLocal = useAuthStore(state => state.signInLocal);
  const signOut = useAuthStore(state => state.signOut);

  return {
    status,
    user,
    error,
    busy,
    clearError,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInLocal,
    signOut,
  };
}

export function waitForAuth() {
  return initAuth();
}
