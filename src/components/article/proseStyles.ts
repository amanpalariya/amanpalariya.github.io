"use client";

import { useColorModeValue } from "@components/ui/color-mode";

export function useProseStyles() {
  const headingColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const subtleTextColor = useColorModeValue("gray.600", "gray.400");
  const linkColor = useColorModeValue("teal.600", "teal.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const codeBg = useColorModeValue("gray.100", "gray.900");
  const preBg = useColorModeValue("gray.50", "gray.900");
  const preBorder = useColorModeValue("gray.200", "gray.700");
  const preTextColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const inlineCodeBg = useColorModeValue("gray.100", "whiteAlpha.200");
  const inlineCodeColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const inlineCodeBorder = useColorModeValue("gray.200", "whiteAlpha.400");

  return {
    color: textColor,
    lineHeight: "1.42",
    fontSize: ["md", "lg"],
    letterSpacing: "0.01em",
    maxWidth: "720px",
    marginInline: "auto",
    "& > *": {
      marginTop: 0,
      marginBottom: 7,
    },
    "& > *:last-child": {
      marginBottom: 0,
    },
    "& h1, & h2, & h3, & h4": {
      color: headingColor,
      letterSpacing: "-0.01em",
      lineHeight: "shorter",
      marginTop: 10,
      marginBottom: 4,
      fontWeight: "semibold",
    },
    "& h1": {
      fontSize: ["2xl", "3xl"],
      fontWeight: "bold",
    },
    "& h2": {
      fontSize: ["xl", "2xl"],
      fontWeight: "bold",
    },
    "& h3": {
      fontSize: ["lg", "xl"],
    },
    "& h4": {
      fontSize: "lg",
    },
    "& p": {
      marginBottom: 7,
    },
    "& p:last-of-type": {
      marginBottom: 0,
    },
    "& strong": {
      color: headingColor,
      fontWeight: "semibold",
    },
    "& em, & i": {
      color: textColor,
      fontStyle: "italic",
    },
    "& a": {
      color: linkColor,
      fontWeight: "medium",
      textDecoration: "underline",
      textUnderlineOffset: "3px",
      textDecorationThickness: "from-font",
      textDecorationStyle: "dotted",
    },
    "& a:hover": {
      color: useColorModeValue("teal.700", "teal.200"),
    },
    "& ul, & ol": {
      paddingLeft: 6,
      marginTop: 2,
      marginBottom: 4,
      listStylePosition: "outside",
    },
    "& ul": {
      listStyleType: "disc",
    },
    "& ol": {
      listStyleType: "decimal",
    },
    "& li": {
      marginBottom: 2,
    },
    "& li > p": {
      marginBottom: 2,
    },
    "& blockquote": {
      borderLeft: "4px solid",
      borderColor,
      paddingLeft: 4,
      marginY: 6,
      color: subtleTextColor,
      fontStyle: "italic",
      background: useColorModeValue("gray.50", "whiteAlpha.100"),
      borderRadius: "md",
      paddingY: 3,
    },
    "& blockquote p": {
      marginBottom: 2,
    },
    "& pre": {
      background: preBg,
      color: preTextColor,
      padding: [4, 6],
      borderRadius: "lg",
      overflowX: "auto",
      border: "1px solid",
      borderColor: preBorder,
      fontSize: "sm",
      marginY: 6,
      boxShadow: useColorModeValue("md", "dark-lg"),
    },
    "& pre code": {
      background: "transparent",
      padding: 0,
      fontSize: "inherit",
      color: "inherit",
      fontFamily: "mono",
    },
    "& pre .hljs-comment, & pre .hljs-quote": {
      color: useColorModeValue("gray.500", "gray.400"),
      fontStyle: "italic",
    },
    "& pre .hljs-keyword, & pre .hljs-selector-tag, & pre .hljs-literal": {
      color: useColorModeValue("purple.600", "purple.300"),
      fontWeight: "semibold",
    },
    "& pre .hljs-string, & pre .hljs-title, & pre .hljs-name": {
      color: useColorModeValue("green.600", "green.300"),
    },
    "& pre .hljs-number, & pre .hljs-attr": {
      color: useColorModeValue("orange.500", "orange.300"),
    },
    "& pre .hljs-function, & pre .hljs-variable": {
      color: useColorModeValue("blue.600", "blue.300"),
    },
    "& code": {
      fontFamily: "mono",
      background: inlineCodeBg,
      color: inlineCodeColor,
      borderRadius: "md",
      paddingX: 2,
      paddingY: 0.5,
      fontSize: "0.9em",
      border: "1px solid",
      borderColor: inlineCodeBorder,
    },
    "& img": {
      maxWidth: "100%",
      borderRadius: "lg",
      marginY: 6,
      boxShadow: useColorModeValue("md", "dark-lg"),
    },
    "& figcaption": {
      fontSize: "sm",
      color: subtleTextColor,
      textAlign: "center",
      marginTop: 2,
    },
    "& hr": {
      borderColor,
      marginY: 8,
    },
    "& table": {
      width: "100%",
      borderCollapse: "collapse",
      marginY: 6,
      fontSize: "sm",
    },
    "& th, & td": {
      border: "1px solid",
      borderColor,
      paddingY: 2,
      paddingX: 3,
      textAlign: "left",
    },
    "& thead th": {
      background: codeBg,
      color: headingColor,
      fontWeight: "semibold",
    },
  } as const;
}