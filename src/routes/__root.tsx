import { Text } from "@mantine/core";
import { Outlet, createRootRoute } from "@tanstack/react-router";

import { AppShell } from "../shared/components/AppShell";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function NotFound() {
  return <Text>Not found.</Text>;
}
