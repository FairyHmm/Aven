import { createFileRoute, redirect } from "@tanstack/react-router";

import { NoBoards } from "../features/space/components/NoBoards";
import { findSpace } from "../shared/lib/fixtures";

// A space always opens on its first board; there is no "space, no board" view.
export const Route = createFileRoute("/s/$spaceId/")({
  beforeLoad: ({ params }) => {
    const first = findSpace(params.spaceId)?.boards[0];
    if (first === undefined) {
      return;
    }
    throw redirect({
      to: "/s/$spaceId/$boardId",
      params: { spaceId: params.spaceId, boardId: first.id },
      replace: true,
    });
  },
  component: NoBoards,
});
