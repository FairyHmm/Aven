import { AppShell as MantineAppShell, Group, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <MantineAppShell header={{ height: 48 }} padding="md">
      <MantineAppShell.Header>
        <Group h="100%" px="md">
          <Title order={4}>
            <Link to="/">Aven</Link>
          </Title>
        </Group>
      </MantineAppShell.Header>
      <MantineAppShell.Main>{children}</MantineAppShell.Main>
    </MantineAppShell>
  );
}
