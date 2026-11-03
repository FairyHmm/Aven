import { createFileRoute } from "@tanstack/react-router";

import { BoardPage } from "../features/board/components/BoardPage";

export const Route = createFileRoute("/s/$spaceId/$boardId")({
  component: BoardPage,
});
