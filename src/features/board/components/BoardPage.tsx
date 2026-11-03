import { Stack, Text, Title } from "@mantine/core";
import { useParams } from "@tanstack/react-router";

import { findBoard } from "../../../shared/lib/fixtures";

// Board view. Placeholder until the board surface lands.
export function BoardPage() {
  const { spaceId, boardId } = useParams({ from: "/s/$spaceId/$boardId" });
  const board = findBoard(spaceId, boardId);

  if (board === undefined) {
    return <Text c="dimmed">Board not found.</Text>;
  }

  return (
    <Stack gap="xs">
      <Title order={3}>{board.name}</Title>
      <Text size="sm" c="dimmed">
        The board surface goes here.
      </Text>
    </Stack>
  );
}
