import { detectType, load, mountAsync, type Mounted } from "pele/lazy";
import { useEffect, useRef, useState } from "react";

import classes from "../markdown.module.css";

type Props = {
  source: string;
  // Zoom and pan are for wide views; a tile that is dragged and clicked
  // leaves them off.
  zoom?: boolean;
};

// Pele draws the diagram into the box and redraws it when the box changes
// width: a narrow tile gets a re-flowed diagram, not a shrunken one. It reads
// its colours from the `--pele-*` variables set in markdown.module.css and
// shows a diagram it cannot draw as an error over the last good one.
export function MermaidBlock({ source, zoom = false }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const mounted = useRef<Promise<Mounted> | undefined>(undefined);
  const [failed, setFailed] = useState<string | undefined>();

  useEffect(() => {
    const element = host.current;
    if (element === null) {
      return undefined;
    }
    let current = true;
    const run = async () => {
      try {
        // Each diagram type is its own chunk, loaded when first used.
        await load(detectType(source));
        if (!current) {
          return;
        }
        if (mounted.current === undefined) {
          mounted.current = mountAsync(element, source, { zoom, fontSize: 13 });
          await mounted.current;
        } else {
          (await mounted.current).update(source);
        }
        setFailed(undefined);
      } catch (error) {
        setFailed(error instanceof Error ? error.message : "Invalid diagram");
      }
    };
    void run();
    return () => {
      current = false;
    };
  }, [source, zoom]);

  useEffect(
    () => () => {
      const pending = mounted.current;
      mounted.current = undefined;
      void pending?.then(diagram => {
        diagram.destroy();
      });
    },
    [],
  );

  return (
    <>
      <div
        ref={host}
        className={classes.diagram}
        role="img"
        aria-label="Diagram"
      />
      {failed === undefined ? null : (
        <pre className={classes.diagramError} role="alert">
          {failed}
        </pre>
      )}
    </>
  );
}
