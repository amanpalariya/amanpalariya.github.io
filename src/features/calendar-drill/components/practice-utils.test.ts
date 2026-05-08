import { describe, expect, it, vi } from "vitest";
import type { PracticeSettings } from "../types";
import {
  buildQuestion,
  clampYear,
  formatDateHuman,
  formatMs,
  formatSignedMsDelta,
  formatSignedPercent,
  getRandomDate,
  getSignalColorToken,
  normalizeSelectedMonths,
  normalizeYearRange,
  toDisplayedAvgMs,
  weekdayChoices,
} from "./practice-utils";

const settings: PracticeSettings = {
  minYear: 2024,
  maxYear: 2024,
  selectedMonths: [2],
  weekStartDay: "sunday",
  firstDayNumberBase: 1,
  dateFormat: "iso",
};

describe("calendar drill practice utilities", () => {
  it("clamps and normalizes year ranges inside supported bounds", () => {
    expect(clampYear(1599)).toBe(1600);
    expect(clampYear(2400)).toBe(2399);
    expect(normalizeYearRange(2400, 1500)).toEqual({
      minYear: 1600,
      maxYear: 2399,
    });
  });

  it("deduplicates, bounds, and sorts selected months", () => {
    expect(normalizeSelectedMonths([12, 0, 2, 2, 13, 1, 3.5, -1])).toEqual([
      1,
      2,
      12,
    ]);
  });

  it("formats dates using explicit supported formats", () => {
    const date = { year: 2026, month: 5, day: 8 };

    expect(formatDateHuman(date, "iso")).toBe("2026-05-08");
    expect(formatDateHuman(date, "month-day-year")).toBe("May 8, 2026");
    expect(formatDateHuman(date, "day-month-year")).toBe("8 May 2026");
  });

  it("builds weekday choices in Sunday-first and Monday-first order with configured shortcuts", () => {
    expect(
      weekdayChoices({
        ...settings,
        weekStartDay: "sunday",
        firstDayNumberBase: 1,
      }).map(({ label, shortcutKey }) => `${shortcutKey}:${label}`),
    ).toEqual([
      "1:Sunday",
      "2:Monday",
      "3:Tuesday",
      "4:Wednesday",
      "5:Thursday",
      "6:Friday",
      "7:Saturday",
    ]);

    expect(
      weekdayChoices({
        ...settings,
        weekStartDay: "monday",
        firstDayNumberBase: 0,
      }).map(({ label, shortcutKey }) => `${shortcutKey}:${label}`),
    ).toEqual([
      "0:Monday",
      "1:Tuesday",
      "2:Wednesday",
      "3:Thursday",
      "4:Friday",
      "5:Saturday",
      "6:Sunday",
    ]);
  });

  it("generates dates inside the normalized year, month, and day bounds", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.99)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.99);

    expect(getRandomDate(2024, 2024, [2])).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
  });

  it("builds a question with the formatted prompt and correct weekday value", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0);

    expect(buildQuestion(settings)).toMatchObject({
      date: { year: 2024, month: 2, day: 1 },
      formattedDate: "2024-02-01",
      correctValue: "4",
      prompt: "Weekday for 2024-02-01?",
    });
  });

  it("formats response-time and trend deltas consistently", () => {
    expect(formatMs(1234)).toBe("1.2s");
    expect(toDisplayedAvgMs(1249)).toBe(1200);
    expect(toDisplayedAvgMs(1250)).toBe(1300);
    expect(formatSignedPercent(5)).toBe("+5%");
    expect(formatSignedPercent(-5)).toBe("-5%");
    expect(formatSignedPercent(0)).toBe("0%");
    expect(formatSignedMsDelta(1250)).toBe("+1.3s");
    expect(formatSignedMsDelta(-1250)).toBe("-1.3s");
    expect(formatSignedMsDelta(0)).toBe("0.0s");
  });

  it("maps positive, negative, and neutral trend signals to semantic tokens", () => {
    expect(getSignalColorToken(5, true)).toBe(
      "app.calendarDrill.signal.positive",
    );
    expect(getSignalColorToken(-5, true)).toBe(
      "app.calendarDrill.signal.negative",
    );
    expect(getSignalColorToken(-5, false)).toBe(
      "app.calendarDrill.signal.positive",
    );
    expect(getSignalColorToken(0, true)).toBe(
      "app.calendarDrill.signal.neutral",
    );
  });
});
