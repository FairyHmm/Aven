import { AppShell, Text } from "@mantine/core";
import {
  Outlet,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";

import { AppHeader } from "../app/AppHeader";
import { prefetchApp } from "../app/prefetchApp";
import { WelcomeGate } from "../features/welcome/components/WelcomeGate";
import { PageFade } from "../shared/components/PageFade";

export const Route = createRootRoute({
  loader: () => {
    prefetchApp();
  },
  component: RootLayout,
  notFoundComponent: NotFound,
});

// Which kind of page is showing; a new kind fades in (boards have their own
// cross-fade, so moving between boards doesn't count).
function pageOf(pathname: string): string {
  if (pathname.startsWith("/login")) return "login";
  if (pathname.startsWith("/s/")) return "space";
  if (pathname.startsWith("/g/")) return "guest";
  return "home";
}

function RootLayout() {
  const page = useRouterState({ select: s => pageOf(s.location.pathname) });
  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <AppHeader />
      </AppShell.Header>
      <AppShell.Main>
        <PageFade page={page}>
          <Outlet />
        </PageFade>
      </AppShell.Main>
      <WelcomeGate />
    </AppShell>
  );
}

function NotFound() {
  return <Text>Not found.</Text>;
}
