import { type RefObject, useEffect, useState } from "react";

// Whether the element's content is taller than the element itself (it is
// clamped by max-height). Diagrams render late and images load, so it watches
// the element and its content rather than measuring once.
export function useClamped(ref: RefObject<HTMLElement | null>): boolean {
  const [clamped, setClamped] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (element === null) {
      return undefined;
    }
    const measure = () => {
      setClamped(element.scrollHeight > element.clientHeight + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    if (element.firstElementChild !== null) {
      observer.observe(element.firstElementChild);
    }
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return clamped;
}
