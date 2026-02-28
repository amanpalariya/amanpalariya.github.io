"use client";

import { useColorModeValue } from "@components/ui/color-mode";

export function useProseStyles() {
  const proseBodyFontFamily =
    "'CMU Sans Serif', 'Computer Modern Sans', sans-serif";
  const proseSerifFontFamily = "'CMU Serif', 'Computer Modern Serif', serif";
  const proseCodeFontFamily =
    "'CMU Typewriter Text', 'CMU Typewriter', 'Computer Modern Typewriter', mono";

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
    fontFamily: proseBodyFontFamily,
    lineHeight: "1.42",
    fontSize: ["lg", "xl"],
    letterSpacing: "0.01em",
    width: "100%",
    marginInline: "auto",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    "& > *": {
      marginTop: 0,
      marginBottom: 7,
    },
    "& > *:last-child": {
      marginBottom: 0,
    },
    "& h1, & h2, & h3, & h4": {
      color: headingColor,
      fontFamily: proseSerifFontFamily,
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
      textAlign: "justify",
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
      textDecoration: "underline",
      textUnderlineOffset: "3px",
      textDecorationThickness: "from-font",
      textDecorationStyle: "solid",
      overflowWrap: "anywhere",
    },
    "& a.external-link": {
      textDecoration: "none",
      backgroundImage: "linear-gradient(currentColor, currentColor)",
      backgroundRepeat: "no-repeat",
      backgroundSize: "100% 1px",
      backgroundPosition: "0 calc(100% - 1px)",
      paddingBottom: "1px",
    },
    "& a.external-link::after": {
      content: '""',
      display: "inline-block",
      marginInlineStart: 0,
      width: "1em",
      height: "1em",
      backgroundColor: "currentColor",
      maskImage:
        "url(\"data:image/svg+xml,%3Csvg%20width='24'%20height='24'%20viewBox='0%200%2024%2024'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3E%3Cg%20clip-path='url(%23clip0_429_11179)'%3E%3Cpath%20d='M7%207H17M17%207V17M17%207L7%2017'%20stroke='black'%20stroke-width='2.5'%20stroke-linecap='round'%20stroke-linejoin='round'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath%20id='clip0_429_11179'%3E%3Crect%20width='24'%20height='24'%20fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E\")",
      maskRepeat: "no-repeat",
      maskSize: "contain",
      maskPosition: "center",
      verticalAlign: "middle",
      transform: "translateY(-0.05em)",
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
    "& li::marker": {
      color: useColorModeValue("gray.400", "gray.500"),
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
      fontFamily: proseCodeFontFamily,
      padding: [4, 5],
      borderRadius: "2xl",
      overflowX: "hidden",
      border: "1px solid",
      borderColor: preBorder,
      fontSize: ["md", "lg"],
      marginY: 6,
      marginX: [-2, -3],
    },
    "& pre code": {
      background: "transparent",
      padding: 0,
      fontSize: "inherit",
      color: "inherit",
      fontFamily: proseCodeFontFamily,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      border: "none",
      boxShadow: "none",
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
      fontFamily: proseCodeFontFamily,
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
      height: "auto",
      display: "block",
      marginInline: "auto",
      borderRadius: "lg",
      marginY: 6,
      boxShadow: useColorModeValue("md", "dark-lg"),
    },
    "& figure": {
      marginY: 6,
      marginInline: "auto",
      width: "fit-content",
      maxWidth: "100%",
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
