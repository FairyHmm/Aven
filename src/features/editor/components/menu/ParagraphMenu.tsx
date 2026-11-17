import { Menu } from "@mantine/core";
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListChecks,
  ListOrdered,
  Pilcrow,
  Text,
  TextQuote,
} from "lucide-react";

import { type Block, setBlock } from "../../lib/format/block";
import type { Command } from "../../lib/format/edit";
import type { Active } from "../../lib/format/state";
import { SubMenu } from "./SubMenu";
import { Tail } from "./Tail";
import { TaskStateItems } from "./TaskStateItems";

const HEADINGS = [
  { level: 1, icon: Heading1 },
  { level: 2, icon: Heading2 },
  { level: 3, icon: Heading3 },
  { level: 4, icon: Heading4 },
  { level: 5, icon: Heading5 },
  { level: 6, icon: Heading6 },
] as const;

type Props = {
  run: (command: Command) => void;
  // What the line is now, for the checks.
  active: Active | undefined;
};

// What the lines are: lists, checkboxes (in every state), headings, a quote,
// or plain text.
export function ParagraphMenu({ run, active }: Props) {
  const turn = (block: Block) => () => {
    run(setBlock(block));
  };
  const block = active?.block;
  return (
    <SubMenu icon={<Pilcrow size={14} />} label="Paragraph">
      <Menu.Item
        leftSection={<List size={14} />}
        rightSection={<Tail on={block?.kind === "bullet"} />}
        onClick={turn({ kind: "bullet" })}
      >
        Bullet list
      </Menu.Item>
      <Menu.Item
        leftSection={<ListOrdered size={14} />}
        rightSection={<Tail on={block?.kind === "number"} />}
        onClick={turn({ kind: "number" })}
      >
        Numbered list
      </Menu.Item>
      <SubMenu
        icon={<ListChecks size={14} />}
        label="Checkbox"
        tail={<Tail on={block?.kind === "task"} />}
      >
        <TaskStateItems
          current={block?.kind === "task" ? block.state : undefined}
          onPick={state => {
            run(setBlock({ kind: "task", state }));
          }}
        />
      </SubMenu>
      <Menu.Divider />
      {HEADINGS.map(({ level, icon: Icon }) => (
        <Menu.Item
          key={level}
          leftSection={<Icon size={14} />}
          rightSection={
            <Tail on={block?.kind === "heading" && block.level === level} />
          }
          onClick={turn({ kind: "heading", level })}
        >
          Heading {level}
        </Menu.Item>
      ))}
      <Menu.Divider />
      <Menu.Item
        leftSection={<TextQuote size={14} />}
        rightSection={<Tail on={active?.quote === true} />}
        onClick={turn({ kind: "quote" })}
      >
        Quote
      </Menu.Item>
      <Menu.Item
        leftSection={<Text size={14} />}
        rightSection={
          <Tail
            on={active !== undefined && block === undefined && !active.quote}
          />
        }
        onClick={turn({ kind: "plain" })}
      >
        Plain text
      </Menu.Item>
    </SubMenu>
  );
}
