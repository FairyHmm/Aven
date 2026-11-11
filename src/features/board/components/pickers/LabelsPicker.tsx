import {
  useKnownTags,
  useRelabel,
  useSetTagColor,
  useTagColors,
} from "../../hooks/useTags";
import { LABELS } from "../../lib/labels/pickerKinds";
import { renamed } from "../../lib/labels/tags";
import { TagPicker } from "./TagPicker";

type Picker = {
  tags: string[];
  onChange: (tags: string[]) => void;
  close: () => void;
};

// The labels of a card: the shared picker, with the labels known on the board
// and in the space. A label that is changed is changed on every card of the
// board that carries it.
export function LabelsPicker({ tags, onChange, close }: Picker) {
  const known = useKnownTags(tags);
  const setColor = useSetTagColor();
  const relabel = useRelabel();
  const colors = useTagColors();
  return (
    <TagPicker
      kind={LABELS}
      colors={colors}
      selected={tags}
      known={known}
      onChange={onChange}
      onCreate={setColor}
      onSave={(from, to, color) => {
        relabel(from, to, color);
        onChange(renamed(tags, from, to));
      }}
      onRemove={undefined}
      onMove={undefined}
      close={close}
    />
  );
}
