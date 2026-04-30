import { Menu as ChakraMenu, type BoxProps, type ButtonProps } from "@chakra-ui/react";
import type React from "react";
import type { ReactNode } from "react";

type MenuTriggerProps = ButtonProps & {
  asChild?: boolean;
  children?: ReactNode;
};

type MenuContentProps = BoxProps & {
  children?: ReactNode;
};

type MenuItemProps = BoxProps & {
  children?: ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  value: string;
};

const MenuTrigger = ChakraMenu.Trigger as React.ComponentType<MenuTriggerProps>;
const MenuPositioner = ChakraMenu.Positioner as React.ComponentType<MenuContentProps>;
const MenuContent = ChakraMenu.Content as React.ComponentType<MenuContentProps>;
const MenuItem = ChakraMenu.Item as React.ComponentType<MenuItemProps>;

export const Menu = {
  ...ChakraMenu,
  Trigger: MenuTrigger,
  Positioner: MenuPositioner,
  Content: MenuContent,
  Item: MenuItem,
};
