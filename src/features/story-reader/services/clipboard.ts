export async function writeTextToClipboard(text: string): Promise<void> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    throw new Error("Clipboard API unavailable");
  }

  await navigator.clipboard.writeText(text);
}

