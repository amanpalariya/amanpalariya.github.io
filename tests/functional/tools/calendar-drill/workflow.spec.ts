import { expect, test } from "../../support/fixtures";

test.describe("Calendar Drill workflow", () => {
  test("starts, answers correctly, updates stats, advances, and resets", async ({
    page,
    calendarDrill,
  }) => {
    await calendarDrill.goto();

    await calendarDrill.expectIdleStats();
    await calendarDrill.start();

    await expect(calendarDrill.answerButtons).toHaveCount(7);
    await expect(calendarDrill.nextButton).toBeDisabled();

    const expectedWeekday = await calendarDrill.answerCurrentQuestionCorrectly();

    await expect(page.getByRole("button", { name: expectedWeekday, exact: true })).toBeDisabled();
    await expect(calendarDrill.nextButton).toBeEnabled();
    await expect(calendarDrill.stat("Accuracy")).toContainText("100%");
    await expect(calendarDrill.stat("Answered")).toContainText("1");
    await expect(calendarDrill.stat("Streak")).toContainText("1");

    const firstQuestionDate = await calendarDrill.questionDateText();
    await calendarDrill.nextButton.click();

    await expect(calendarDrill.nextButton).toBeDisabled();
    await expect(page.getByText(/Weekday for .+\?/)).toBeVisible();
    await expect
      .poll(() => calendarDrill.questionDateText())
      .not.toBe(firstQuestionDate);

    await calendarDrill.resetButton.click();
    await expect(calendarDrill.startButton).toBeVisible();
    await calendarDrill.expectIdleStats();
  });
});
