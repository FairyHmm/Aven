import { createFileRoute } from "@tanstack/react-router";

import { LoginPage } from "../features/auth/components/LoginPage";
import { redirectIfSignedIn } from "../features/auth/lib/guard";

type LoginSearch = { redirect?: string | undefined };

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch =>
    typeof search.redirect === "string" ? { redirect: search.redirect } : {},
  beforeLoad: ({ search }) => redirectIfSignedIn(search.redirect),
  component: LoginPage,
});
