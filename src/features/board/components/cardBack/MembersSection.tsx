import { Avatar, Tooltip } from "@mantine/core";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";

import { useSpaceMembers } from "../../../space/hooks/useSpaces";
import type { PropertyPopup } from "../../lib/types";
import { useBoardStore } from "../../stores/boardStore";

import sections from "./cardSections.module.css";
import widgets from "./cardWidgets.module.css";

type Props = {
  memberIds: string[];
  open: PropertyPopup | undefined;
  onOpen: (kind: PropertyPopup | undefined) => void;
  popup: (kind: PropertyPopup, target: ReactNode) => ReactNode;
};

export function MembersSection({ memberIds, open, onOpen, popup }: Props) {
  const spaceId = useBoardStore(state => state.ref?.spaceId);
  const spaceMembers = useSpaceMembers(spaceId);
  const byId = new Map(spaceMembers.map(m => [m.uid, m]));

  return popup(
    "members",
    <section
      className={sections.section}
      data-leave=""
      data-flip="back:section:members"
    >
      <h4 className={sections.sectionLabel}>Members</h4>
      <div className={sections.sectionValue}>
        {memberIds.map(uid => {
          const member = byId.get(uid);
          const label = member?.displayName ?? uid;
          return (
            <Tooltip key={uid} label={member?.email ?? label} withArrow>
              <button
                type="button"
                className={widgets.add}
                style={{ width: "auto", padding: "0 6px", gap: 6 }}
                onClick={() => {
                  onOpen("members");
                }}
              >
                <Avatar
                  src={member?.photoURL ?? null}
                  size={18}
                  radius="xl"
                  color="indigo"
                >
                  {label.slice(0, 2).toUpperCase()}
                </Avatar>
                <span>{label}</span>
              </button>
            </Tooltip>
          );
        })}
        <button
          type="button"
          className={widgets.add}
          aria-label="Edit members"
          onClick={() => {
            onOpen(open === "members" ? undefined : "members");
          }}
        >
          <Plus size={16} />
        </button>
      </div>
    </section>,
  );
}
