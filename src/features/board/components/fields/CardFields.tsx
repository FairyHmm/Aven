import { useEffect, useRef, useState } from "react";

import { useLinks, useSwitchType } from "../../hooks/useFields";
import { inferValue } from "../../lib/props/convert";
import {
  customFields,
  renameField,
  typeOf,
  withField,
  withoutField,
} from "../../lib/props/fields";
import type { NewFieldKind, Props } from "../../lib/types";
import { useFieldStore } from "../../stores/fieldStore";
import { FieldSection } from "./FieldSection";
import { NewField } from "./NewField";

import classes from "../cardBack/cardSections.module.css";

// The card's custom fields under its labels and dates: a grid of equal cells,
// and the checkboxes, which are small, in a line of their own.
export function CardFields({
  props,
  onChange,
  adding,
  onAdded,
}: {
  props: Props;
  onChange: (props: Props) => void;
  // A new field is being named, and of what kind: it is made as soon as it
  // has a name.
  adding: NewFieldKind | undefined;
  onAdded: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  // The field just made, whose value is typed next.
  const [fresh, setFresh] = useState<string>();
  const openFresh = useRef(false);
  // Fields made here and not given a value yet: they take the type of it.
  const [auto, setAuto] = useState<string[]>([]);
  const sectionOf = (name: string) =>
    [
      ...(root.current?.querySelectorAll<HTMLElement>("[data-field-name]") ??
        []),
    ].find(item => item.dataset.fieldName === name);
  useEffect(() => {
    if (fresh !== undefined) {
      const control = sectionOf(fresh)?.querySelector<HTMLElement>(
        "[data-control] :is(input, button)",
      );
      control?.focus();
      if (openFresh.current) {
        openFresh.current = false;
        control?.click();
      }
      setFresh(undefined);
    }
  }, [fresh]);
  const settle = (name: string) => {
    setAuto(names => names.filter(item => item !== name));
  };
  const links = useLinks();
  const switchType = useSwitchType();
  const renameLink = useFieldStore(state => state.renameField);
  const fields = customFields(props).map(([name, value]) => ({
    name,
    value,
    type: typeOf(value, name in links),
  }));
  const field = ({ name, value, type }: (typeof fields)[number]) => (
    <FieldSection
      key={name}
      name={name}
      value={value}
      type={type}
      props={props}
      onProps={onChange}
      auto={auto.includes(name)}
      onChange={next => {
        if (auto.includes(name) && typeof next === "string" && next !== "") {
          // The first value decides the type. The control changes with it,
          // so the focus is put back if it was in it.
          const inferred = inferValue(next);
          const focused = sectionOf(name)?.contains(document.activeElement);
          settle(name);
          onChange(withField(props, name, inferred));
          if (typeof inferred !== "string" && focused === true) {
            setFresh(name);
          }
          return;
        }
        onChange(withField(props, name, next));
      }}
      onType={to => {
        settle(name);
        onChange(withField(props, name, switchType(name, value, to)));
      }}
      onRename={to => {
        setAuto(names => names.map(item => (item === name ? to : item)));
        renameLink(name, to);
        onChange(renameField(props, name, to));
      }}
      onRemove={() => {
        onChange(withoutField(props, name));
      }}
    />
  );
  const sized = fields.filter(item => item.type !== "checkbox");
  const toggles = fields.filter(item => item.type === "checkbox");
  return (
    <div ref={root} className={classes.contents}>
      {(sized.length > 0 || adding !== undefined) && (
        <div className={classes.fields} data-flip="back:fields">
          {sized.map(field)}
          {adding !== undefined && (
            <NewField
              kind={adding}
              props={props}
              onDone={onAdded}
              onNamed={name => {
                if (adding === "dropdown") {
                  // It is a dropdown from the start (with a list of its own
                  // to fill), and its popup opens for the first option.
                  onChange(
                    withField(props, name, switchType(name, "", "dropdown")),
                  );
                  openFresh.current = true;
                } else {
                  onChange(withField(props, name, ""));
                  setAuto(names => [...names, name]);
                }
                setFresh(name);
              }}
            />
          )}
        </div>
      )}
      {toggles.length > 0 && (
        <div className={classes.toggles} data-flip="back:toggles">
          {toggles.map(field)}
        </div>
      )}
    </div>
  );
}
