import { createFileRoute } from "@tanstack/react-router";

import { SpaceLayout } from "../features/space/components/SpaceLayout";

export const Route = createFileRoute("/s/$spaceId")({
  component: SpaceLayout,
});
