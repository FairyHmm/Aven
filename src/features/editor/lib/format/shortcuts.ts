import type { Command } from "./edit";
import { toggleHighlight } from "./highlight";
import { toggleMark } from "./inline";

export type ShortcutId = "bold" | "italic" | "code" | "strike" | "highlight";

type Shortcut = { key: string; shift: boolean; command: Command };

// Ctrl (⌘ on a Mac) + the key. Bold and italic are what everyone knows; the
// others are where a browser leaves them free.
const SHORTCUTS: Record<ShortcutId, Shortcut> = {
  bold: { key: "b", shift: false, command: toggleMark("bold") },
  italic: { key: "i", shift: false, command: toggleMark("italic") },
  code: { key: "e", shift: false, command: toggleMark("code") },
  strike: { key: "x", shift: true, command: toggleMark("strike") },
  highlight: { key: "h", shift: true, command: toggleHighlight("default") },
};

const mac = () =>
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform);

type KeyLike = {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
};

// The command a key press stands for.
export function shortcutFor(event: KeyLike): Command | undefined {
  const mod = mac() ? event.metaKey : event.ctrlKey;
  if (!mod || event.altKey) {
    return undefined;
  }
  const key = event.key.toLowerCase();
  return Object.values(SHORTCUTS).find(
    item => item.key === key && item.shift === event.shiftKey,
  )?.command;
}

// "Ctrl+Shift+X", "⌘⇧X".
export function shortcutLabel(id: ShortcutId): string {
  const { key, shift } = SHORTCUTS[id];
  return mac()
    ? `⌘${shift ? "⇧" : ""}${key.toUpperCase()}`
    : `Ctrl+${shift ? "Shift+" : ""}${key.toUpperCase()}`;
}

// The same, as CodeMirror key names.
export function shortcutKeys(): { key: string; command: Command }[] {
  return Object.values(SHORTCUTS).map(item => ({
    key: `Mod-${item.shift ? "Shift-" : ""}${item.key}`,
    command: item.command,
  }));
}
