import { expect, type Locator, type Page } from "@playwright/test";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

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
      name: /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday) [1-7]$/,
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

  settingSwitch(label: string) {
    return this.page.getByRole("checkbox", { name: label });
  }

  async setSettingSwitch(label: string, checked: boolean) {
    await this.settingSwitch(label).setChecked(checked, { force: true });
  }

  async questionDateText() {
    const promptText = await this.page.getByText(/Weekday for .+\?/).textContent();
    const match = /^Weekday for (.+)\?$/.exec(promptText?.trim() ?? "");

    if (!match) {
      throw new Error(`Could not parse Calendar Drill prompt: ${promptText}`);
    }

    return match[1];
  }

  async expectedWeekdayForCurrentQuestion() {
    const date = parseQuestionDate(await this.questionDateText());
    return WEEKDAYS[date.getUTCDay()];
  }

  async answerCurrentQuestionCorrectly() {
    const expectedWeekday = await this.expectedWeekdayForCurrentQuestion();
    await this.page.getByRole("button", { name: new RegExp(`^${expectedWeekday} [1-7]$`) }).click();
    return expectedWeekday;
  }

  stat(label: "Accuracy" | "Answered" | "Avg Time" | "Streak") {
    return this.page.getByText(label, { exact: true }).locator("..");
  }

  async expectIdleStats() {
    await expect(this.stat("Accuracy")).toContainText("-");
    await expect(this.stat("Answered")).toContainText("-");
    await expect(this.stat("Avg Time")).toContainText("-");
    await expect(this.stat("Streak")).toContainText("-");
  }
}
