// Plain-text preview of a markdown body for the card tile.
export function snippet(body: string, max = 140): string {
  const text = body
    .replace(/^---\n[\s\S]*?\n---\n?/, "") // YAML frontmatter
    .replace(/```[\s\S]*?```/g, " ") // fenced code
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // links, images
    .replace(/\[\[([^\]]+)\]\]/g, "$1") // wikilinks
    .replace(/^[#>\-*+\s]+/gm, "") // headings, quotes, bullets
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
