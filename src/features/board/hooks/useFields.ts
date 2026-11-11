import { useMemo } from "react";

import { captureLayout } from "../../../shared/lib/dnd/flip";
import type { LabelColor } from "../lib/labels/labelColors";
import { convertValue } from "../lib/props/convert";
import { fieldsOn, rewriteProps } from "../lib/props/dropdowns";
import { type FieldType, knownValues } from "../lib/props/fields";
import type { PropValue, Props } from "../lib/types";
import { useBoardStore } from "../stores/boardStore";
import { useFieldStore } from "../stores/fieldStore";

// Which fields are dropdowns, and on which list.
export function useLinks() {
  return useFieldStore(state => state.links);
}

// What other cards on the board hold in the field `name`: the suggestions of
// a text or list field.
export function useKnownValues(name: string) {
  const cards = useBoardStore(state => state.cards);
  return useMemo(
    () =>
      knownValues(
        cards.map(card => card.props),
        name,
      ),
    [cards, name],
  );
}

// Change a field's type: its value becomes the same thing in the new type.
// Becoming a dropdown, it takes the list named like it (made from what the
// board already holds in it, if there is none yet); leaving, it just stops
// using its list.
export function useSwitchType() {
  const store = useFieldStore.getState;
  return (name: string, value: PropValue, to: FieldType): PropValue => {
    const next = convertValue(value, to);
    const { links, createList, link, addOption, unlink } = store();
    if (to === "dropdown" && !(name in links)) {
      const cards = useBoardStore.getState().cards.map(card => card.props);
      createList(name, knownValues(cards, name));
      for (const option of Array.isArray(next) ? next : [next]) {
        if (typeof option === "string" && option !== "") {
          addOption(name, option);
        }
      }
      link(name, name);
    } else if (to !== "dropdown" && name in links) {
      unlink(name);
    }
    return next;
  };
}

// Changing or removing an option of a list: the list, every card on the
// board that holds it in a field on that list, and the card being edited
// (which holds its own copy of its properties) all follow. An option's colour
// belongs to its list.
export function useOptionOps(
  list: string,
  props: Props,
  onProps: (props: Props) => void,
) {
  const { renameOption, removeOption, moveOption } = useFieldStore.getState();
  const { rewriteValues } = useBoardStore.getState().actions;
  const follow = (from: string, to: string) => {
    const fields = fieldsOn(useFieldStore.getState().links, list);
    rewriteValues(fields, from, to);
    onProps(rewriteProps(props, fields, from, to));
  };
  return {
    save: (from: string, to: string, color: LabelColor) => {
      renameOption(list, from, to, color);
      follow(from, to);
    },
    remove: (option: string) => {
      removeOption(list, option);
      follow(option, "");
    },
    move: (option: string, to: number) => {
      captureLayout();
      moveOption(list, option, to);
    },
  };
}
