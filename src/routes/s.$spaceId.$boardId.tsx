import { createFileRoute } from "@tanstack/react-router";

import { BoardPage } from "../features/board/components/BoardPage";
import { prefetchBoard } from "../features/board/hooks/prefetchBoard";

export const Route = createFileRoute("/s/$spaceId/$boardId")({
  loader: ({ params }) => {
    prefetchBoard({ spaceId: params.spaceId, boardId: params.boardId });
  },
  component: BoardPage,
});
