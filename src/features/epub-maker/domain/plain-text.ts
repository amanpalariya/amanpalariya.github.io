import { escapeXml } from "../utils/xml";

export function plainTextToHtml(value: string): string {
  return escapeXml(value).replaceAll("\n", "<br />");
}

export function inferTitleFromText(
  value: string,
  fallback: string,
  maxWords = 8,
): string {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) return fallback;

  const words = cleaned.split(" ").filter(Boolean);
  const previewWords = words.slice(0, maxWords);
  if (previewWords.length === 0) return fallback;
  return `${previewWords.join(" ")}...`;
}

export function getTextPreviewHtml(content: string): string {
  return `<!doctype html><html><head><meta charset="utf-8" /><meta name="color-scheme" content="light" /><style>:root{color-scheme:light}html,body{margin:0;padding:0;overflow:hidden;background:#fff;color:#111}body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:12px;line-height:1.35;padding:10px}.plain-text{white-space:pre-wrap;word-break:break-word;margin:0}*{scrollbar-width:none}*::-webkit-scrollbar{width:0;height:0}</style></head><body><div class="plain-text">${plainTextToHtml(content)}</div></body></html>`;
}
