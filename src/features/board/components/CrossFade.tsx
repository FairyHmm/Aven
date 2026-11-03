import { useReducedMotion, useTimeout } from "@mantine/hooks";
import { useMatchRoute } from "@tanstack/react-router";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

const DURATION = 260;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

// Cross-fades between boards. The outgoing board is snapshotted into
// an aria-hidden overlay that fades out and shrinks very slightly while
// the incoming board settles in from a slightly enlarged state. The Outlet
// itself is never remounted, so subscribed subtrees are not duplicated.
export function CrossFade({ children }: { children: ReactNode }) {
  // Subscribe to the board route — the space layout does not re-render
  // for child route changes, so the transition trigger lives here.
  const match = useMatchRoute();
  const resolved = match({ to: "/s/$spaceId/$boardId" });
  const id = resolved === false ? "" : resolved.boardId;

  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const leavingRef = useRef<HTMLDivElement>(null);
  const previous = useRef(id);
  const snapshot = useRef<string | null>(null);

  const [leaving, setLeaving] = useState<string | null>(null);
  const [entering, setEntering] = useState(false);

  const reduceMotion = useReducedMotion();

  // Capture the current content after each commit. Skipped mid-navigation;
  // the nav effect below runs with the old snapshot instead.
  useLayoutEffect(() => {
    if (previous.current !== id) {
      return; // handled by the navigation effect below
    }
    if (ref.current && contentRef.current) {
      snapshot.current = contentRef.current.outerHTML;
    }
  });

  // Promote the snapshot to an exiting overlay.
  useLayoutEffect(() => {
    if (previous.current === id) {
      return;
    }
    const outgoing = snapshot.current;
    previous.current = id;
    if (reduceMotion || outgoing === null) {
      return;
    }
    setLeaving(outgoing);
    setEntering(true);
  }, [id, reduceMotion]);

  // Fade the exiting overlay out after it mounts.
  useLayoutEffect(() => {
    const el = leavingRef.current;
    if (leaving === null || el === null) {
      return;
    }
    void el.offsetHeight; // force reflow so the browser paints the out state
    el.style.opacity = "0";
    el.style.transform = "scale(0.98)";
  }, [leaving]);

  // Settle the incoming content in after its out-state paints.
  useLayoutEffect(() => {
    if (!entering) {
      return;
    }
    if (ref.current !== null) {
      void ref.current.offsetHeight; // force reflow so the transition fires
    }
    setEntering(false);
  }, [entering]);

  // Drop the overlay once its fade completes.
  const { start: startLeave, clear: clearLeave } = useTimeout(() => {
    setLeaving(null);
  }, DURATION + 60);
  useEffect(() => {
    if (leaving !== null) {
      startLeave();
      return clearLeave;
    }
    return undefined;
  }, [leaving, startLeave, clearLeave]);

  const settleStyle: CSSProperties = {
    position: "relative",
    opacity: entering ? 0 : 1,
    transform: entering ? "scale(1.03)" : "scale(1)",
    transition: `opacity ${DURATION}ms ${EASE}, transform ${DURATION}ms ${EASE}`,
  };

  return (
    <div ref={ref} style={settleStyle}>
      <div ref={contentRef}>{children}</div>
      {leaving === null ? null : (
        <div
          ref={leavingRef}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: leaving }}
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
            opacity: 1,
            transform: "scale(1)",
            transition: `opacity ${DURATION}ms ${EASE}, transform ${DURATION}ms ${EASE}`,
          }}
        />
      )}
    </div>
  );
}
