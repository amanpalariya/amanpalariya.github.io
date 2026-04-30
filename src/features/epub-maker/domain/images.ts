import { resolveAbsoluteUrl } from "../utils/url";
import type { EpubImage, GenerationWarning, PageId } from "../types";

export function mediaTypeToExtension(mediaType: string): string {
  const normalized = mediaType.toLowerCase();
  if (normalized.includes("image/jpeg")) return "jpg";
  if (normalized.includes("image/png")) return "png";
  if (normalized.includes("image/webp")) return "webp";
  if (normalized.includes("image/gif")) return "gif";
  if (normalized.includes("image/svg+xml")) return "svg";
  if (normalized.includes("image/avif")) return "avif";
  return "bin";
}

export function dataUrlToBytes(
  dataUrl: string,
): { bytes: Uint8Array; mediaType: string } | null {
  if (!dataUrl.startsWith("data:")) return null;
  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex < 0) return null;

  const metadata = dataUrl.slice("data:".length, commaIndex);
  const payload = dataUrl.slice(commaIndex + 1);
  const metadataParts = metadata.split(";");
  const mediaType = metadataParts[0] || "application/octet-stream";
  const isBase64 = metadataParts
    .slice(1)
    .some((part) => part.toLowerCase() === "base64");

  try {
    if (isBase64) {
      const binary = atob(payload);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      return { bytes, mediaType };
    }

    const decoded = decodeURIComponent(payload);
    const encoder = new TextEncoder();
    return { bytes: encoder.encode(decoded), mediaType };
  } catch {
    return null;
  }
}

function bytesToText(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function textToBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function escapeAttributeValue(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function relativeAssetHref(fromHref: string, toHref: string): string {
  const fromParts = fromHref.split("/");
  const toParts = toHref.split("/");
  fromParts.pop();

  while (
    fromParts.length > 0 &&
    toParts.length > 0 &&
    fromParts[0] === toParts[0]
  ) {
    fromParts.shift();
    toParts.shift();
  }

  return `${"../".repeat(fromParts.length)}${toParts.join("/")}`;
}

export type RegisterImageParams = {
  src: string;
  baseUrl: string | null;
  pageId?: PageId;
  embedRemoteImages: boolean;
  signal?: AbortSignal;
  imagesByKey: Map<string, EpubImage>;
  nextImageNumber: () => number;
};

export type RegisterImageResult = {
  localHref: string | null;
  absoluteSrc: string | null;
  warning?: GenerationWarning;
};

async function rewriteEmbeddedSvgDataImages(
  svgBytes: Uint8Array,
  svgHref: string,
  params: Omit<RegisterImageParams, "src">,
): Promise<Uint8Array> {
  const svg = bytesToText(svgBytes);
  const imageHrefPattern =
    /\b((?:xlink:)?href)=["'](data:image\/[^"']+)["']/gi;
  const replacements = new Map<string, string>();

  let match = imageHrefPattern.exec(svg);
  while (match) {
    const dataUrl = match[2];
    if (replacements.has(dataUrl)) {
      match = imageHrefPattern.exec(svg);
      continue;
    }

    const result = await registerImageAsset({
      ...params,
      src: dataUrl,
    });
    if (!result.localHref) {
      match = imageHrefPattern.exec(svg);
      continue;
    }

    replacements.set(dataUrl, relativeAssetHref(svgHref, result.localHref));
    match = imageHrefPattern.exec(svg);
  }

  if (replacements.size === 0) {
    return svgBytes;
  }

  const rewrittenSvg = svg.replace(imageHrefPattern, (fullMatch, attr, dataUrl) => {
    const replacement = replacements.get(dataUrl);
    if (!replacement) return fullMatch;
    return `${attr}="${escapeAttributeValue(replacement)}"`;
  });

  return textToBytes(rewrittenSvg);
}

export async function registerImageAsset(
  params: RegisterImageParams,
): Promise<RegisterImageResult> {
  const {
    src,
    baseUrl,
    pageId,
    embedRemoteImages,
    signal,
    imagesByKey,
    nextImageNumber,
  } = params;

  const absoluteSrc = resolveAbsoluteUrl(src, baseUrl);
  if (!absoluteSrc) {
    return {
      localHref: null,
      absoluteSrc: null,
      warning: {
        code: "UNRESOLVED_IMAGE",
        message: `Skipped image with unresolved src: ${src}`,
        pageId,
        source: src,
      },
    };
  }

  const existing = imagesByKey.get(absoluteSrc);
  if (existing) return { localHref: existing.href, absoluteSrc };

  if (absoluteSrc.startsWith("data:")) {
    const parsed = dataUrlToBytes(absoluteSrc);
    if (!parsed) {
      return {
        localHref: null,
        absoluteSrc,
        warning: {
          code: "MALFORMED_DATA_URL",
          message: "Skipped malformed data URL image.",
          pageId,
          source: absoluteSrc,
        },
      };
    }

    const index = nextImageNumber();
    const ext = mediaTypeToExtension(parsed.mediaType);
    const href = `images/image-${index}.${ext}`;
    const bytes = parsed.mediaType.toLowerCase().includes("image/svg+xml")
      ? await rewriteEmbeddedSvgDataImages(parsed.bytes, href, {
          baseUrl,
          pageId,
          embedRemoteImages,
          signal,
          imagesByKey,
          nextImageNumber,
        })
      : parsed.bytes;
    const image: EpubImage = {
      id: `img-${index}`,
      href,
      mediaType: parsed.mediaType,
      bytes,
      sourceUrl: absoluteSrc,
    };
    imagesByKey.set(absoluteSrc, image);
    return { localHref: image.href, absoluteSrc };
  }

  if (!embedRemoteImages) {
    return { localHref: null, absoluteSrc };
  }

  try {
    const response = await fetch(absoluteSrc, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const mediaType = blob.type || "application/octet-stream";
    const bytes = new Uint8Array(await blob.arrayBuffer());

    const index = nextImageNumber();
    const ext = mediaTypeToExtension(mediaType);
    const image: EpubImage = {
      id: `img-${index}`,
      href: `images/image-${index}.${ext}`,
      mediaType,
      bytes,
      sourceUrl: absoluteSrc,
    };
    imagesByKey.set(absoluteSrc, image);
    return { localHref: image.href, absoluteSrc };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    return {
      localHref: null,
      absoluteSrc,
      warning: {
        code: "FETCH_IMAGE_FAILED",
        message: `Could not fetch image (network/CORS). Keeping external image URL instead: ${absoluteSrc}`,
        pageId,
        source: absoluteSrc,
      },
    };
  }
}
