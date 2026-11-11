import { useEffect } from "react";
import { create } from "zustand";

// How many popups of the card back (a dropdown, a type menu) are open. Esc
// closes the popup, so the card back stays open while there is one.
const useEscapeStore = create<{ held: number }>()(() => ({ held: 0 }));

export const useEscapeHeld = () => useEscapeStore(state => state.held > 0);

// Hold the card back's Esc while `active`.
export function useHoldEscape(active: boolean) {
  useEffect(() => {
    if (!active) {
      return undefined;
    }
    useEscapeStore.setState(state => ({ held: state.held + 1 }));
    return () => {
      useEscapeStore.setState(state => ({ held: state.held - 1 }));
    };
  }, [active]);
}
