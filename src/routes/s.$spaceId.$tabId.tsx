import { Text } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

interface TabSearch {
  // Open card, so a refresh or a shared link restores the view.
  card?: string;
}

function validateSearch(search: Record<string, unknown>): TabSearch {
  return typeof search.card === "string" ? { card: search.card } : {};
}

export const Route = createFileRoute("/s/$spaceId/$tabId")({
  validateSearch,
  component: TabPage,
});

function TabPage() {
  const { spaceId, tabId } = Route.useParams();
  const { card } = Route.useSearch();
  return (
    <Text>
      Space {spaceId} / tab {tabId}
      {card === undefined ? "" : ` / card ${card}`}
    </Text>
  );
}
