"use client";

import { HStack, Icon, Link, Text, TextProps } from "@chakra-ui/react";
import { FaCircle } from "react-icons/fa";
import { useColorModeValue } from "@components/ui/color-mode";

const useDefaultTextColor = () =>
  useColorModeValue("gray.800", "whiteAlpha.900");

export function SectionText({
  children,
  hideDot = false,
}: {
  children: any;
  hideDot?: boolean;
}) {
  const iconColor = useColorModeValue("gray.400", "gray.500");
  return (
    <HStack>
      {hideDot ? null : (
        <Icon color={iconColor} boxSize={2}>
          <FaCircle />
        </Icon>
      )}
      <Text color={useDefaultTextColor()} fontSize={"lg"} fontWeight={"medium"}>
        {children}
      </Text>
    </HStack>
  );
}

function GetCustomHeading(props: TextProps) {
  return function CustomHeading({
    children,
    centerAlign = false,
  }: {
    children: any;
    centerAlign?: boolean;
  }) {
    return (
      <Text
        {...props}
        color={useDefaultTextColor()}
        textAlign={centerAlign ? "center" : "left"}
      >
        {children}
      </Text>
    );
  };
}

export const Heading1 = GetCustomHeading({
  fontSize: "3xl",
  fontWeight: "bold",
});

export const Heading2 = GetCustomHeading({
  fontSize: "2xl",
  fontWeight: "bold",
});

export const Heading3 = GetCustomHeading({
  fontSize: "xl",
  fontWeight: "bold",
});

export const Heading4 = GetCustomHeading({
  fontSize: "lg",
  fontWeight: "bold",
});

export const Heading5 = GetCustomHeading({
  fontSize: "md",
  fontWeight: "bold",
});

export const Heading6 = GetCustomHeading({
  fontSize: "md",
  fontWeight: "medium",
});

export function ParagraphText({
  children,
  justifyText = false,
}: {
  children: any;
  justifyText?: boolean;
}) {
  return (
    <Text
      color={useColorModeValue("gray.700", "gray.200")}
      fontSize={"md"}
      fontWeight={"normal"}
      lineHeight={"tall"}
      textAlign={justifyText ? "justify" : "left"}
    >
      {children}
    </Text>
  );
}

export function SubtitleText({
  children,
  centerAlign = false,
}: {
  children: any;
  centerAlign?: boolean;
}) {
  return (
    <Text
      fontSize={"md"}
      color={"gray.500"}
      textAlign={centerAlign ? "center" : "left"}
    >
      {children}
    </Text>
  );
}

export function LinkText({
  children,
  href,
  isExternal,
}: {
  children: any;
  href: string;
  isExternal?: boolean;
}) {
  return (
    <Link
      href={href}
      borderBottom={"thin"}
      borderStyle={"dotted"}
      lineHeight={"normal"}
      target={isExternal ? "_blank" : "_self"}
    >
      {children}
    </Link>
  );
}
