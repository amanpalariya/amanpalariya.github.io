export function fileNameToTitle(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^./\\]+$/, "");
  const normalized = withoutExtension
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalized || "Untitled";
}

export function isMarkdownFile(file: File): boolean {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();
  return (
    mimeType === "text/markdown" ||
    mimeType === "text/x-markdown" ||
    mimeType === "application/markdown" ||
    fileName.endsWith(".md") ||
    fileName.endsWith(".markdown") ||
    fileName.endsWith(".mdown") ||
    fileName.endsWith(".mkd") ||
    fileName.endsWith(".mkdn")
  );
}
