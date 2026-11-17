import { Text } from "@mantine/core";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useEffect } from "react";

import { NoBoards } from "../features/space/components/NoBoards";
import { useBoards } from "../features/space/hooks/useSpaces";

// A space always opens on its first board; if none exist, shows NoBoards.
function SpaceIndex() {
  const { spaceId } = useParams({ from: "/s/$spaceId/" });
  const { boards, loading } = useBoards(spaceId);
  const navigate = useNavigate();
  const first = boards[0];

  useEffect(() => {
    if (!loading && first !== undefined) {
      void navigate({
        to: "/s/$spaceId/$boardId",
        params: { spaceId, boardId: first.id },
        replace: true,
      });
    }
  }, [loading, first, spaceId, navigate]);

  if (loading || first !== undefined) {
    return <Text c="dimmed">Loading…</Text>;
  }
  return <NoBoards />;
}

export const Route = createFileRoute("/s/$spaceId/")({
  component: SpaceIndex,
});
