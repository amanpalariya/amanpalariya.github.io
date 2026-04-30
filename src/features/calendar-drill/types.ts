export type WeekStartDay = "sunday" | "monday";
export type FirstDayNumberBase = 0 | 1;
export type DateFormatPreference =
  | "locale"
  | "month-day-year"
  | "day-month-year"
  | "iso";

export type PracticeSettings = {
  minYear: number;
  maxYear: number;
  selectedMonths: number[];
  dateFormat: DateFormatPreference;
  weekStartDay: WeekStartDay;
  firstDayNumberBase: FirstDayNumberBase;
};
