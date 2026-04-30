import {
  CALENDAR_DRILL_STORAGE_FIELDS,
  CALENDAR_DRILL_TOOL_ID,
} from "../constants";
import type {
  DateFormatPreference,
  FirstDayNumberBase,
  PracticeSettings,
  WeekStartDay,
} from "../types";
import { buildToolStorageKey } from "@utils/storage";

const MIN_ALLOWED_YEAR = 1600;
const MAX_ALLOWED_YEAR = 2399;
const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function clampYear(value: number): number {
  return Math.max(MIN_ALLOWED_YEAR, Math.min(MAX_ALLOWED_YEAR, value));
}

function normalizeYearRange(
  minYear: number,
  maxYear: number,
): { minYear: number; maxYear: number } {
  const safeMin = clampYear(minYear);
  const safeMax = clampYear(maxYear);
  if (safeMin <= safeMax) return { minYear: safeMin, maxYear: safeMax };
  return { minYear: safeMax, maxYear: safeMin };
}

function isWeekStartDay(value: unknown): value is WeekStartDay {
  return value === "sunday" || value === "monday";
}

function isFirstDayNumberBase(value: unknown): value is FirstDayNumberBase {
  return value === 0 || value === 1;
}

function isDateFormatPreference(value: unknown): value is DateFormatPreference {
  return (
    value === "locale" ||
    value === "month-day-year" ||
    value === "day-month-year" ||
    value === "iso"
  );
}

function normalizeSelectedMonths(months: number[]): number[] {
  return Array.from(new Set(months))
    .filter((month) => Number.isInteger(month) && month >= 1 && month <= 12)
    .sort((left, right) => left - right);
}

function readToolString(field: string, fallback: string): string {
  const value = window.localStorage.getItem(
    buildToolStorageKey(CALENDAR_DRILL_TOOL_ID, field),
  );
  return typeof value === "string" ? value : fallback;
}

function readToolNumber(field: string, fallback: number): number {
  const value = readToolString(field, "");
  if (!value) return fallback;
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function readToolNumberList(field: string, fallback: number[]): number[] {
  const value = window.localStorage.getItem(
    buildToolStorageKey(CALENDAR_DRILL_TOOL_ID, field),
  );
  if (value === null) return fallback;
  if (value === "") return [];

  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
}

export function createDefaultPracticeSettings(): PracticeSettings {
  return {
    minYear: 2000,
    maxYear: new Date().getFullYear(),
    selectedMonths: ALL_MONTHS,
    dateFormat: "locale",
    weekStartDay: "sunday",
    firstDayNumberBase: 1,
  };
}

export function readCalendarDrillSettings(): PracticeSettings {
  const defaultSettings = createDefaultPracticeSettings();
  if (typeof window === "undefined") return defaultSettings;

  try {
    const minYear = readToolNumber(
      CALENDAR_DRILL_STORAGE_FIELDS.minYear,
      defaultSettings.minYear,
    );
    const maxYear = readToolNumber(
      CALENDAR_DRILL_STORAGE_FIELDS.maxYear,
      defaultSettings.maxYear,
    );
    const yearRange = normalizeYearRange(minYear, maxYear);

    const weekStartDayValue = readToolString(
      CALENDAR_DRILL_STORAGE_FIELDS.weekStartDay,
      defaultSettings.weekStartDay,
    );

    const firstDayNumberBaseValue = readToolNumber(
      CALENDAR_DRILL_STORAGE_FIELDS.firstDayNumberBase,
      defaultSettings.firstDayNumberBase,
    );
    const selectedMonthsValue = readToolNumberList(
      CALENDAR_DRILL_STORAGE_FIELDS.selectedMonths,
      defaultSettings.selectedMonths,
    );
    const dateFormatValue = readToolString(
      CALENDAR_DRILL_STORAGE_FIELDS.dateFormat,
      defaultSettings.dateFormat,
    );

    return {
      minYear: yearRange.minYear,
      maxYear: yearRange.maxYear,
      selectedMonths: normalizeSelectedMonths(selectedMonthsValue),
      dateFormat: isDateFormatPreference(dateFormatValue)
        ? dateFormatValue
        : defaultSettings.dateFormat,
      weekStartDay: isWeekStartDay(weekStartDayValue)
        ? weekStartDayValue
        : defaultSettings.weekStartDay,
      firstDayNumberBase: isFirstDayNumberBase(firstDayNumberBaseValue)
        ? firstDayNumberBaseValue
        : defaultSettings.firstDayNumberBase,
    };
  } catch {
    return defaultSettings;
  }
}

export function writeCalendarDrillSettings(settings: PracticeSettings): void {
  if (typeof window === "undefined") return;

  const yearRange = normalizeYearRange(settings.minYear, settings.maxYear);
  const selectedMonths = normalizeSelectedMonths(settings.selectedMonths);
  try {
    window.localStorage.setItem(
      buildToolStorageKey(
        CALENDAR_DRILL_TOOL_ID,
        CALENDAR_DRILL_STORAGE_FIELDS.minYear,
      ),
      String(yearRange.minYear),
    );
    window.localStorage.setItem(
      buildToolStorageKey(
        CALENDAR_DRILL_TOOL_ID,
        CALENDAR_DRILL_STORAGE_FIELDS.maxYear,
      ),
      String(yearRange.maxYear),
    );
    window.localStorage.setItem(
      buildToolStorageKey(
        CALENDAR_DRILL_TOOL_ID,
        CALENDAR_DRILL_STORAGE_FIELDS.selectedMonths,
      ),
      selectedMonths.join(","),
    );
    window.localStorage.setItem(
      buildToolStorageKey(
        CALENDAR_DRILL_TOOL_ID,
        CALENDAR_DRILL_STORAGE_FIELDS.dateFormat,
      ),
      settings.dateFormat,
    );
    window.localStorage.setItem(
      buildToolStorageKey(
        CALENDAR_DRILL_TOOL_ID,
        CALENDAR_DRILL_STORAGE_FIELDS.weekStartDay,
      ),
      settings.weekStartDay,
    );
    window.localStorage.setItem(
      buildToolStorageKey(
        CALENDAR_DRILL_TOOL_ID,
        CALENDAR_DRILL_STORAGE_FIELDS.firstDayNumberBase,
      ),
      String(settings.firstDayNumberBase),
    );
  } catch {
    // ignore localStorage write failures
  }
}
