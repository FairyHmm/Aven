import { Group, Text, ThemeIcon } from "@mantine/core";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { House } from "lucide-react";

import { findSpace } from "../shared/lib/fixtures";

// App chrome: home icon plus the current space, or the app name at the root.
export function AppHeader() {
  const matchRoute = useMatchRoute();
  const match = matchRoute({ to: "/s/$spaceId", fuzzy: true });
  const space = match === false ? undefined : findSpace(match.spaceId);

  return (
    <Group h="100%" px="md" gap="sm" wrap="nowrap">
      {/* Placeholder icon until the real mark exists. */}
      <Link to="/" aria-label="Home">
        <ThemeIcon variant="light" size="lg" radius="md">
          <House size={18} />
        </ThemeIcon>
      </Link>

      <Text fw={700}>{space === undefined ? "Aven" : space.name}</Text>
    </Group>
  );
}
