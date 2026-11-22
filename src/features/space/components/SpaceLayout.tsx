import { Box, Drawer, Group, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Outlet, useLocation, useParams } from "@tanstack/react-router";
import { useEffect } from "react";

import { CrossFade } from "../../board/components/CrossFade";
import { useSpace } from "../hooks/useSpaces";
import { NARROW, useBoardsDrawer } from "../stores/boardsDrawerStore";
import { SpaceSidebar } from "./SpaceSidebar";

// Space layout: the boards plus the board surface. Beside each other on a
// wide screen; on a narrow one the boards open as a drawer from the header,
// so the board gets the whole width. Routes mount this shell and hand it the
// outlet.
export function SpaceLayout() {
  const { spaceId } = useParams({ from: "/s/$spaceId" });
  const { space, loading } = useSpace(spaceId);
  const narrow = useMediaQuery(NARROW, false, {
    getInitialValueInEffect: false,
  });
  const opened = useBoardsDrawer(state => state.opened);
  const setOpened = useBoardsDrawer(state => state.setOpened);
  const pathname = useLocation({ select: location => location.pathname });

  // Choosing a board (or leaving the space) puts the drawer away.
  useEffect(() => {
    setOpened(false);
  }, [pathname, setOpened]);

  if (space === undefined) {
    return (
      <Text c="dimmed">{loading ? "Loading space…" : "Space not found."}</Text>
    );
  }

  const surface = (
    <Box style={{ flex: 1, minWidth: 0 }}>
      <CrossFade>
        <Outlet />
      </CrossFade>
    </Box>
  );

  if (narrow) {
    return (
      <>
        <Drawer
          opened={opened}
          onClose={() => {
            setOpened(false);
          }}
          title={space.name}
          size="min(320px, 85vw)"
        >
          <SpaceSidebar space={space} />
        </Drawer>
        {surface}
      </>
    );
  }

  return (
    <Group align="flex-start" gap="lg" wrap="nowrap">
      <SpaceSidebar space={space} />
      {surface}
    </Group>
  );
}
