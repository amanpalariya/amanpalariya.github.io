type GlobalStyles = Record<string, Record<string, string | number> | unknown>;

const HANDWRITTEN_BASE_STYLES: GlobalStyles = {
  ".handwritten": {
    fontFamily: "'Caveat', cursive",
    fontWeight: 500,
    letterSpacing: "0.01em",
  },
  ".prose-content p .handwritten, .prose-content li .handwritten, .prose-content blockquote .handwritten, .prose-content td .handwritten, .prose-content th .handwritten":
    {
      fontSize: "1.08em",
      lineHeight: 1,
    },
  ".prose-content h1 .handwritten, .prose-content h2 .handwritten, .prose-content h3 .handwritten, .prose-content h4 .handwritten, .prose-content h5 .handwritten, .prose-content h6 .handwritten":
    {
      fontSize: "1.16em",
      lineHeight: 1,
    },
  ".prose-content h4 .handwritten, .prose-content h5 .handwritten, .prose-content h6 .handwritten":
    {
      fontWeight: 600,
    },
  ".prose-content h1 .handwritten, .prose-content h2 .handwritten, .prose-content h3 .handwritten":
    {
      fontWeight: 700,
    },
};

const HANDWRITTEN_SQUIGGLE_STYLES: GlobalStyles = {
  ".handwritten-squiggle": {
    textDecorationLine: "underline",
    textDecorationStyle: "wavy",
    textDecorationThickness: "0.09em",
    textUnderlineOffset: "0.11em",
    textDecorationSkipInk: "none",
    textDecorationColor: "var(--handwritten-squiggle-color, currentColor)",
  },
  ".squiggle-teal": {
    "--handwritten-squiggle-color": "var(--chakra-colors-teal-500)",
  },
  ".squiggle-blue": {
    "--handwritten-squiggle-color": "var(--chakra-colors-blue-500)",
  },
  ".squiggle-orange": {
    "--handwritten-squiggle-color": "var(--chakra-colors-orange-500)",
  },
  ".squiggle-pink": {
    "--handwritten-squiggle-color": "var(--chakra-colors-pink-500)",
  },
  ".squiggle-gray": {
    "--handwritten-squiggle-color": "var(--chakra-colors-gray-500)",
  },
};

export function getAppGlobalStyles(proseStyles: unknown): GlobalStyles {
  return {
    ".skip-link": {
      position: "fixed",
      top: "12px",
      left: "12px",
      transform: "translateY(-140%)",
      background: "var(--chakra-colors-app-bg-card)",
      color: "var(--chakra-colors-app-fg-default)",
      border: "2px solid var(--chakra-colors-app-border-default)",
      borderRadius: "10px",
      padding: "8px 12px",
      zIndex: 999,
      textDecoration: "none",
      transition: "transform 0.16s ease",
    },
    ".skip-link:focus-visible": {
      transform: "translateY(0%)",
      outline: "none",
    },
    "a:focus-visible, button:focus-visible, [role='button']:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible":
      {
        outline: "2px solid var(--chakra-colors-blue-500)",
        outlineOffset: "2px",
      },
    ".prose-content": proseStyles,
    ...HANDWRITTEN_BASE_STYLES,
    ...HANDWRITTEN_SQUIGGLE_STYLES,
  };
}
