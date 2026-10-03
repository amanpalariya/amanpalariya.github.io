"use client";

import { Heading, HeadingProps, Link, Text, TextProps } from "@chakra-ui/react";
import type { ReactNode } from "react";

const useDefaultTextColor = () => "app.prose.heading";

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
  fontSize: "28px",
  fontWeight: 750,
  lineHeight: "1.25",
  letterSpacing: "-0.7px",
});

export const Heading2 = GetCustomHeading({
  as: "h2",
  fontSize: "20px",
  fontWeight: 750,
  lineHeight: "1.3",
  letterSpacing: "-0.3px",
});

export const Heading3 = GetCustomHeading({
  as: "h3",
  fontSize: "18px",
  fontWeight: 700,
});

export const Heading4 = GetCustomHeading({
  as: "h2",
  fontSize: "16px",
  fontWeight: 700,
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
      color={"app.prose.body"}
      fontFamily={"body"}
      fontSize={fontSize}
      fontWeight={"normal"}
      lineHeight={"1.42"}
      letterSpacing={"0.01em"}
      textAlign={justifyText ? "justify" : "left"}
      hyphens={justifyText ? "none" : undefined}
      css={
        justifyText ? { WebkitHyphens: "none", textWrap: "pretty" } : undefined
      }
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
      fontSize="15px"
      lineHeight="1.5"
      color="app.prose.body"
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
