import { isNarrowed } from "../lib/shown";
import { useFilterStore } from "../stores/filterStore";

// Whether the board is narrowed to a label or some text, so some cards are
// out of sight (and a drop position would be counted among fewer than there
// are).
export function useNarrowed() {
  return useFilterStore(state =>
    isNarrowed({ tag: state.tag, text: state.text }),
  );
}
