import { Select, Switch } from "@mantine/core";

import { useFieldStore } from "../../stores/fieldStore";
import { STOP } from "../pickers/popoverFit";

import classes from "../pickers/pickers.module.css";

// Under a dropdown's options: whether it takes several, and, when the space
// has other option lists, which list this field takes its options from (so
// fields can share them).
export function OptionSettings({
  name,
  list,
  several,
  onSeveral,
}: {
  name: string;
  list: string;
  several: boolean;
  onSeveral: (several: boolean) => void;
}) {
  const lists = Object.keys(useFieldStore(state => state.lists));
  const link = useFieldStore(state => state.link);
  return (
    <div className={classes.settings}>
      <Switch
        size="xs"
        label="Choose several"
        checked={several}
        onChange={event => {
          onSeveral(event.currentTarget.checked);
        }}
      />
      {lists.length > 1 && (
        <Select
          size="xs"
          label="Options from"
          {...STOP}
          allowDeselect={false}
          // Its choices stay inside this popup: out in a portal, a click on
          // one would count as a click outside it, and close it.
          comboboxProps={{ withinPortal: false }}
          data={lists.map(item => ({
            value: item,
            label: item === name ? `${item} (this field)` : item,
          }))}
          value={list}
          onChange={next => {
            if (next !== null) {
              link(name, next);
            }
          }}
        />
      )}
    </div>
  );
}
