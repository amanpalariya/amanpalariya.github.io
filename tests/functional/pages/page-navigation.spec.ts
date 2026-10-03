import { expect, test } from "../support/fixtures";

for (const { path, title } of [
  { path: "/features", title: "Feature Flags" },
  { path: "/blogs", title: "Blogs" },
  { path: "/projects", title: "Projects" },
]) {
  test(`${path} shows its title in the shared page header`, async ({
    page,
  }) => {
    await page.goto(path);
    const mobile = (page.viewportSize()?.width ?? 0) <= 600;
    const desktopHeader = page.locator("main .site-page-navigation");
    const mobileHeader = page.locator("header .site-mobile-page-title");

    await expect(mobile ? mobileHeader : desktopHeader).toBeVisible();
    await expect(mobile ? mobileHeader : desktopHeader).toHaveText(title);
    await expect(mobile ? desktopHeader : mobileHeader).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}
