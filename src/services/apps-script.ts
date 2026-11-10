const deploymentUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL?.trim();

export const hasAppsScriptUrl = Boolean(deploymentUrl);

export class AppsScriptRequestError extends Error {
  constructor(
    readonly reason: "connection" | "unavailable" | "invalid-response",
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

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

  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      credentials: "omit",
      signal,
    });
  } catch (cause) {
    if (signal?.aborted) throw cause;
    throw new AppsScriptRequestError(
      "connection",
      "Apps Script could not be reached.",
      { cause },
    );
  }
  if (!response.ok) {
    throw new AppsScriptRequestError(
      "unavailable",
      `Apps Script request failed (${response.status}).`,
    );
  }

  try {
    return parse(await response.json());
  } catch (cause) {
    if (signal?.aborted) throw cause;
    throw new AppsScriptRequestError(
      "invalid-response",
      "Invalid Apps Script response.",
      { cause },
    );
  }
}
