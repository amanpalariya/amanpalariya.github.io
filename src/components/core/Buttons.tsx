import { Button, ButtonProps, Icon } from "@chakra-ui/react";
import React from "react";
import type { IconType } from "react-icons";

const actionButtonBaseProps = {
  fontFamily: "ui",
  fontSize: "sm",
  px: 2.5,
  shadow: "xs",
  rounded: "xl",
} satisfies Pick<ButtonProps, "fontFamily" | "fontSize" | "px" | "shadow" | "rounded">;

type ActionButtonProps = Omit<ButtonProps, "children"> & {
  children: React.ReactNode;
  icon?: IconType;
};

export function PrimaryActionButton({
  children,
  icon,
  backgroundColor,
  ...props
}: ActionButtonProps & { backgroundColor?: string }) {
  return (
    <Button
      {...actionButtonBaseProps}
      background={backgroundColor ? backgroundColor : "dodgerblue"}
      variant={"solid"}
      {...props}
    >
      {icon ? (
        <Icon fontSize={actionButtonBaseProps.fontSize}>
          {React.createElement(icon)}
        </Icon>
      ) : undefined}{" "}
      {children}
    </Button>
  );
}

export function SecondaryActionButton({
  children,
  icon,
  ...props
}: ActionButtonProps) {
  return (
    <Button {...actionButtonBaseProps} variant={"subtle"} {...props}>
      {icon ? (
        <Icon fontSize={actionButtonBaseProps.fontSize}>
          {React.createElement(icon)}
        </Icon>
      ) : undefined}
      {children}
    </Button>
  );
}
