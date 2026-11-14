import { createFileRoute } from "@tanstack/react-router";

import { requireAuth } from "../features/auth/lib/guard";
import { SpacesPage } from "../features/space/components/SpacesPage";

export const Route = createFileRoute("/")({
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: SpacesPage,
});
