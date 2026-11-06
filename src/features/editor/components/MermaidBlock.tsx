import { useEffect, useId, useState } from "react";

import { renderMermaid, type MermaidResult } from "../lib/mermaid";

import classes from "./markdown.module.css";

export function MermaidBlock({ source }: { source: string }) {
  // useId yields ":r1:"; mermaid wants an id usable in a CSS selector.
  const id = `mermaid-${useId().replaceAll(":", "")}`;
  const [result, setResult] = useState<MermaidResult | undefined>();

  useEffect(() => {
    let current = true;
    const run = async () => {
      const next = await renderMermaid(id, source);
      if (current) {
        setResult(next);
      }
    };
    void run();
    return () => {
      current = false;
    };
  }, [id, source]);

  if (result === undefined) {
    return <div className={classes.diagram} aria-busy="true" />;
  }
  if ("error" in result) {
    return (
      <pre className={classes.diagramError} role="alert">
        {result.error}
      </pre>
    );
  }
  return (
    <div
      className={classes.diagram}
      role="img"
      aria-label="Diagram"
      // Mermaid's own output, rendered with securityLevel "strict".
      dangerouslySetInnerHTML={{ __html: result.svg }}
    />
  );
}
