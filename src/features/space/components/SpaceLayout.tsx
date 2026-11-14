import { Box, Group, Text } from "@mantine/core";
import { Outlet, useParams } from "@tanstack/react-router";

import { CrossFade } from "../../board/components/CrossFade";
import { useSpace } from "../hooks/useSpaces";
import { SpaceSidebar } from "./SpaceSidebar";

// Space layout: sidebar of boards plus the board surface. Routes mount
// this shell and hand it the outlet.
export function SpaceLayout() {
  const { spaceId } = useParams({ from: "/s/$spaceId" });
  const { space, loading } = useSpace(spaceId);

  if (space === undefined) {
    return (
      <Text c="dimmed">{loading ? "Loading space…" : "Space not found."}</Text>
    );
  }

  return (
    <Group align="flex-start" gap="lg" wrap="nowrap">
      <SpaceSidebar space={space} />

      <Box style={{ flex: 1, minWidth: 0 }}>
        <CrossFade>
          <Outlet />
        </CrossFade>
      </Box>
    </Group>
  );
}
