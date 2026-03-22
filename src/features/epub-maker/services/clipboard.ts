function imageTypeFromClipboardItemTypes(types: readonly string[]): string | null {
  for (const type of types) {
    if (type.startsWith("image/")) {
      return type;
    }
  }
  return null;
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  const mediaType = blob.type || "application/octet-stream";
  return `data:${mediaType};base64,${base64}`;
}

export async function clipboardImageBlobToHtml(blob: Blob): Promise<string> {
  const dataUrl = await blobToDataUrl(blob);
  return `<figure><img src="${dataUrl}" alt="Pasted image" /></figure>`;
}

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

    for (const item of items) {
      const imageType = imageTypeFromClipboardItemTypes(item.types);
      if (!imageType) continue;
      const imageBlob = await item.getType(imageType);
      if (imageBlob.size > 0) {
        return clipboardImageBlobToHtml(imageBlob);
      }
    }
  }

  const clipboardText = await navigator.clipboard.readText();
  if (!clipboardText || !clipboardText.trim()) {
    throw new Error("Clipboard is empty.");
  }
  return clipboardText;
}
