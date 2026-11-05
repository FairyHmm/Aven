import { Text } from "@mantine/core";
import { useParams } from "@tanstack/react-router";

import { findBoard } from "../../../shared/lib/fixtures";
import { BoardView } from "./BoardView";

// Board route component: resolves the board, then hands over to the surface.
export function BoardPage() {
  const { spaceId, boardId } = useParams({ from: "/s/$spaceId/$boardId" });
  const board = findBoard(spaceId, boardId);

  if (board === undefined) {
    return <Text c="dimmed">Board not found.</Text>;
  }

  return <BoardView spaceId={spaceId} boardId={boardId} name={board.name} />;
}
