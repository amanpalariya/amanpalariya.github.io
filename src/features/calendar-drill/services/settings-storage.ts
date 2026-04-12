import {
  CALENDAR_DRILL_STORAGE_FIELDS,
  CALENDAR_DRILL_TOOL_ID,
} from "../constants";
import type { FirstDayNumberBase, PracticeSettings, WeekStartDay } from "../types";
import { buildToolStorageKey } from "@utils/storage";

const MIN_ALLOWED_YEAR = 1600;
const MAX_ALLOWED_YEAR = 2399;

function clampYear(value: number): number {
  return Math.max(MIN_ALLOWED_YEAR, Math.min(MAX_ALLOWED_YEAR, value));
}

function normalizeYearRange(minYear: number, maxYear: number): { minYear: number; maxYear: number } {
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

export function createDefaultPracticeSettings(): PracticeSettings {
  return {
    minYear: 2000,
    maxYear: new Date().getFullYear(),
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

    return {
      minYear: yearRange.minYear,
      maxYear: yearRange.maxYear,
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
