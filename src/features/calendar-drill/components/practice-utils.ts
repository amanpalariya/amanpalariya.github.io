import {
  getWeekdayForDate,
  type DateParts,
  type WeekdayIndex,
  WEEKDAYS,
} from "../domain/weekday";
import type { DateFormatPreference, PracticeSettings } from "../types";
import type {
  PracticeQuestion,
  PracticeStats,
  PracticeTrends,
  WeekdayChoice,
} from "./models";

export const MIN_ALLOWED_YEAR = 1600;
export const MAX_ALLOWED_YEAR = 2399;

const SUNDAY_FIRST_ORDER: WeekdayIndex[] = [0, 1, 2, 3, 4, 5, 6];
const MONDAY_FIRST_ORDER: WeekdayIndex[] = [1, 2, 3, 4, 5, 6, 0];
export const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export const MONTH_LABELS = [
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

type CalendarDrillSignalColorToken =
  | "app.calendarDrill.signal.positive"
  | "app.calendarDrill.signal.negative"
  | "app.calendarDrill.signal.neutral";

export function clampYear(value: number): number {
  return Math.max(MIN_ALLOWED_YEAR, Math.min(MAX_ALLOWED_YEAR, value));
}

export function normalizeYearRange(
  minYear: number,
  maxYear: number,
): { minYear: number; maxYear: number } {
  const safeMin = clampYear(minYear);
  const safeMax = clampYear(maxYear);
  if (safeMin <= safeMax) return { minYear: safeMin, maxYear: safeMax };
  return { minYear: safeMax, maxYear: safeMin };
}

function padDatePart(value: number): string {
  return String(value).padStart(2, "0");
}

export function normalizeSelectedMonths(months: number[]): number[] {
  return Array.from(new Set(months))
    .filter((month) => Number.isInteger(month) && month >= 1 && month <= 12)
    .sort((left, right) => left - right);
}

function resolveQuestionMonths(months: number[]): number[] {
  const selectedMonths = normalizeSelectedMonths(months);
  return selectedMonths.length > 0 ? selectedMonths : [...ALL_MONTHS];
}

export function formatDateHuman(
  parts: DateParts,
  dateFormat: DateFormatPreference = "locale",
): string {
  if (dateFormat === "iso") {
    return `${parts.year}-${padDatePart(parts.month)}-${padDatePart(parts.day)}`;
  }

  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  };

  if (dateFormat === "month-day-year")
    return date.toLocaleDateString("en-US", options);
  if (dateFormat === "day-month-year")
    return date.toLocaleDateString("en-GB", options);

  return date.toLocaleDateString(undefined, options);
}

export function getRandomDate(
  minYear: number,
  maxYear: number,
  selectedMonths: number[],
): DateParts {
  const { minYear: boundedMin, maxYear: boundedMax } = normalizeYearRange(
    minYear,
    maxYear,
  );
  const monthPool = resolveQuestionMonths(selectedMonths);
  const year =
    Math.floor(Math.random() * (boundedMax - boundedMin + 1)) + boundedMin;
  const month = monthPool[Math.floor(Math.random() * monthPool.length)];
  const maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const day = Math.floor(Math.random() * maxDay) + 1;

  return { year, month, day };
}

export function weekdayChoices(settings: PracticeSettings): WeekdayChoice[] {
  const weekdayOrder =
    settings.weekStartDay === "monday"
      ? MONDAY_FIRST_ORDER
      : SUNDAY_FIRST_ORDER;

  return weekdayOrder.map((weekdayIndex, displayIndex) => ({
    value: String(weekdayIndex),
    label: WEEKDAYS[weekdayIndex],
    shortcutKey: String(displayIndex + settings.firstDayNumberBase),
  }));
}

export function buildQuestion(settings: PracticeSettings): PracticeQuestion {
  const date = getRandomDate(
    settings.minYear,
    settings.maxYear,
    settings.selectedMonths,
  );
  const formattedDate = formatDateHuman(date, settings.dateFormat);
  const correctWeekday = getWeekdayForDate(date);
  const correctIndex = WEEKDAYS.findIndex(
    (weekday) => weekday === correctWeekday,
  );

  return {
    date,
    formattedDate,
    choices: weekdayChoices(settings),
    correctValue: String(correctIndex),
    prompt: `Weekday for ${formattedDate}?`,
  };
}

export function createInitialPracticeStats(): PracticeStats {
  return {
    attempts: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    totalResponseMs: 0,
  };
}

export function createInitialPracticeTrends(): PracticeTrends {
  return {
    accuracyDelta: null,
    avgResponseDeltaMs: null,
  };
}

export function formatMs(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

export function toDisplayedAvgMs(avgMs: number): number {
  return Math.round(avgMs / 100) * 100;
}

export function formatSignedPercent(delta: number): string {
  if (delta === 0) return "0%";
  return `${delta > 0 ? "+" : ""}${delta}%`;
}

export function formatSignedMsDelta(deltaMs: number): string {
  const seconds = (Math.abs(deltaMs) / 1000).toFixed(1);
  if (deltaMs === 0) return "0.0s";
  return `${deltaMs > 0 ? "+" : "-"}${seconds}s`;
}

export function getSignalColorToken(
  delta: number,
  isIncreasePositiveSignal: boolean,
): CalendarDrillSignalColorToken {
  if (delta === 0) return "app.calendarDrill.signal.neutral";

  const isUptrend = delta > 0;
  const isPositiveSignal = isUptrend === isIncreasePositiveSignal;

  return isPositiveSignal
    ? "app.calendarDrill.signal.positive"
    : "app.calendarDrill.signal.negative";
}
