import { expect, test } from "../../support/fixtures";

test.describe("Calendar Drill workflow", () => {
  test("walks through three questions, updates stats, advances, and resets", async ({
    page,
    calendarDrill,
  }) => {
    await page.addInitScript(() => {
      let now = 1_000;
      Date.now = () => now;
      (
        window as unknown as Window & {
          __setFunctionalNow?: (nextNow: number) => void;
        }
      ).__setFunctionalNow = (nextNow: number) => {
        now = nextNow;
      };
    });
    await calendarDrill.goto();

    await calendarDrill.expectIdleStats();
    await calendarDrill.start();

    await expect(calendarDrill.answerButtons).toHaveCount(7);
    await expect(calendarDrill.nextButton).toBeDisabled();

    await page.evaluate(() => {
      (
        window as unknown as Window & {
          __setFunctionalNow: (nextNow: number) => void;
        }
      ).__setFunctionalNow(2_200);
    });
    const expectedWeekday = await calendarDrill.answerCurrentQuestionCorrectly();

    await expect(page.getByRole("button", { name: expectedWeekday, exact: true })).toBeDisabled();
    await expect(calendarDrill.nextButton).toBeEnabled();
    await calendarDrill.expectStats({ accuracy: "100%", answered: "1", streak: "1" });
    await expect(calendarDrill.stat("Avg Time")).toContainText("1.2s");

    const firstQuestionDate = await calendarDrill.questionDateText();
    await calendarDrill.nextButton.click();

    await expect(calendarDrill.nextButton).toBeDisabled();
    await expect(page.getByText(/Weekday for .+\?/)).toBeVisible();
    await expect
      .poll(() => calendarDrill.questionDateText())
      .not.toBe(firstQuestionDate);

    await page.evaluate(() => {
      (
        window as unknown as Window & {
          __setFunctionalNow: (nextNow: number) => void;
        }
      ).__setFunctionalNow(3_000);
    });
    await calendarDrill.chooseIncorrectAnswerForCurrentQuestion();
    await expect(calendarDrill.nextButton).toBeEnabled();
    await calendarDrill.expectStats({ accuracy: "50%", answered: "2", streak: "0" });
    await expect(calendarDrill.stat("Avg Time")).toContainText("1.0s");

    await calendarDrill.nextButton.click();
    await expect(calendarDrill.nextButton).toBeDisabled();

    await page.evaluate(() => {
      (
        window as unknown as Window & {
          __setFunctionalNow: (nextNow: number) => void;
        }
      ).__setFunctionalNow(4_500);
    });
    await calendarDrill.answerCurrentQuestionCorrectly();
    await expect(calendarDrill.nextButton).toBeEnabled();
    await calendarDrill.expectStats({ accuracy: "67%", answered: "3", streak: "1" });
    await expect(calendarDrill.stat("Avg Time")).toContainText("1.2s");

    await calendarDrill.resetButton.click();
    await expect(calendarDrill.startButton).toBeVisible();
    await calendarDrill.expectIdleStats();
  });

  test("reset ends the session without clearing persisted settings", async ({
    calendarDrill,
  }) => {
    await calendarDrill.goto();
    await calendarDrill.setYearRange(2024);
    await calendarDrill.openAdvancedSettings();
    await calendarDrill.setDateFormat("iso");
    await calendarDrill.selectOnlyMonth(2);

    await calendarDrill.start();
    await calendarDrill.answerCurrentQuestionCorrectly();
    await calendarDrill.resetButton.click();

    await expect(calendarDrill.page.getByRole("spinbutton", { name: "From Year" })).toHaveValue(
      "2024",
    );
    await expect(calendarDrill.page.getByRole("spinbutton", { name: "To Year" })).toHaveValue(
      "2024",
    );
    await calendarDrill.openAdvancedSettings();
    await expect(calendarDrill.page.getByLabel("Select date format")).toHaveValue("iso");
    await expect(calendarDrill.monthButton(2)).toHaveAttribute("aria-pressed", "true");
  });
});
