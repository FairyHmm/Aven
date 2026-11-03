import { Box, Group, Paper, Stack, Text } from "@mantine/core";
import { Link, Outlet, useMatchRoute, useParams } from "@tanstack/react-router";

import { findSpace, type Board } from "../../../shared/lib/fixtures";
import { CrossFade } from "../../board/components/CrossFade";

// Space layout: sidebar of boards plus the board surface. Routes mount
// this shell and hand it the outlet.
export function SpaceLayout() {
  const { spaceId } = useParams({ from: "/s/$spaceId" });
  const space = findSpace(spaceId);

  if (space === undefined) {
    return <Text c="dimmed">Space not found.</Text>;
  }

  return (
    <Group align="flex-start" gap="lg" wrap="nowrap">
      <Stack w={190} gap={4}>
        {space.boards.map(board => (
          <BoardLink key={board.id} spaceId={spaceId} board={board} />
        ))}
      </Stack>

      <Box style={{ flex: 1, minWidth: 0 }}>
        <CrossFade>
          <Outlet />
        </CrossFade>
      </Box>
    </Group>
  );
}

function BoardLink({ spaceId, board }: { spaceId: string; board: Board }) {
  const matchRoute = useMatchRoute();
  const active =
    matchRoute({
      to: "/s/$spaceId/$boardId",
      params: { spaceId, boardId: board.id },
    }) !== false;

  return (
    <Link
      to="/s/$spaceId/$boardId"
      params={{ spaceId, boardId: board.id }}
      style={{ color: "inherit", textDecoration: "none" }}
    >
      <Paper
        px="sm"
        py={6}
        radius="sm"
        bg={active ? "var(--mantine-color-default-hover)" : "transparent"}
      >
        <Text size="sm" fw={active ? 600 : 400}>
          {board.name}
        </Text>
      </Paper>
    </Link>
  );
}
