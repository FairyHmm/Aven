import { Text } from "@mantine/core";
import { useParams } from "@tanstack/react-router";

import { useBoards } from "../../space/hooks/useSpaces";
import { BoardView } from "./BoardView";

// Board route component: resolves the board, then hands over to the surface.
export function BoardPage() {
  const { spaceId, boardId } = useParams({ from: "/s/$spaceId/$boardId" });
  const { boards, loading } = useBoards(spaceId);
  const board = boards.find(item => item.id === boardId);

  if (board === undefined) {
    return (
      <Text c="dimmed">{loading ? "Loading board…" : "Board not found."}</Text>
    );
  }

  return <BoardView spaceId={spaceId} boardId={boardId} name={board.name} />;
}
