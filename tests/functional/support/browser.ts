import type { Page } from "@playwright/test";

export async function resetBrowserStorage(page: Page) {
  await page.addInitScript(() => {
    const resetMarker = "__functional_storage_reset__";
    if (window.sessionStorage.getItem(resetMarker)) return;

    window.localStorage.clear();
    window.sessionStorage.setItem(resetMarker, "true");
  });
}
