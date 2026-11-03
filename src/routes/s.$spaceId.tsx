import { Outlet, createFileRoute } from "@tanstack/react-router";

// Space layout: sidebar, tab bar and the per-space subscriptions go here.
export const Route = createFileRoute("/s/$spaceId")({
  component: SpaceLayout,
});

function SpaceLayout() {
  return <Outlet />;
}
