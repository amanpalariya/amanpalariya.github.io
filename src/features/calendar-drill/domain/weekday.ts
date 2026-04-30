export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DateParts = {
  year: number;
  month: number;
  day: number;
};

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function getWeekdayForDate(parts: DateParts): (typeof WEEKDAYS)[number] {
  const weekdayIndex = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day),
  ).getUTCDay() as WeekdayIndex;

  return WEEKDAYS[weekdayIndex];
}
