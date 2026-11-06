export type CardKind = "note" | "diagram";

// Card types are inferred from content, not stored: a card with a mermaid
// fence is a diagram, anything else a note.
export function cardKind(body: string): CardKind {
  return /^```mermaid\b/m.test(body) ? "diagram" : "note";
}
