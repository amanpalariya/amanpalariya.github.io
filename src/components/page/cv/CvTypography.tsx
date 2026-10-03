import {
  Heading,
  Text,
  type HeadingProps,
  type TextProps,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import { CV_BODY_FONT_FAMILY } from "./cvStyleTokens";

export function Heading2({ children }: { children: ReactNode }) {
  return (
    <Heading
      as="h1"
      fontFamily={CV_BODY_FONT_FAMILY}
      fontSize={{ base: "26px", md: "28px" }}
      fontWeight={750}
      lineHeight="1.25"
      letterSpacing="-0.7px"
      color="app.prose.heading"
    >
      {children}
    </Heading>
  );
}

export function Heading4(props: HeadingProps) {
  return (
    <Heading
      {...props}
      as="h3"
      fontFamily={CV_BODY_FONT_FAMILY}
      fontSize="16px"
      fontWeight={700}
      lineHeight="1.4"
      letterSpacing="normal"
      color="app.prose.heading"
    />
  );
}

export function ParagraphText({
  children,
  justifyText: _justifyText,
  size: _size,
  ...props
}: TextProps & {
  children: ReactNode;
  justifyText?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <Text
      {...props}
      fontFamily={CV_BODY_FONT_FAMILY}
      fontSize="15px"
      lineHeight="1.5"
      letterSpacing="normal"
      textAlign="left"
      color="app.prose.body"
    >
      {children}
    </Text>
  );
}
