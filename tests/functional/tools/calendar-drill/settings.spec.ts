import { expect, test } from "../../support/fixtures";

test.describe("Calendar Drill settings", () => {
  test("persists date format, month filter, and weekday layout settings across refreshes", async ({
    page,
    calendarDrill,
  }) => {
    await calendarDrill.goto();

    await page.getByRole("button", { name: /advanced settings/i }).click();
    await page.getByLabel("Select date format").selectOption("iso");
    await page.getByRole("button", { name: "Jan" }).click();
    await calendarDrill.setSettingSwitch("Monday as first day", true);
    await calendarDrill.setSettingSwitch("First day starts at 0", true);

    await page.reload();

    await expect(page.getByRole("button", { name: /advanced settings/i })).toContainText(
      "2026-04-30",
    );

    await page.getByRole("button", { name: /advanced settings/i }).click();
    await expect(page.getByRole("button", { name: "Jan" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(calendarDrill.settingSwitch("Monday as first day")).toBeChecked();
    await expect(calendarDrill.settingSwitch("First day starts at 0")).toBeChecked();
  });
});
