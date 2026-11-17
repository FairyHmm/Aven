// A menu of the editor lives in a portal, outside the card being edited. These
// say it still belongs to it: leaving the text for the menu does not end the
// edit, and Esc closes the menu, not the card (see CardEditor).
export const KEEP = { "data-keep-editing": "", "data-popup": "" };

// Mantine caps a menu to the room there is and makes it scroll, which would
// cut off a submenu (it sits inside its parent's box). So no `size` here.
export const MENU_FIT = { flip: true, shift: true };
