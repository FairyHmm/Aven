export type MermaidResult = { svg: string } | { error: string };

type MermaidApi = (typeof import("mermaid"))["default"];

let loaded: Promise<MermaidApi> | undefined;

// Mermaid is large, so it is only fetched when a card with a diagram is
// shown. `strict` makes it sanitise labels and disable click handlers, which
// matters once guests can view diagrams written by other people.
function mermaidApi(): Promise<MermaidApi> {
  loaded ??= import("mermaid").then(module => {
    module.default.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "dark",
    });
    return module.default;
  });
  return loaded;
}

// Mermaid renders through shared DOM state, so renders run one at a time.
let queue: Promise<unknown> = Promise.resolve();

export function renderMermaid(
  id: string,
  source: string,
): Promise<MermaidResult> {
  const job = queue.then(async (): Promise<MermaidResult> => {
    try {
      const api = await mermaidApi();
      const { svg } = await api.render(id, source);
      return { svg };
    } catch (error) {
      // A failed render leaves its scratch element in the page.
      document.getElementById(`d${id}`)?.remove();
      return {
        error: error instanceof Error ? error.message : "Invalid diagram",
      };
    }
  });
  queue = job;
  return job;
}
