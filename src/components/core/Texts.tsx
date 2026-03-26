"use client";

import {
  HStack,
  Heading,
  HeadingProps,
  Icon,
  Link,
  Text,
  TextProps,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import { FaCircle } from "react-icons/fa";

const useDefaultTextColor = () => "app.fg.default";

export function SectionText({
  children,
  hideDot = false,
  dotColorPalette,
}: {
  children: any;
  hideDot?: boolean;
  dotColorPalette?: string;
}) {
  const resolvedPalette = dotColorPalette ?? "gray";
  const iconColor = `${resolvedPalette}.focusRing`;
  return (
    <HStack>
      {hideDot ? null : (
        <Icon color={iconColor} boxSize={2}>
          <FaCircle />
        </Icon>
      )}
      <Text
        as="p"
        color={useDefaultTextColor()}
        fontSize={"lg"}
        fontWeight={"normal"}
      >
        {children}
      </Text>
    </HStack>
  );
}

function GetCustomHeading(props: HeadingProps) {
  return function CustomHeading({
    children,
    centerAlign = false,
    ...headingProps
  }: {
    children: ReactNode;
    centerAlign?: boolean;
  } & HeadingProps) {
    return (
      <Heading
        {...props}
        {...headingProps}
        fontFamily="heading"
        color={useDefaultTextColor()}
        textAlign={centerAlign ? "center" : "left"}
      >
        {children}
      </Heading>
    );
  };
}

export const Heading1 = GetCustomHeading({
  as: "h1",
  fontSize: "3xl",
  fontWeight: "semibold",
});

export const Heading2 = GetCustomHeading({
  as: "h2",
  fontSize: "2xl",
  fontWeight: "semibold",
});

export const Heading3 = GetCustomHeading({
  as: "h3",
  fontSize: "xl",
  fontWeight: "medium",
});

export const Heading4 = GetCustomHeading({
  as: "h2",
  fontSize: "lg",
  fontWeight: "medium",
});

export const Heading5 = GetCustomHeading({
  as: "h5",
  fontSize: "md",
  fontWeight: "medium",
});

export const Heading6 = GetCustomHeading({
  as: "h6",
  fontSize: "md",
  fontWeight: "normal",
});

export function ParagraphText({
  children,
  justifyText = false,
  size = "md",
  ...textProps
}: {
  children: ReactNode;
  justifyText?: boolean;
  size?: "sm" | "md";
} & TextProps) {
  const fontSize = size === "sm" ? ["16px", "17px"] : ["19px", "20px"];

  return (
    <Text
      color={"app.fg.muted"}
      fontFamily={"'CMU Sans Serif', 'Noto Sans', sans-serif"}
      fontSize={fontSize}
      fontWeight={"normal"}
      lineHeight={"1.42"}
      letterSpacing={"0.01em"}
      textAlign={justifyText ? "justify" : "left"}
      hyphens={justifyText ? "auto" : undefined}
      css={justifyText ? { WebkitHyphens: "auto", textWrap: "pretty" } : undefined}
      {...textProps}
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
      color={"app.fg.subtle"}
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
