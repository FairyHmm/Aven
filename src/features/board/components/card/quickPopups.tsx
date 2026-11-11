import { CalendarClock, Tag, Users } from "lucide-react";
import type { ReactNode } from "react";

import type { PropertyPopup } from "../../lib/types";

// The property popups the quick-edit menu opens, with their hotkeys.
export const POPUPS: {
  kind: PropertyPopup;
  label: string;
  hint: string;
  icon: ReactNode;
}[] = [
  { kind: "labels", label: "Edit labels", hint: "L", icon: <Tag size={15} /> },
  {
    kind: "members",
    label: "Change members",
    hint: "M",
    icon: <Users size={15} />,
  },
  {
    kind: "dates",
    label: "Edit dates",
    hint: "D",
    icon: <CalendarClock size={15} />,
  },
];
