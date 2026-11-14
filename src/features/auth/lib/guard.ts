import { redirect } from "@tanstack/react-router";

import { waitForAuth } from "../hooks/useAuth";

export function safeRedirect(target: unknown): string {
  if (
    typeof target === "string" &&
    target.startsWith("/") &&
    !target.startsWith("//")
  ) {
    return target;
  }
  return "/";
}

export async function requireAuth(locationHref: string): Promise<void> {
  const user = await waitForAuth();
  if (user === null) {
    throw redirect({
      to: "/login",
      search: { redirect: safeRedirect(locationHref) },
      replace: true,
    });
  }
}

export async function redirectIfSignedIn(target: unknown): Promise<void> {
  const user = await waitForAuth();
  if (user !== null) {
    throw redirect({
      to: safeRedirect(target),
      replace: true,
    });
  }
}
