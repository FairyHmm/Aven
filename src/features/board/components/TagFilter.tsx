import { Button, Popover } from "@mantine/core";
import { ListFilter } from "lucide-react";
import { useMemo, useState } from "react";

import { useTagColors, useTagFilter } from "../hooks/useTags";
import { attrsOf } from "../lib/labels/labelColors";
import { colorOf, tagText } from "../lib/labels/tags";
import { tagsOf } from "../lib/props/defaults";
import { useBoardStore } from "../stores/boardStore";
import { PopupHeader } from "./pickers/PopupHeader";

import picker from "./pickers/pickers.module.css";
import tagPicker from "./pickers/tagPicker.module.css";

// Narrows the board to cards under one label (and its child labels).
// Also useful for finding a label by text when tiles only show label colours.
export function TagFilter() {
  const [opened, setOpened] = useState(false);
  const { tag: active, show, clear } = useTagFilter();
  const colors = useTagColors();
  const cards = useBoardStore(state => state.cards);
  const used = useMemo(() => {
    const counts = new Map<string, number>();
    for (const card of cards) {
      for (const tag of tagsOf(card.props)) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts].sort(([a], [b]) => a.localeCompare(b));
  }, [cards]);

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-start"
      width={260}
    >
      <Popover.Target>
        <Button
          size="compact-xs"
          variant="default"
          leftSection={<ListFilter size={13} />}
          onClick={() => {
            setOpened(open => !open);
          }}
        >
          Filter
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <div className={picker.picker}>
          <PopupHeader
            title="Filter by label"
            onClose={() => {
              setOpened(false);
            }}
          />
          <div className={tagPicker.list}>
            {used.map(([tag, count]) => (
              <button
                key={tag}
                type="button"
                className={tagPicker.bar}
                {...attrsOf(colorOf(tag, colors))}
                aria-pressed={tag === active}
                onClick={() => {
                  show(tag);
                  setOpened(false);
                }}
              >
                {tagText(tag)}
                <span className={picker.count}>{count}</span>
              </button>
            ))}
            {used.length === 0 && (
              <p className={picker.note}>No card has a label yet.</p>
            )}
          </div>
          {active !== undefined && (
            <Button
              size="xs"
              variant="default"
              onClick={() => {
                clear();
                setOpened(false);
              }}
            >
              Show every card
            </Button>
          )}
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}
