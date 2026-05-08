import { expect, test } from "../../support/fixtures";
import {
  MAX_ALLOWED_YEAR,
  MIN_ALLOWED_YEAR,
} from "../../../../src/features/calendar-drill/components/practice-utils";

test.describe("Calendar Drill settings", () => {
  test("persists year range, date format, month filter, and weekday layout settings across refreshes", async ({
    page,
    calendarDrill,
  }) => {
    await calendarDrill.goto();

    await calendarDrill.setYearRange(2024);
    await calendarDrill.openAdvancedSettings();
    await calendarDrill.setDateFormat("iso");
    await calendarDrill.selectOnlyMonth(2);
    await calendarDrill.setSettingSwitch("Monday as first day", true);
    await calendarDrill.setSettingSwitch("First day starts at 0", true);

    await page.reload();

    await expect(page.getByRole("button", { name: /advanced settings/i })).toContainText(
      "1 month",
    );

    await expect(page.getByRole("spinbutton", { name: "From Year" })).toHaveValue("2024");
    await expect(page.getByRole("spinbutton", { name: "To Year" })).toHaveValue("2024");
    await page.getByRole("button", { name: /advanced settings/i }).click();
    await expect(page.getByLabel("Select date format")).toHaveValue("iso");
    await expect(calendarDrill.monthButton(1)).toHaveAttribute("aria-pressed", "false");
    await expect(calendarDrill.monthButton(2)).toHaveAttribute("aria-pressed", "true");
    await expect(calendarDrill.monthButton(3)).toHaveAttribute("aria-pressed", "false");
    await expect(calendarDrill.settingSwitch("Monday as first day")).toBeChecked();
    await expect(calendarDrill.settingSwitch("First day starts at 0")).toBeChecked();
  });

  test("applies every date display format to the practice prompt", async ({ page, calendarDrill }) => {
    const cases = [
      { value: "locale" as const, pattern: /^[A-Z][a-z]{2,3} \d{1,2}, 2024$/ },
      { value: "month-day-year" as const, pattern: /^[A-Z][a-z]{2,3} \d{1,2}, 2024$/ },
      { value: "day-month-year" as const, pattern: /^\d{1,2} [A-Z][a-z]{2,3} 2024$/ },
      { value: "iso" as const, pattern: /^2024-\d{2}-\d{2}$/ },
    ];

    for (const dateFormatCase of cases) {
      await calendarDrill.goto();
      await calendarDrill.setYearRange(2024);
      await calendarDrill.openAdvancedSettings();
      await calendarDrill.setDateFormat(dateFormatCase.value);
      await calendarDrill.start();

      await expect.poll(() => calendarDrill.questionDateText()).toMatch(dateFormatCase.pattern);

      await calendarDrill.resetButton.click();
      await page.evaluate(() => window.localStorage.clear());
    }
  });

  test("uses the selected month filter when generating questions", async ({ calendarDrill }) => {
    await calendarDrill.goto();
    await calendarDrill.setYearRange(2024);
    await calendarDrill.openAdvancedSettings();
    await calendarDrill.setDateFormat("iso");
    await calendarDrill.selectOnlyMonth(2);
    await calendarDrill.start();

    for (let index = 0; index < 5; index += 1) {
      const questionDate = await calendarDrill.questionDate();
      expect(questionDate.getUTCFullYear()).toBe(2024);
      expect(questionDate.getUTCMonth()).toBe(1);

      await calendarDrill.answerCurrentQuestionCorrectly();
      if (index < 4) {
        await calendarDrill.nextButton.click();
      }
    }
  });

  test("clamps out-of-range year inputs before generating questions", async ({
    calendarDrill,
  }) => {
    await calendarDrill.goto();

    await calendarDrill.page.getByRole("spinbutton", { name: "From Year" }).fill("100");
    await calendarDrill.page.getByRole("spinbutton", { name: "To Year" }).fill("3000");
    await expect(calendarDrill.page.getByRole("spinbutton", { name: "From Year" })).toHaveValue(
      String(MIN_ALLOWED_YEAR),
    );
    await expect(calendarDrill.page.getByRole("spinbutton", { name: "To Year" })).toHaveValue(
      String(MAX_ALLOWED_YEAR),
    );

    await calendarDrill.openAdvancedSettings();
    await calendarDrill.setDateFormat("iso");
    await calendarDrill.start();

    const questionDate = await calendarDrill.questionDate();
    expect(questionDate.getUTCFullYear()).toBeGreaterThanOrEqual(MIN_ALLOWED_YEAR);
    expect(questionDate.getUTCFullYear()).toBeLessThanOrEqual(MAX_ALLOWED_YEAR);
  });

  test("normalizes an inverted year range and falls back to all months when none are selected", async ({
    calendarDrill,
  }) => {
    await calendarDrill.goto();

    await calendarDrill.page.getByRole("spinbutton", { name: "From Year" }).fill("2030");
    await calendarDrill.page.getByRole("spinbutton", { name: "To Year" }).fill("2020");
    await expect(calendarDrill.page.getByRole("spinbutton", { name: "From Year" })).toHaveValue(
      "2020",
    );
    await expect(calendarDrill.page.getByRole("spinbutton", { name: "To Year" })).toHaveValue(
      "2020",
    );

    await calendarDrill.openAdvancedSettings();
    await calendarDrill.setDateFormat("iso");
    await calendarDrill.page.getByRole("button", { name: "All", exact: true }).click();
    for (let currentMonth = 1; currentMonth <= 12; currentMonth += 1) {
      await expect(calendarDrill.monthButton(currentMonth)).toHaveAttribute("aria-pressed", "false");
    }

    await calendarDrill.start();
    const questionDate = await calendarDrill.questionDate();
    expect(questionDate.getUTCFullYear()).toBe(2020);
    expect(questionDate.getUTCMonth()).toBeGreaterThanOrEqual(0);
    expect(questionDate.getUTCMonth()).toBeLessThanOrEqual(11);
  });
});
