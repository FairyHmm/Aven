import { createFileRoute } from "@tanstack/react-router";

import { requireAuth } from "../features/auth/lib/guard";
import { SpaceLayout } from "../features/space/components/SpaceLayout";

export const Route = createFileRoute("/s/$spaceId")({
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: SpaceLayout,
});
