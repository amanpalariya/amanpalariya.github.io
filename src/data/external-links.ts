export const EXTERNAL_LINK_KINDS = [
  "code",
  "video",
  "demo",
  "dashboard",
  "article",
  "slides",
  "download",
  "other",
] as const;

export type ExternalLinkKind = (typeof EXTERNAL_LINK_KINDS)[number];

export type ExternalLink = {
  label: string;
  url: string;
  kind?: ExternalLinkKind;
};

const externalLinkKindSet = new Set<string>(EXTERNAL_LINK_KINDS);

function getDefaultLabel(kind?: ExternalLinkKind) {
  switch (kind) {
    case "code":
      return "Code";
    case "video":
      return "Video";
    case "demo":
      return "Demo";
    case "dashboard":
      return "Dashboard";
    case "article":
      return "Article";
    case "slides":
      return "Slides";
    case "download":
      return "Download";
    default:
      return "External Link";
  }
}

function normalizeKind(value: unknown): ExternalLinkKind | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  return externalLinkKindSet.has(normalized)
    ? (normalized as ExternalLinkKind)
    : undefined;
}

function normalizeSingleLink(item: unknown): ExternalLink | null {
  if (typeof item === "string") {
    const url = item.trim();
    if (!url) return null;
    return { label: "External Link", url };
  }

  if (!item || typeof item !== "object") return null;

  const record = item as Record<string, unknown>;
  const url = typeof record.url === "string" ? record.url.trim() : "";
  if (!url) return null;

  const kind = normalizeKind(record.kind);
  const providedLabel =
    typeof record.label === "string" ? record.label.trim() : "";

  return {
    label: providedLabel || getDefaultLabel(kind),
    url,
    kind,
  };
}

export function normalizeExternalLinks(input: unknown): ExternalLink[] {
  if (!Array.isArray(input)) return [];

  return input
    .map(normalizeSingleLink)
    .filter((link): link is ExternalLink => Boolean(link));
}

export function isLikelyExternalUrl(url: string): boolean {
  const trimmed = url.trim();
  return /^(https?:\/\/|mailto:|tel:)/i.test(trimmed);
}

export function mergeExternalLinks(
  links: ExternalLink[],
  legacyExternalUrl?: string,
): ExternalLink[] {
  const merged = [...links];

  if (legacyExternalUrl && isLikelyExternalUrl(legacyExternalUrl)) {
    merged.push({
      label: "Project Link",
      url: legacyExternalUrl,
      kind: "other",
    });
  }

  const dedup = new Map<string, ExternalLink>();
  for (const link of merged) {
    if (!dedup.has(link.url)) dedup.set(link.url, link);
  }

  return Array.from(dedup.values());
}
