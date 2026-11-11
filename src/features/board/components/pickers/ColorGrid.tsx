import { Check } from "lucide-react";

import { attrsOf, GRID, type LabelColor } from "../../lib/labels/labelColors";

import classes from "./tagPicker.module.css";

// Colour picker grid.
export function ColorGrid({
  value,
  onChange,
}: {
  value: LabelColor;
  onChange: (color: LabelColor) => void;
}) {
  return (
    <div className={classes.grid}>
      {GRID.map(color => (
        <button
          key={color}
          type="button"
          className={classes.swatch}
          {...attrsOf(color)}
          aria-label={color.replace("-", " ")}
          aria-pressed={color === value}
          onClick={() => {
            onChange(color);
          }}
        >
          {color === value && <Check size={14} />}
        </button>
      ))}
    </div>
  );
}
