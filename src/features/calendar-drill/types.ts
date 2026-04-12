export type WeekStartDay = "sunday" | "monday";
export type FirstDayNumberBase = 0 | 1;

export type PracticeSettings = {
  minYear: number;
  maxYear: number;
  weekStartDay: WeekStartDay;
  firstDayNumberBase: FirstDayNumberBase;
};
