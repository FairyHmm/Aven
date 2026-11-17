import type { Host } from "./host";

// The clipboard may be refused (no permission, no focus): then nothing happens.
async function guarded(action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch {
    // Nothing to do.
  }
}

// Whether the text reached the clipboard. A cut must not delete what was not
// copied, so callers that remove something wait for this.
export async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// The clipboard's text, or undefined when it cannot be read.
export async function readClipboard(): Promise<string | undefined> {
  try {
    return await navigator.clipboard.readText();
  } catch {
    return undefined;
  }
}

export async function copySelection(host: Host): Promise<void> {
  await guarded(async () => {
    const { text, from, to } = host.read();
    if (from !== to) {
      await navigator.clipboard.writeText(text.slice(from, to));
    }
  });
}

export async function cutSelection(host: Host): Promise<void> {
  await guarded(async () => {
    const { text, from, to } = host.read();
    if (from === to) {
      return;
    }
    await navigator.clipboard.writeText(text.slice(from, to));
    host.apply({
      changes: [{ from, to, insert: "" }],
      anchor: from,
      head: from,
    });
  });
}

export async function pasteOver(host: Host): Promise<void> {
  await guarded(async () => {
    const clip = await navigator.clipboard.readText();
    const { from, to } = host.read();
    const caret = from + clip.length;
    host.apply({
      changes: [{ from, to, insert: clip }],
      anchor: caret,
      head: caret,
    });
  });
}

export function selectAll(host: Host): void {
  host.select(0, host.read().text.length);
}
