"use client";

import { ClientOnly, Menu, Portal } from "@chakra-ui/react";
import { useTheme } from "next-themes";
import { FiCheck, FiMonitor, FiMoon, FiSun } from "react-icons/fi";

const themes = [
  { value: "system", label: "Use device setting", icon: FiMonitor },
  { value: "light", label: "Light", icon: FiSun },
  { value: "dark", label: "Dark", icon: FiMoon },
] as const;

export default function ThemeMenu() {
  const { theme, setTheme } = useTheme();
  const selected = themes.find((option) => option.value === theme) ?? themes[0];
  const ThemeIcon = selected.icon;

  return (
    <ClientOnly
      fallback={
        <button
          className="site-theme-trigger"
          aria-label="Change theme"
          disabled
        >
          <FiMonitor aria-hidden="true" />
        </button>
      }
    >
      <Menu.Root
        immediate
        unstyled
        positioning={{ placement: "bottom-end", gutter: 8 }}
      >
        <Menu.Trigger asChild>
          <button
            className="site-theme-trigger"
            aria-label={`Change theme: ${selected.label}`}
            title="Change theme"
          >
            <ThemeIcon aria-hidden="true" />
          </button>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner style={{ zIndex: 50 }}>
            <Menu.Content className="site-theme-menu" aria-label="Theme">
              <Menu.RadioItemGroup
                value={theme ?? "system"}
                onValueChange={({ value }) => setTheme(value)}
                aria-label="Theme"
              >
                {themes.map(({ value, label, icon: OptionIcon }) => (
                  <Menu.RadioItem
                    key={value}
                    value={value}
                    className="site-theme-option"
                  >
                    <OptionIcon aria-hidden="true" />
                    <Menu.ItemText className="site-theme-option-text">
                      {label}
                    </Menu.ItemText>
                    <Menu.ItemIndicator className="site-theme-check">
                      <FiCheck aria-hidden="true" />
                    </Menu.ItemIndicator>
                  </Menu.RadioItem>
                ))}
              </Menu.RadioItemGroup>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </ClientOnly>
  );
}
