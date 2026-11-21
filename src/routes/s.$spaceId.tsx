import { createFileRoute } from "@tanstack/react-router";

import { requireAuth } from "../features/auth/lib/guard";
import { SpaceLayout } from "../features/space/components/SpaceLayout";
import { warmSpace } from "../features/space/hooks/useSpaces";

export const Route = createFileRoute("/s/$spaceId")({
  beforeLoad: ({ location }) => requireAuth(location.href),
  loader: ({ params }) => {
    warmSpace(params.spaceId);
  },
  component: SpaceLayout,
});
