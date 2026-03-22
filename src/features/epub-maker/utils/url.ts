export function resolveAbsoluteUrl(
  url: string,
  baseUrl: string | null,
): string | null {
  if (!url) return null;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("//")) {
    const baseProtocol = baseUrl ? new URL(baseUrl).protocol : "https:";
    return `${baseProtocol}${url}`;
  }

  try {
    const absolute = new URL(url).toString();
    return absolute;
  } catch {
    if (!baseUrl) return null;
    try {
      return new URL(url, baseUrl).toString();
    } catch {
      return null;
    }
  }
}
