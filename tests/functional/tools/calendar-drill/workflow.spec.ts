import { expect, test } from "../../support/fixtures";

test.describe("Calendar Drill workflow", () => {
  test("walks through three questions, updates stats, advances, and resets", async ({
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
    await calendarDrill.expectStats({ accuracy: "100%", answered: "1", streak: "1" });

    const firstQuestionDate = await calendarDrill.questionDateText();
    await calendarDrill.nextButton.click();

    await expect(calendarDrill.nextButton).toBeDisabled();
    await expect(page.getByText(/Weekday for .+\?/)).toBeVisible();
    await expect
      .poll(() => calendarDrill.questionDateText())
      .not.toBe(firstQuestionDate);

    await calendarDrill.chooseIncorrectAnswerForCurrentQuestion();
    await expect(calendarDrill.nextButton).toBeEnabled();
    await calendarDrill.expectStats({ accuracy: "50%", answered: "2", streak: "0" });

    await calendarDrill.nextButton.click();
    await expect(calendarDrill.nextButton).toBeDisabled();

    await calendarDrill.answerCurrentQuestionCorrectly();
    await expect(calendarDrill.nextButton).toBeEnabled();
    await calendarDrill.expectStats({ accuracy: "67%", answered: "3", streak: "1" });

    await calendarDrill.resetButton.click();
    await expect(calendarDrill.startButton).toBeVisible();
    await calendarDrill.expectIdleStats();
  });
});
