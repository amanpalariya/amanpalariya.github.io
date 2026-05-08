import { describe, expect, it } from "vitest";
import { getWeekdayForDate, WEEKDAYS } from "./weekday";

describe("getWeekdayForDate", () => {
  it("returns known weekdays across modern, leap-year, and historical dates", () => {
    expect(getWeekdayForDate({ year: 2026, month: 5, day: 8 })).toBe("Friday");
    expect(getWeekdayForDate({ year: 2000, month: 2, day: 29 })).toBe("Tuesday");
    expect(getWeekdayForDate({ year: 1900, month: 3, day: 1 })).toBe("Thursday");
    expect(getWeekdayForDate({ year: 1970, month: 1, day: 1 })).toBe("Thursday");
  });

  it("uses UTC calendar math so local timezone cannot shift the answer", () => {
    expect(getWeekdayForDate({ year: 2024, month: 1, day: 1 })).toBe("Monday");
    expect(getWeekdayForDate({ year: 2024, month: 12, day: 31 })).toBe("Tuesday");
  });

  it("only returns one of the defined weekday labels", () => {
    const result = getWeekdayForDate({ year: 2399, month: 12, day: 31 });

    expect(WEEKDAYS).toContain(result);
  });
});
