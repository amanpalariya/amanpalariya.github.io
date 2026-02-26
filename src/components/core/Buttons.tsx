import { Button, ButtonProps, Icon } from "@chakra-ui/react";
import React from "react";
import type { IconType } from "react-icons";

const buttonProps: ButtonProps = {
  fontSize: "sm",
  px: 2.5,
  shadow: "xs",
  rounded: "xl",
};

export function PrimaryActionButton({
  children,
  icon,
  backgroundColor,
  ...props
}: {
  children: React.ReactNode;
  icon?: IconType;
  backgroundColor?: ButtonProps["background"];
} & ButtonProps) {
  return (
    <Button
      {...buttonProps}
      background={backgroundColor ? backgroundColor : "dodgerblue"}
      variant={"solid"}
      {...props}
    >
      {icon ? (
        <Icon fontSize={buttonProps.fontSize}>{React.createElement(icon)}</Icon>
      ) : undefined}{" "}
      {children}
    </Button>
  );
}

export function SecondaryActionButton({
  children,
  icon,
  ...props
}: {
  children: React.ReactNode;
  icon?: IconType;
} & ButtonProps) {
  return (
    <Button {...buttonProps} variant={"subtle"} {...props}>
      {icon ? (
        <Icon fontSize={buttonProps.fontSize}>{React.createElement(icon)}</Icon>
      ) : undefined}
      {children}
    </Button>
  );
}
