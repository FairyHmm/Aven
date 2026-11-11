import { ActionIcon } from "@mantine/core";
import { ChevronLeft, X } from "lucide-react";

import classes from "./pickers.module.css";

// Popup header with title, close, and optional back button.
export function PopupHeader({
  title,
  onClose,
  onBack,
}: {
  title: string;
  onClose: () => void;
  onBack?: (() => void) | undefined;
}) {
  return (
    <div className={classes.header}>
      {onBack !== undefined && (
        <ActionIcon
          size="sm"
          variant="subtle"
          color="gray"
          aria-label="Back"
          className={classes.back}
          onClick={onBack}
        >
          <ChevronLeft size={16} />
        </ActionIcon>
      )}
      <h3 className={classes.heading}>{title}</h3>
      <ActionIcon
        size="sm"
        variant="subtle"
        color="gray"
        aria-label="Close"
        className={classes.close}
        onClick={onClose}
      >
        <X size={16} />
      </ActionIcon>
    </div>
  );
}
