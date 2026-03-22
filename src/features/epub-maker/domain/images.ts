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
  const match = dataUrl.match(/^data:([^;,]+)?(?:;base64)?,([\s\S]*)$/);
  if (!match) return null;
  const mediaType = match[1] || "application/octet-stream";
  const payload = match[2] || "";
  const isBase64 = dataUrl.includes(";base64,");

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

export type RegisterImageParams = {
  src: string;
  baseUrl: string | null;
  pageId?: PageId;
  embedRemoteImages: boolean;
  imagesByKey: Map<string, EpubImage>;
  nextImageNumber: () => number;
};

export type RegisterImageResult = {
  localHref: string | null;
  absoluteSrc: string | null;
  warning?: GenerationWarning;
};

export async function registerImageAsset(
  params: RegisterImageParams,
): Promise<RegisterImageResult> {
  const {
    src,
    baseUrl,
    pageId,
    embedRemoteImages,
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
    const image: EpubImage = {
      id: `img-${index}`,
      href: `images/image-${index}.${ext}`,
      mediaType: parsed.mediaType,
      bytes: parsed.bytes,
      sourceUrl: absoluteSrc,
    };
    imagesByKey.set(absoluteSrc, image);
    return { localHref: image.href, absoluteSrc };
  }

  if (!embedRemoteImages) {
    return { localHref: null, absoluteSrc };
  }

  try {
    const response = await fetch(absoluteSrc);
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
  } catch {
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
