import { test } from "../../support/fixtures";

const LAYOUT_CASES = [
  {
    name: "Sunday first, one based",
    mondayFirst: false,
    zeroBased: false,
    expected: [
      { weekday: "Sunday", shortcut: 1 },
      { weekday: "Monday", shortcut: 2 },
      { weekday: "Tuesday", shortcut: 3 },
      { weekday: "Wednesday", shortcut: 4 },
      { weekday: "Thursday", shortcut: 5 },
      { weekday: "Friday", shortcut: 6 },
      { weekday: "Saturday", shortcut: 7 },
    ],
  },
  {
    name: "Sunday first, zero based",
    mondayFirst: false,
    zeroBased: true,
    expected: [
      { weekday: "Sunday", shortcut: 0 },
      { weekday: "Monday", shortcut: 1 },
      { weekday: "Tuesday", shortcut: 2 },
      { weekday: "Wednesday", shortcut: 3 },
      { weekday: "Thursday", shortcut: 4 },
      { weekday: "Friday", shortcut: 5 },
      { weekday: "Saturday", shortcut: 6 },
    ],
  },
  {
    name: "Monday first, one based",
    mondayFirst: true,
    zeroBased: false,
    expected: [
      { weekday: "Monday", shortcut: 1 },
      { weekday: "Tuesday", shortcut: 2 },
      { weekday: "Wednesday", shortcut: 3 },
      { weekday: "Thursday", shortcut: 4 },
      { weekday: "Friday", shortcut: 5 },
      { weekday: "Saturday", shortcut: 6 },
      { weekday: "Sunday", shortcut: 7 },
    ],
  },
  {
    name: "Monday first, zero based",
    mondayFirst: true,
    zeroBased: true,
    expected: [
      { weekday: "Monday", shortcut: 0 },
      { weekday: "Tuesday", shortcut: 1 },
      { weekday: "Wednesday", shortcut: 2 },
      { weekday: "Thursday", shortcut: 3 },
      { weekday: "Friday", shortcut: 4 },
      { weekday: "Saturday", shortcut: 5 },
      { weekday: "Sunday", shortcut: 6 },
    ],
  },
] as const;

test.describe("Calendar Drill weekday layout", () => {
  for (const layoutCase of LAYOUT_CASES) {
    test(`renders answers and shortcut labels for ${layoutCase.name}`, async ({
      calendarDrill,
    }) => {
      await calendarDrill.goto();
      await calendarDrill.openAdvancedSettings();
      await calendarDrill.setSettingSwitch("Monday as first day", layoutCase.mondayFirst);
      await calendarDrill.setSettingSwitch("First day starts at 0", layoutCase.zeroBased);

      await calendarDrill.start();

      await calendarDrill.expectAnswerButtons(layoutCase.expected);
    });
  }
});
