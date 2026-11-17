import { Menu } from "@mantine/core";

import { useHoldEscape } from "../../../board/stores/escapeStore";
import type { EditorMenuState } from "../../hooks/useEditorMenu";
import type { Command } from "../../lib/format/edit";
import { activeAt } from "../../lib/format/state";
import { ClipboardItems } from "./ClipboardItems";
import { FormatMenu } from "./FormatMenu";
import { runCommand } from "./host";
import { InsertMenu } from "./InsertMenu";
import { MenuShell } from "./MenuShell";
import { ParagraphMenu } from "./ParagraphMenu";

// The editor's right-click menu: format, insert and paragraph, then the
// clipboard.
export function EditorMenu({ menu }: { menu: EditorMenuState }) {
  const { spot, host, close } = menu;
  useHoldEscape(spot !== undefined);
  const snapshot = spot === undefined ? undefined : host.read();
  const active =
    snapshot === undefined ? undefined : activeAt(snapshot.text, snapshot);
  const run = (command: Command) => {
    runCommand(host, command);
  };
  return (
    <MenuShell
      opened={spot !== undefined}
      onClose={close}
      x={spot?.x ?? 0}
      y={spot?.y ?? 0}
    >
      <FormatMenu run={run} active={active} />
      <InsertMenu run={run} />
      <ParagraphMenu run={run} active={active} />
      <Menu.Divider />
      <ClipboardItems host={host} selected={spot?.selected ?? false} />
    </MenuShell>
  );
}
