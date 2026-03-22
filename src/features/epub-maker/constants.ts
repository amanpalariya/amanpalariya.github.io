import { SanitizationPolicy } from "./types";

export const EPUB_MAKER_PREFS_KEY = "epub-maker-prefs-v1";
export const DEFAULT_BOOK_TITLE = "EPUB Maker Pages";

const DROP_TAGS = [
  "script",
  "style",
  "noscript",
  "template",
  "svg",
  "canvas",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "head",
  "header",
  "footer",
  "nav",
  "aside",
  "form",
  "button",
  "input",
  "textarea",
  "select",
  "option",
  "label",
];

const ALLOW_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "strong",
  "em",
  "a",
  "br",
  "hr",
  "figure",
  "figcaption",
  "div",
  "span",
  "img",
];

export function createDefaultSanitizationPolicy(): SanitizationPolicy {
  return {
    dropTags: new Set(DROP_TAGS),
    allowTags: new Set(ALLOW_TAGS),
    allowExternalLinks: true,
    embedRemoteImages: true,
    maxPreviewNodes: 10,
  };
}
