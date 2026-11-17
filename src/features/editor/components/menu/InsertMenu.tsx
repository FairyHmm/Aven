import { Menu } from "@mantine/core";
import {
  Bug,
  CircleCheck,
  CircleHelp,
  ClipboardList,
  Flame,
  Info,
  List,
  Minus,
  MessageSquareQuote,
  Pencil,
  Plus,
  Quote,
  Sigma,
  SquareCode,
  Superscript,
  Table,
  TriangleAlert,
  X,
  Zap,
} from "lucide-react";

import type { Command } from "../../lib/format/edit";
import {
  insertCallout,
  insertCodeBlock,
  insertFootnote,
  insertMathBlock,
  insertRule,
  insertTable,
} from "../../lib/format/insert";
import { SubMenu } from "./SubMenu";

// The callout types the read view draws (rehype-callouts knows more names for
// the same ones).
const CALLOUTS: { type: string; label: string; icon: typeof Info }[] = [
  { type: "note", label: "Note", icon: Pencil },
  { type: "abstract", label: "Abstract", icon: ClipboardList },
  { type: "info", label: "Info", icon: Info },
  { type: "todo", label: "Todo", icon: CircleCheck },
  { type: "tip", label: "Tip", icon: Flame },
  { type: "success", label: "Success", icon: CircleCheck },
  { type: "question", label: "Question", icon: CircleHelp },
  { type: "warning", label: "Warning", icon: TriangleAlert },
  { type: "failure", label: "Failure", icon: X },
  { type: "danger", label: "Danger", icon: Zap },
  { type: "bug", label: "Bug", icon: Bug },
  { type: "example", label: "Example", icon: List },
  { type: "quote", label: "Quote", icon: Quote },
];

type Props = { run: (command: Command) => void };

// Table, callout (of any type), code block, math block, footnote and rule.
export function InsertMenu({ run }: Props) {
  return (
    <SubMenu icon={<Plus size={14} />} label="Insert">
      <Menu.Item
        leftSection={<Table size={14} />}
        onClick={() => {
          run(insertTable);
        }}
      >
        Table
      </Menu.Item>
      <SubMenu icon={<MessageSquareQuote size={14} />} label="Callout">
        {CALLOUTS.map(({ type, label, icon: Icon }) => (
          <Menu.Item
            key={type}
            leftSection={<Icon size={14} />}
            onClick={() => {
              run(insertCallout(type));
            }}
          >
            {label}
          </Menu.Item>
        ))}
      </SubMenu>
      <Menu.Item
        leftSection={<SquareCode size={14} />}
        onClick={() => {
          run(insertCodeBlock);
        }}
      >
        Code block
      </Menu.Item>
      <Menu.Item
        leftSection={<Sigma size={14} />}
        onClick={() => {
          run(insertMathBlock);
        }}
      >
        Math block
      </Menu.Item>
      <Menu.Item
        leftSection={<Superscript size={14} />}
        onClick={() => {
          run(insertFootnote);
        }}
      >
        Footnote
      </Menu.Item>
      <Menu.Item
        leftSection={<Minus size={14} />}
        onClick={() => {
          run(insertRule);
        }}
      >
        Horizontal rule
      </Menu.Item>
    </SubMenu>
  );
}
