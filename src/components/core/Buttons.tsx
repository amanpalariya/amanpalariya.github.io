import { Button, ButtonProps, Icon } from "@chakra-ui/react";
import React, { ReactNode } from "react";

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
  ...props
}: {
  children: ReactNode;
  icon?: any;
  backgroundColor?: any;
  onClick?: () => any;
} & ButtonProps) {
  return (
    <Button
      {...buttonProps}
      background={backgroundColor ? backgroundColor : "dodgerblue"}
      variant={"solid"}
      onClick={onClick}
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
  onClick,
  ...props
}: {
  children: ReactNode;
  icon?: any;
  onClick?: () => any;
} & ButtonProps) {
  return (
    <Button {...buttonProps} variant={"subtle"} onClick={onClick} {...props}>
      {icon ? (
        <Icon fontSize={buttonProps.fontSize}>{React.createElement(icon)}</Icon>
      ) : undefined}
      {children}
    </Button>
  );
}
