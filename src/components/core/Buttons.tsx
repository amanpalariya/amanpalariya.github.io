import { Button, ButtonProps, Icon } from "@chakra-ui/react";

const buttonProps: ButtonProps = {
  fontSize: "sm",
  px: 2.5,
  shadow: "md",
  rounded: "xl",
};

export function PrimaryActionButton({
  children,
  icon,
  onClick,
}: {
  children: string;
  icon?: any;
  onClick?: () => any;
}) {
  return (
    <Button
      {...buttonProps}
      colorScheme={"telegram"}
      variant={"solid"}
      leftIcon={icon ? <Icon as={icon} /> : undefined}
      onClick={onClick}
    >
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
    <Button
      {...buttonProps}
      colorScheme={"gray"}
      variant={"solid"}
      leftIcon={icon ? <Icon as={icon} /> : undefined}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
