import { createFileRoute } from "@tanstack/react-router";

import { GuestLinkPage } from "../features/share/components/GuestLinkPage";

export const Route = createFileRoute("/g/$token")({
  component: GuestLinkPage,
});
