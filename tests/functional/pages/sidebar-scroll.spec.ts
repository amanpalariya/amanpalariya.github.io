import { expect, test, type Locator } from "@playwright/test";

async function expectScrollableWithinViewport(region: Locator) {
  await region.page().evaluate(() => document.fonts.ready);
  const dimensions = await region.evaluate((element) => ({
    height: element.clientHeight,
    contentHeight: element.scrollHeight,
    bottom: element.getBoundingClientRect().bottom,
    viewportHeight: window.innerHeight,
  }));
  expect(dimensions.contentHeight).toBeGreaterThan(dimensions.height);
  expect(dimensions.bottom).toBeLessThanOrEqual(dimensions.viewportHeight + 1);

  await region.hover({ position: { x: 8, y: 8 } });
  await region.page().mouse.wheel(0, 1200);
  await expect
    .poll(() => region.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  expect(await region.page().evaluate(() => window.scrollY)).toBe(0);

  const lastLink = region.getByRole("link").last();
  await lastLink.focus();
  await expect(lastLink).toBeInViewport();
}

test.describe("Sidebars on short screens", () => {
  for (const width of [900, 1150, 1440]) {
    test(`navigation scrolls independently at ${width}px wide`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 280 });
      await page.goto("/");
      await expectScrollableWithinViewport(page.locator(".site-header"));
    });
  }

  for (const path of [
    "/",
    "/tools/epub-maker",
    "/tools/bilingual-story-reader",
  ]) {
    test(`right sidebar scrolls independently on ${path}`, async ({ page }) => {
      await page.setViewportSize({
        width: 1440,
        height: path === "/" ? 160 : 200,
      });
      await page.goto(path);
      if (path === "/tools/epub-maker") {
        await expect(
          page.locator(".site-sidebar-slot .epub-book-settings"),
        ).toBeVisible();
      } else if (path === "/tools/bilingual-story-reader") {
        await expect(
          page.locator(".site-sidebar-slot .bilingual-story-history"),
        ).toBeVisible();
      }
      await expectScrollableWithinViewport(
        page.getByRole("complementary", { name: "Additional information" }),
      );
    });
  }

  test("expanded mobile navigation fits a short screen", async ({ page }) => {
    await page.setViewportSize({ width: 568, height: 280 });
    await page.goto("/");
    await page
      .getByRole("button", { name: "Open mobile navigation menu" })
      .click();
    await expectScrollableWithinViewport(page.locator(".site-header"));
    await page
      .getByRole("navigation", { name: "Mobile navigation menu" })
      .getByRole("link", { name: "Tools", exact: true })
      .click();
    await expect(page).toHaveURL(/\/tools\/?$/);
    await expect(
      page.getByRole("button", { name: "Open mobile navigation menu" }),
    ).toBeVisible();
  });
});
