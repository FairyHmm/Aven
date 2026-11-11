import { useEffect } from "react";

import { useOptionOps } from "../../hooks/useFields";
import { useViewSwitch } from "../../hooks/useViewSwitch";
import { MANY_OPTIONS, OPTIONS } from "../../lib/labels/pickerKinds";
import type { TagColors } from "../../lib/labels/tags";
import { useFieldStore } from "../../stores/fieldStore";
import { TagPicker } from "../pickers/TagPicker";
import { ViewFade } from "../ViewFade";
import type { DropdownPart } from "./DropdownField";
import { OptionSettings } from "./OptionSettings";

const NO_OPTIONS: string[] = [];
const NO_COLORS: TagColors = {};

// The popup of a dropdown field: built like the labels popup, but over the
// options of the field's list (each with a colour of its own, apart from the
// labels of the space), picking one, or several if the field takes several.
// Making, renaming, recolouring, deleting and putting options in order work on
// the list, so every field on it, and every card that holds the option,
// follows. Below it, the field's settings.
export function OptionPicker({
  name,
  list,
  value,
  props,
  onProps,
  onValue,
  close,
}: DropdownPart) {
  // The list shown follows the field's: when the field is moved to another
  // list, the options on show fade out and the other list's fade in.
  const switcher = useViewSwitch(list);
  const shown = switcher.view;
  useEffect(() => {
    if (list !== shown && switcher.open) {
      switcher.go(list);
    }
  }, [list, shown, switcher.open]);
  const options = useFieldStore(state => state.lists[shown]) ?? NO_OPTIONS;
  const addOption = useFieldStore(state => state.addOption);
  const colors = useFieldStore(state => state.colors[shown]) ?? NO_COLORS;
  const { save, remove, move } = useOptionOps(shown, props, onProps);
  const several = Array.isArray(value);
  const chosen = several ? value : value === "" ? [] : [value];
  return (
    <ViewFade switcher={switcher} morph exit={110}>
      <TagPicker
        kind={several ? MANY_OPTIONS : OPTIONS}
        colors={colors}
        selected={chosen}
        known={options}
        onChange={selected => {
          onValue(several ? selected : (selected[0] ?? ""));
        }}
        onCreate={(tag, color) => {
          addOption(shown, tag, color);
        }}
        title={shown}
        onSave={save}
        onRemove={remove}
        onMove={move}
        close={close}
        footer={
          <OptionSettings
            name={name}
            list={list}
            several={several}
            onSeveral={on => {
              onValue(on ? chosen : (chosen[0] ?? ""));
            }}
          />
        }
      />
    </ViewFade>
  );
}
