import { expect, test } from "../../support/fixtures";

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

  test("uses numeric answer shortcuts", async ({ page, calendarDrill }) => {
    await calendarDrill.goto();
    await calendarDrill.start();

    await page.keyboard.press("1");

    await expect(calendarDrill.nextButton).toBeEnabled();
    await expect(calendarDrill.stat("Answered")).toContainText("1");
  });

  test("uses weekday prefix shortcuts for answer selection", async ({ page, calendarDrill }) => {
    await calendarDrill.goto();
    await calendarDrill.start();

    const expectedWeekday = await calendarDrill.expectedWeekdayForCurrentQuestion();
    await page.keyboard.type(expectedWeekday);

    await expect(calendarDrill.nextButton).toBeEnabled();
    await expect(calendarDrill.stat("Answered")).toContainText("1");
  });
});
