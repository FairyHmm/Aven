import { Modal } from "@mantine/core";

import { SHORTCUTS } from "../lib/shortcuts";
import { useHelpStore } from "../stores/helpStore";

import classes from "./shortcutsHelp.module.css";

// The cheat sheet `?` opens.
export function ShortcutsHelp() {
  const opened = useHelpStore(state => state.opened);
  const setOpened = useHelpStore(state => state.setOpened);
  return (
    <Modal
      opened={opened}
      onClose={() => {
        setOpened(false);
      }}
      title="Keyboard shortcuts"
      centered
      radius="lg"
      size={460}
    >
      <div className={classes.groups}>
        {SHORTCUTS.map(group => (
          <section key={group.title}>
            <h3 className={classes.title}>{group.title}</h3>
            <dl className={classes.list}>
              {group.items.map(item => (
                <div key={item.what} className={classes.row}>
                  <dt className={classes.keys}>
                    {item.keys.map(key => (
                      <kbd key={key} className={classes.key}>
                        {key}
                      </kbd>
                    ))}
                  </dt>
                  <dd className={classes.what}>{item.what}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </Modal>
  );
}
