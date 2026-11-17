import { Facet } from "@codemirror/state";

import type { TaskState } from "../tasks";

// What a widget inside the editor shows. The editor itself only reserves a
// DOM node for it; React draws into that node through a portal (see
// EditorWidgets), so the widgets are ordinary components with the app's
// providers, styles and menus.
export type WidgetContent =
  | {
      kind: "task";
      // The box was right-clicked, at this point of the page.
      menu: (x: number, y: number) => void;
      state: TaskState;
      // The caret is on the box's line: an unchecked box shows then.
      active: boolean;
      // `undefined`: read-only.
      change: ((state: TaskState) => void) | undefined;
    }
  | { kind: "diagram"; source: string }
  | { kind: "html"; source: string }
  | { kind: "math"; tex: string; display: boolean }
  | {
      kind: "table";
      source: string;
      // Replaces the table's markdown with new markdown.
      change: (source: string) => void;
      // Hands the caret back to the document, on the line before or after the
      // table. Walking into the table from there shows its markdown.
      leave: (direction: "up" | "down") => void;
    };

export type HubEntry = {
  id: number;
  host: HTMLElement;
  content: WidgetContent;
};

// A tiny external store: CodeMirror creates and destroys widget nodes, React
// subscribes to the list and portals into them.
export class WidgetHub {
  private entries = new Map<HTMLElement, HubEntry>();
  private listeners = new Set<() => void>();
  private list: readonly HubEntry[] = [];
  private counter = 0;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  snapshot = (): readonly HubEntry[] => this.list;

  add(host: HTMLElement, content: WidgetContent): void {
    this.counter += 1;
    this.entries.set(host, { id: this.counter, host, content });
    this.publish();
  }

  update(host: HTMLElement, content: WidgetContent): void {
    const entry = this.entries.get(host);
    if (entry !== undefined) {
      this.entries.set(host, { ...entry, content });
      this.publish();
    }
  }

  remove(host: HTMLElement): void {
    if (this.entries.delete(host)) {
      this.publish();
    }
  }

  private publish(): void {
    this.list = [...this.entries.values()];
    for (const listener of this.listeners) {
      listener();
    }
  }
}

// The hub of the editor a widget lives in.
export const hubFacet = Facet.define<WidgetHub, WidgetHub | undefined>({
  combine: values => values[0],
});
