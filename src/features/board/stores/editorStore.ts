import { create } from "zustand";

// Which card's editor is open. It lives outside the components so a card can
// open it directly, without the request being passed down through the columns.
type EditorState = {
  cardId: string | undefined;
  open: (id: string) => void;
  close: () => void;
};

export const useEditorStore = create<EditorState>()(set => ({
  cardId: undefined,
  open: id => {
    set({ cardId: id });
  },
  close: () => {
    set({ cardId: undefined });
  },
}));
