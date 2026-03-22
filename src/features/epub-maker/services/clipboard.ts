export async function readClipboardPageInput(): Promise<string> {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    throw new Error("Clipboard API unavailable");
  }

  if ("read" in navigator.clipboard) {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      if (item.types.includes("text/html")) {
        const htmlBlob = await item.getType("text/html");
        const html = await htmlBlob.text();
        if (html.trim()) return html;
      }
    }

    for (const item of items) {
      if (item.types.includes("text/plain")) {
        const textBlob = await item.getType("text/plain");
        const text = await textBlob.text();
        if (text.trim()) return text;
      }
    }
  }

  const clipboardText = await navigator.clipboard.readText();
  if (!clipboardText || !clipboardText.trim()) {
    throw new Error("Clipboard is empty.");
  }
  return clipboardText;
}
