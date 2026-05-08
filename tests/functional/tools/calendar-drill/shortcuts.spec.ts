import { expect, test } from "../../support/fixtures";
import { WEEKDAYS } from "./calendar-drill.helpers";

const UNIQUE_WEEKDAY_PREFIXES = [
  { weekday: "Sunday", prefix: "Su" },
  { weekday: "Monday", prefix: "M" },
  { weekday: "Tuesday", prefix: "Tu" },
  { weekday: "Wednesday", prefix: "W" },
  { weekday: "Thursday", prefix: "Th" },
  { weekday: "Friday", prefix: "F" },
  { weekday: "Saturday", prefix: "Sa" },
] as const;

test.describe("Calendar Drill shortcuts", () => {
  test("uses Enter to start and advance after an answer", async ({ page, calendarDrill }) => {
    await calendarDrill.goto();

    await page.keyboard.press("Enter");
    await expect(page.getByText(/Weekday for .+\?/)).toBeVisible();

    const firstQuestionDate = await calendarDrill.questionDateText();
    await calendarDrill.answerCurrentQuestionCorrectly();
    await expect(calendarDrill.nextButton).toBeEnabled();

    await page.keyboard.press("Enter");
    await expect(calendarDrill.nextButton).toBeDisabled();
    await expect
      .poll(() => calendarDrill.questionDateText())
      .not.toBe(firstQuestionDate);
  });

  test("uses every numeric shortcut in the default Sunday-first, one-based layout", async ({
    calendarDrill,
  }) => {
    await calendarDrill.goto();

    for (const [index, weekday] of WEEKDAYS.entries()) {
      await calendarDrill.start();

      await calendarDrill.pressNumericShortcut(index + 1);

      await calendarDrill.expectSelectedAnswer(weekday);
      await expect(calendarDrill.nextButton).toBeEnabled();
      await expect(calendarDrill.stat("Answered")).toContainText("1");

      await calendarDrill.resetButton.click();
    }
  });

  test("uses every numeric shortcut in the Monday-first, zero-based layout", async ({
    calendarDrill,
  }) => {
    const mondayFirstWeekdays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ] as const;

    await calendarDrill.goto();
    await calendarDrill.openAdvancedSettings();
    await calendarDrill.setSettingSwitch("Monday as first day", true);
    await calendarDrill.setSettingSwitch("First day starts at 0", true);

    for (const [index, weekday] of mondayFirstWeekdays.entries()) {
      await calendarDrill.start();

      await calendarDrill.pressNumericShortcut(index);

      await calendarDrill.expectSelectedAnswer(weekday);
      await expect(calendarDrill.nextButton).toBeEnabled();
      await expect(calendarDrill.stat("Answered")).toContainText("1");

      await calendarDrill.resetButton.click();
    }
  });

  test("uses every unique weekday prefix shortcut for answer selection", async ({
    page,
    calendarDrill,
  }) => {
    await calendarDrill.goto();

    for (const { weekday, prefix } of UNIQUE_WEEKDAY_PREFIXES) {
      await calendarDrill.start();

      await page.keyboard.type(prefix);

      await calendarDrill.expectSelectedAnswer(weekday);
      await expect(calendarDrill.nextButton).toBeEnabled();
      await expect(calendarDrill.stat("Answered")).toContainText("1");

      await calendarDrill.resetButton.click();
    }
  });
});
