import { Box, Group, Paper, Stack, Text } from "@mantine/core";
import { Link, Outlet, useMatchRoute, useParams } from "@tanstack/react-router";
import { useRef } from "react";

import { SortableItem } from "../../../shared/components/SortableItem";
import { useAutoScroll } from "../../../shared/hooks/useAutoScroll";
import { useSortableDrop } from "../../../shared/hooks/useSortableDrop";
import { useSortableList } from "../../../shared/hooks/useSortableList";
import {
  findSpace,
  type Board,
  type Space,
} from "../../../shared/lib/fixtures";
import { CrossFade } from "../../board/components/CrossFade";
import { useOrderedBoards } from "../hooks/useOrderedBoards";

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
      <Sidebar space={space} />

      <Box style={{ flex: 1, minWidth: 0 }}>
        <CrossFade>
          <Outlet />
        </CrossFade>
      </Box>
    </Group>
  );
}

// Boards can be dragged to reorder, with the same mechanism the board
// surface uses for cards and columns (shared/components/SortableItem.tsx).
function Sidebar({ space }: { space: Space }) {
  const { boards, move } = useOrderedBoards(space);
  const list = useRef<HTMLDivElement>(null);
  useAutoScroll(list);
  useSortableList(list, {
    kind: "board",
    listId: space.id,
    axis: "vertical",
    gap: 4,
    count: boards.length,
  });
  useSortableDrop("board", dropped => {
    move(
      space.id,
      boards.map(board => board.id),
      dropped.id,
      dropped.index,
    );
  });

  return (
    <Stack ref={list} w={190} gap={4}>
      {boards.map((board, index) => (
        <SortableItem
          key={board.id}
          kind="board"
          id={board.id}
          listId={space.id}
          axis="vertical"
          index={index}
          count={boards.length}
        >
          <BoardLink spaceId={space.id} board={board} />
        </SortableItem>
      ))}
    </Stack>
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
      draggable={false}
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
