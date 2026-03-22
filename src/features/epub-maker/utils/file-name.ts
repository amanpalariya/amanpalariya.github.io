function ensureEpubExtension(value: string): string {
  return value.toLowerCase().endsWith(".epub") ? value : `${value}.epub`;
}

export function sanitizeDownloadFileName(value: string): string {
  return value
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.+$/g, "");
}

export function buildEpubFileName(
  manualFileName: string,
  title: string,
  author: string,
): string {
  const composedBase = [title.trim(), author.trim()].filter(Boolean).join(" - ");
  const base = manualFileName.trim() || composedBase || "epub-maker-pages";
  const sanitized = sanitizeDownloadFileName(base) || "epub-maker-pages";
  return ensureEpubExtension(sanitized);
}

export function buildAutoEpubFileName(title: string, author: string): string {
  return buildEpubFileName("", title, author);
}
