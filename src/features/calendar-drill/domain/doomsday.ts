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

const MONTH_DOOMSDAY_COMMON_YEAR = [3, 28, 14, 4, 9, 6, 11, 8, 5, 10, 7, 12];
const MONTH_DOOMSDAY_LEAP_YEAR = [4, 29, 14, 4, 9, 6, 11, 8, 5, 10, 7, 12];

export type DoomsdaySteps = {
  century: number;
  centuryAnchor: WeekdayIndex;
  yearWithinCentury: number;
  yearPartA: number;
  yearPartB: number;
  yearPartC: number;
  yearAnchor: WeekdayIndex;
  isLeapYear: boolean;
  monthDoomsdayDay: number;
  offsetFromMonthDoomsday: number;
  weekdayIndex: WeekdayIndex;
};

function toWeekdayIndex(value: number): WeekdayIndex {
  return ((value % 7) + 7) % 7 as WeekdayIndex;
}

export function isLeapYear(year: number): boolean {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  return year % 4 === 0;
}

export function getCenturyAnchor(century: number): WeekdayIndex {
  return toWeekdayIndex(5 * (century % 4) + 2);
}

export function getMonthDoomsdayDay(month: number, leapYear: boolean): number {
  const source = leapYear ? MONTH_DOOMSDAY_LEAP_YEAR : MONTH_DOOMSDAY_COMMON_YEAR;
  return source[month - 1];
}

export function calculateDoomsdaySteps(parts: DateParts): DoomsdaySteps {
  const { year, month, day } = parts;
  const century = Math.floor(year / 100);
  const yearWithinCentury = year % 100;
  const yearPartA = Math.floor(yearWithinCentury / 12);
  const yearPartB = yearWithinCentury % 12;
  const yearPartC = Math.floor(yearPartB / 4);
  const centuryAnchor = getCenturyAnchor(century);
  const yearAnchor = toWeekdayIndex(centuryAnchor + yearPartA + yearPartB + yearPartC);
  const leapYear = isLeapYear(year);
  const monthDoomsdayDay = getMonthDoomsdayDay(month, leapYear);
  const offsetFromMonthDoomsday = day - monthDoomsdayDay;
  const weekdayIndex = toWeekdayIndex(yearAnchor + offsetFromMonthDoomsday);

  return {
    century,
    centuryAnchor,
    yearWithinCentury,
    yearPartA,
    yearPartB,
    yearPartC,
    yearAnchor,
    isLeapYear: leapYear,
    monthDoomsdayDay,
    offsetFromMonthDoomsday,
    weekdayIndex,
  };
}

export function getWeekdayForDate(parts: DateParts): (typeof WEEKDAYS)[number] {
  return WEEKDAYS[calculateDoomsdaySteps(parts).weekdayIndex];
}
