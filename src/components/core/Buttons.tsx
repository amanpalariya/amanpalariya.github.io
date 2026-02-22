import { Button, ButtonProps, Icon } from "@chakra-ui/react";
import React from "react";

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
  onClick,
}: {
  children: string;
  icon?: any;
  backgroundColor?: any;
  onClick?: () => any;
}) {
  return (
    <Button
      {...buttonProps}
      background={backgroundColor ? backgroundColor : "dodgerblue"}
      variant={"solid"}
      onClick={onClick}
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
  onClick,
}: {
  children: string;
  icon?: any;
  onClick?: () => any;
}) {
  return (
    <Button {...buttonProps} variant={"subtle"} onClick={onClick}>
      {icon ? (
        <Icon fontSize={buttonProps.fontSize}>{React.createElement(icon)}</Icon>
      ) : undefined}
      {children}
    </Button>
  );
}
