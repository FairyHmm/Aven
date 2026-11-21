import { AppShell, Text } from "@mantine/core";
import { Outlet, createRootRoute } from "@tanstack/react-router";

import { AppHeader } from "../app/AppHeader";
import { WelcomeGate } from "../features/welcome/components/WelcomeGate";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <AppHeader />
      </AppShell.Header>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
      <WelcomeGate />
    </AppShell>
  );
}

function NotFound() {
  return <Text>Not found.</Text>;
}
