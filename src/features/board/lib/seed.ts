import { generateNKeysBetween } from "fractional-indexing";

import { newId } from "./id";
import type { Accent, BoardData, Card, Column } from "./types";

// Starter content for a board that has never been saved.
export function seedBoard(now = Date.now()): BoardData {
  const keys = generateNKeysBetween(null, null, 3);
  const make = (index: number, name: string, accent: Accent): Column => ({
    id: newId(),
    name,
    accent,
    order: keys[index],
  });
  const todo = make(0, "To do", "sky");
  const doing = make(1, "In progress", "amber");
  const done = make(2, "Done", "emerald");

  const cardKeys = generateNKeysBetween(null, null, 3);
  const card = (
    column: Column,
    index: number,
    title: string,
    body: string,
  ): Card => ({
    id: newId(),
    columnId: column.id,
    title,
    body,
    order: cardKeys[index],
    createdAt: now,
    updatedAt: now,
  });

  return {
    columns: [todo, doing, done],
    cards: [
      card(
        todo,
        0,
        "Welcome to Aven",
        "Every card is a **markdown** document. Drag me to another column, or click to edit.",
      ),
      card(
        todo,
        1,
        "Sketch the sharing model",
        "Link sharing on a whole space, with view / comment / edit roles.",
      ),
      card(todo, 2, "Write the IT3120 report", ""),
      card(
        doing,
        0,
        "Kanban board surface",
        "Columns, cards, drag and drop, local or Firebase storage.",
      ),
      card(
        doing,
        1,
        "Card pipeline",
        "A card is markdown; a mermaid code fence turns it into a diagram.\n\n```mermaid\nflowchart LR\n  Write --> Preview --> Share\n```",
      ),
      card(done, 0, "Scaffold the app", "React + Mantine + TanStack Router."),
    ],
  };
}
