export type FunctionalPageCase = {
  name: string;
  path: string;
  heading: RegExp | string;
};

export const toolPageCases: FunctionalPageCase[] = [
  {
    name: "Calendar Drill",
    path: "/tools/calendar-drill",
    heading: "Calendar Drill",
  },
  {
    name: "EPUB Maker",
    path: "/tools/epub-maker",
    heading: "EPUB Maker",
  },
];

export const nonToolPageCases: FunctionalPageCase[] = [
  {
    name: "Feature Flags",
    path: "/features",
    heading: "Feature Flags",
  },
];
