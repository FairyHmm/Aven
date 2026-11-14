import { Avatar, Tooltip } from "@mantine/core";

import { useSpaceMembers } from "../../../space/hooks/useSpaces";
import { useBoardStore } from "../../stores/boardStore";

import classes from "./cardProps.module.css";

export function MemberChips({ memberIds }: { memberIds: string[] }) {
  const spaceId = useBoardStore(state => state.ref?.spaceId);
  const members = useSpaceMembers(spaceId);
  const byId = new Map(members.map(m => [m.uid, m]));

  return (
    <>
      {memberIds.map(uid => {
        const member = byId.get(uid);
        const name = member?.displayName ?? uid;
        return (
          <Tooltip key={uid} label={name} withArrow>
            <span className={classes.chip}>
              <Avatar
                src={member?.photoURL ?? null}
                size={14}
                radius="xl"
                color="indigo"
              >
                {name.slice(0, 2).toUpperCase()}
              </Avatar>
              {name}
            </span>
          </Tooltip>
        );
      })}
    </>
  );
}
