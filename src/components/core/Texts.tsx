"use client";

import {
  HStack,
  Heading,
  HeadingProps,
  Icon,
  Link,
  Text,
} from "@chakra-ui/react";
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
      <Heading
        as="h3"
        color={useDefaultTextColor()}
        fontSize={"lg"}
        fontWeight={"medium"}
      >
        {children}
      </Heading>
    </HStack>
  );
}

function GetCustomHeading(props: HeadingProps) {
  return function CustomHeading({
    children,
    centerAlign = false,
  }: {
    children: any;
    centerAlign?: boolean;
  }) {
    return (
      <Heading
        {...props}
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
  fontWeight: "bold",
});

export const Heading2 = GetCustomHeading({
  as: "h2",
  fontSize: "2xl",
  fontWeight: "bold",
});

export const Heading3 = GetCustomHeading({
  as: "h3",
  fontSize: "xl",
  fontWeight: "bold",
});

export const Heading4 = GetCustomHeading({
  as: "h4",
  fontSize: "lg",
  fontWeight: "bold",
});

export const Heading5 = GetCustomHeading({
  as: "h5",
  fontSize: "md",
  fontWeight: "bold",
});

export const Heading6 = GetCustomHeading({
  as: "h6",
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
      color={"app.fg.muted"}
      fontSize={["md", "lg"]}
      fontWeight={"normal"}
      lineHeight={"1.42"}
      letterSpacing={"0.01em"}
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
