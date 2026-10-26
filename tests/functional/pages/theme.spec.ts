import { expect, test } from "../support/fixtures";

test("theme selection persists and system follows device appearance", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const root = page.locator("html");
  await expect(
    page.getByRole("button", {
      name: "Change theme: Use device setting",
      exact: true,
    }),
  ).toBeVisible();
  await expect(root).toHaveClass(/\blight\b/);

  for (const label of ["Dark", "Light", "Use device setting"]) {
    await page.getByRole("button", { name: /^Change theme:/ }).click();
    await page.getByRole("menuitemradio", { name: label, exact: true }).click();
    await expect(
      page.getByRole("button", { name: `Change theme: ${label}`, exact: true }),
    ).toBeVisible();
    await expect(root).toHaveClass(label === "Dark" ? /\bdark\b/ : /\blight\b/);
    await page.reload();
    await expect(
      page.getByRole("button", { name: `Change theme: ${label}`, exact: true }),
    ).toBeVisible();
  }

  await page.emulateMedia({ colorScheme: "dark" });
  await expect(root).toHaveClass(/\bdark\b/);
  const trigger = page.getByRole("button", {
    name: "Change theme: Use device setting",
    exact: true,
  });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("menuitemradio", {
      name: "Use device setting",
      exact: true,
    }),
  ).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});
