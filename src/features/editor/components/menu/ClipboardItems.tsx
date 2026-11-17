import { Menu } from "@mantine/core";
import { ClipboardPaste, Copy, Scissors, TextSelect } from "lucide-react";

import { copySelection, cutSelection, pasteOver, selectAll } from "./clipboard";
import type { Host } from "./host";

type Props = { host: Host; selected: boolean };

// Cut, copy, paste and select all, on the text of the host.
export function ClipboardItems({ host, selected }: Props) {
  return (
    <>
      <Menu.Item
        leftSection={<Scissors size={14} />}
        disabled={!selected}
        onClick={() => {
          void cutSelection(host);
        }}
      >
        Cut
      </Menu.Item>
      <Menu.Item
        leftSection={<Copy size={14} />}
        disabled={!selected}
        onClick={() => {
          void copySelection(host);
        }}
      >
        Copy
      </Menu.Item>
      <Menu.Item
        leftSection={<ClipboardPaste size={14} />}
        onClick={() => {
          void pasteOver(host);
        }}
      >
        Paste
      </Menu.Item>
      <Menu.Item
        leftSection={<TextSelect size={14} />}
        onClick={() => {
          selectAll(host);
        }}
      >
        Select all
      </Menu.Item>
    </>
  );
}
