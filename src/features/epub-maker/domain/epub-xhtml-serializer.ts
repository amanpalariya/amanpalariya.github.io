import { escapeXml } from "../utils/xml";

const XHTML_VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function serializeNodeToXhtml(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeXml(node.textContent || "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node as Element;
  const tag = element.tagName.toLowerCase();
  const attrs = Array.from(element.attributes)
    .map((attribute) => ` ${attribute.name}="${escapeXml(attribute.value)}"`)
    .join("");

  const children = Array.from(element.childNodes)
    .map((child) => serializeNodeToXhtml(child))
    .join("");

  if (XHTML_VOID_TAGS.has(tag) && children.length === 0) {
    return `<${tag}${attrs} />`;
  }

  return `<${tag}${attrs}>${children}</${tag}>`;
}

export function serializeBodyToXhtml(body: HTMLElement): string {
  return Array.from(body.childNodes)
    .map((node) => serializeNodeToXhtml(node))
    .join("");
}
