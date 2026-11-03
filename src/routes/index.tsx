import { createFileRoute } from "@tanstack/react-router";

import { SpacesPage } from "../features/space/components/SpacesPage";

export const Route = createFileRoute("/")({
  component: SpacesPage,
});
