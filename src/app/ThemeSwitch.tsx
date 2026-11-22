import {
  Box,
  Center,
  Menu,
  SegmentedControl,
  useMantineColorScheme,
} from "@mantine/core";
import { Monitor, Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";

const CHOICES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "auto", label: "Match device", icon: Monitor },
] as const;

// The theme choice of the account menu: one control, so the three are seen
// together and the menu stays open while the change is. Mantine keeps the
// choice for the next visit.
export function ThemeSwitch() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  // The page cross-fades between the two themes (styles/theme.css sets how
  // long); where the browser can't, or motion is reduced, it just changes.
  const change = (value: (typeof CHOICES)[number]["value"]) => {
    const apply = () => {
      flushSync(() => {
        setColorScheme(value);
      });
    };
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if ("startViewTransition" in document && !still) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  };
  return (
    <>
      <Menu.Label>Theme</Menu.Label>
      <Box px="xs" pb="xs">
        <SegmentedControl
          fullWidth
          size="xs"
          value={colorScheme}
          onChange={change}
          data={CHOICES.map(({ value, label, icon: Icon }) => ({
            value,
            label: (
              <Center title={label} aria-label={label}>
                <Icon size={14} />
              </Center>
            ),
          }))}
        />
      </Box>
      <Menu.Divider />
    </>
  );
}
