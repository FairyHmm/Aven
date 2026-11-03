// Temporary in-memory data so the routes render before Firestore lands.

export interface Board {
  id: string;
  name: string;
}

export interface Space {
  id: string;
  name: string;
  boards: Board[];
}

export const spaces: Space[] = [
  {
    id: "it3120",
    name: "IT3120",
    boards: [
      { id: "roadmap", name: "Roadmap" },
      { id: "research", name: "Research" },
    ],
  },
  {
    id: "personal",
    name: "Personal",
    boards: [{ id: "inbox", name: "Inbox" }],
  },
];

export function findSpace(spaceId: string): Space | undefined {
  return spaces.find(space => space.id === spaceId);
}

export function findBoard(spaceId: string, boardId: string): Board | undefined {
  return findSpace(spaceId)?.boards.find(board => board.id === boardId);
}
