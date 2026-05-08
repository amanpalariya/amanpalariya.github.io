import { expect, type Locator, type Page } from "@playwright/test";

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

type Weekday = (typeof WEEKDAYS)[number];

const MONTH_INDEX_BY_LABEL: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

const MONTH_LABEL_BY_NUMBER = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function parseQuestionDate(dateText: string): Date {
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateText);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }

  const monthDayYearMatch = /^([A-Z][a-z]{2}) (\d{1,2}), (\d{4})$/.exec(dateText);
  if (monthDayYearMatch) {
    const [, month, day, year] = monthDayYearMatch;
    return new Date(Date.UTC(Number(year), MONTH_INDEX_BY_LABEL[month], Number(day)));
  }

  const dayMonthYearMatch = /^(\d{1,2}) ([A-Z][a-z]{2}) (\d{4})$/.exec(dateText);
  if (dayMonthYearMatch) {
    const [, day, month, year] = dayMonthYearMatch;
    return new Date(Date.UTC(Number(year), MONTH_INDEX_BY_LABEL[month], Number(day)));
  }

  throw new Error(`Unsupported Calendar Drill question date: ${dateText}`);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function weekdayButtonName(weekday: Weekday, shortcut: number) {
  return new RegExp(`^${weekday} ${shortcut}$`);
}

export class CalendarDrillPageObject {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get startButton(): Locator {
    return this.page.getByRole("button", { name: /^Start(?: Enter)?$/ });
  }

  get nextButton(): Locator {
    return this.page.getByRole("button", { name: /^Next(?: Enter)?$/ });
  }

  get resetButton(): Locator {
    return this.page.getByRole("button", { name: "Reset", exact: true });
  }

  get answerButtons(): Locator {
    return this.page.getByRole("button", {
      name: /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday) [0-7]$/,
    });
  }

  async goto() {
    await this.page.goto("/tools/calendar-drill");
    await expect(this.page.getByRole("heading", { name: "Calendar Drill" })).toBeVisible();
  }

  async start() {
    await this.startButton.click();
    await expect(this.page.getByText(/Weekday for .+\?/)).toBeVisible();
  }

  async openAdvancedSettings() {
    if (await this.page.getByLabel("Select date format").isVisible()) {
      return;
    }
    const button = this.page.getByRole("button", { name: /advanced settings/i });
    await button.click();
    await expect(this.page.getByLabel("Select date format")).toBeVisible();
  }

  settingSwitch(label: string) {
    return this.page.getByRole("checkbox", { name: label });
  }

  async setSettingSwitch(label: string, checked: boolean) {
    await this.settingSwitch(label).setChecked(checked, { force: true });
    await expect(this.settingSwitch(label)).toBeChecked({ checked });
  }

  async setYearRange(year: number) {
    const yearText = String(year);
    await this.page.getByRole("spinbutton", { name: "From Year" }).fill(yearText);
    await this.page.getByRole("spinbutton", { name: "To Year" }).fill(yearText);
    await expect(this.page.getByRole("spinbutton", { name: "From Year" })).toHaveValue(yearText);
    await expect(this.page.getByRole("spinbutton", { name: "To Year" })).toHaveValue(yearText);
  }

  async selectOnlyMonth(month: number) {
    await this.page.getByRole("button", { name: "All", exact: true }).click();

    for (let currentMonth = 1; currentMonth <= 12; currentMonth += 1) {
      await expect(this.monthButton(currentMonth)).toHaveAttribute("aria-pressed", "false");
    }

    await this.monthButton(month).click();
    await expect(this.monthButton(month)).toHaveAttribute("aria-pressed", "true");
  }

  monthButton(month: number) {
    const label = MONTH_LABEL_BY_NUMBER[month];
    if (!label) {
      throw new Error(`Unsupported month number: ${month}`);
    }
    return this.page.locator(`[data-calendar-drill-month="${month}"]`).filter({ hasText: label });
  }

  async setDateFormat(value: "locale" | "month-day-year" | "day-month-year" | "iso") {
    await this.page.getByLabel("Select date format").selectOption(value);
    await expect(this.page.getByLabel("Select date format")).toHaveValue(value);
  }

  async questionDateText() {
    const promptText = await this.page.getByText(/Weekday for .+\?/).textContent();
    const match = /^Weekday for (.+)\?$/.exec(promptText?.trim() ?? "");

    if (!match) {
      throw new Error(`Could not parse Calendar Drill prompt: ${promptText}`);
    }

    return match[1];
  }

  async questionDate() {
    return parseQuestionDate(await this.questionDateText());
  }

  async expectedWeekdayForCurrentQuestion() {
    const date = await this.questionDate();
    return WEEKDAYS[date.getUTCDay()];
  }

  async answerCurrentQuestionCorrectly() {
    const expectedWeekday = await this.expectedWeekdayForCurrentQuestion();
    await this.page.getByRole("button", { name: new RegExp(`^${expectedWeekday} [0-7]$`) }).click();
    return expectedWeekday;
  }

  async chooseVisibleAnswer(weekday: Weekday) {
    await this.page.getByRole("button", { name: new RegExp(`^${escapeRegExp(weekday)} [0-7]$`) }).click();
  }

  async chooseIncorrectAnswerForCurrentQuestion() {
    const correctWeekday = await this.expectedWeekdayForCurrentQuestion();
    const incorrectWeekday = WEEKDAYS.find((weekday) => weekday !== correctWeekday);
    if (!incorrectWeekday) {
      throw new Error("Could not find an incorrect weekday choice");
    }

    await this.chooseVisibleAnswer(incorrectWeekday);
    return incorrectWeekday;
  }

  async pressNumericShortcut(shortcut: number) {
    await this.page.keyboard.press(String(shortcut));
  }

  async expectSelectedAnswer(weekday: Weekday) {
    await expect(this.page.getByRole("button", { name: weekday, exact: true })).toBeDisabled();
  }

  async expectAnswerButtons(expected: ReadonlyArray<{ weekday: Weekday; shortcut: number }>) {
    await expect(this.answerButtons).toHaveCount(expected.length);

    for (const [index, answer] of expected.entries()) {
      await expect(this.answerButtons.nth(index)).toHaveAccessibleName(
        weekdayButtonName(answer.weekday, answer.shortcut),
      );
    }
  }

  stat(label: "Accuracy" | "Answered" | "Avg Time" | "Streak") {
    return this.page.getByText(label, { exact: true }).locator("..");
  }

  async expectStats({
    accuracy,
    answered,
    streak,
  }: {
    accuracy: string;
    answered: string;
    streak: string;
  }) {
    await expect(this.stat("Accuracy")).toContainText(accuracy);
    await expect(this.stat("Answered")).toContainText(answered);
    await expect(this.stat("Streak")).toContainText(streak);
  }

  async expectIdleStats() {
    await expect(this.stat("Accuracy")).toContainText("-");
    await expect(this.stat("Answered")).toContainText("-");
    await expect(this.stat("Avg Time")).toContainText("-");
    await expect(this.stat("Streak")).toContainText("-");
  }
}
