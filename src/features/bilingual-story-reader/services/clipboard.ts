export async function writeTextToClipboard(text: string): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    throw new Error("Clipboard API unavailable");
  }

  await navigator.clipboard.writeText(text);
}

export async function readTextFromClipboard(): Promise<string> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    throw new Error("Clipboard API unavailable");
  }

  const text = await navigator.clipboard.readText();
  if (!text.trim()) {
    throw new Error("Clipboard is empty.");
  }

  return text;
}
