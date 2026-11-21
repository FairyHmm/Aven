import { ms } from "../../../../shared/lib/motion";

export const MODAL_TRANSITION = {
  transition: {
    in: { opacity: 1, transform: "translateY(0) scale(1)" },
    out: { opacity: 0, transform: "translateY(10px) scale(0.94)" },
    common: { transformOrigin: "center 40%" },
    transitionProperty: "transform, opacity",
  },
  duration: ms("slow"),
  exitDuration: ms("base"),
  timingFunction: "var(--spring)",
};
