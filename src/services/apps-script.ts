const deploymentUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL?.trim();

export const hasAppsScriptUrl = Boolean(deploymentUrl);

export async function requestAppsScript<T>(
  route: string,
  parse: (data: unknown) => T,
  signal?: AbortSignal,
): Promise<T> {
  if (!deploymentUrl) {
    throw new Error("NEXT_PUBLIC_APPS_SCRIPT_URL is missing.");
  }

  const url = new URL(deploymentUrl);
  url.searchParams.set("route", route);

  const response = await fetch(url, { credentials: "omit", signal });
  if (!response.ok) {
    throw new Error(`Apps Script request failed (${response.status}).`);
  }

  const data: unknown = await response.json();
  return parse(data);
}
