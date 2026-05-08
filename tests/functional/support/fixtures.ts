import { expect, test as base } from "@playwright/test";
import { resetBrowserStorage } from "./browser";
import { CalendarDrillPageObject } from "../tools/calendar-drill/calendar-drill.helpers";
import { EpubMakerPageObject } from "../tools/epub-maker/epub-maker.helpers";
import { FeatureFlagsPageObject } from "../pages/feature-flags.helpers";

type FunctionalFixtures = {
  calendarDrill: CalendarDrillPageObject;
  epubMaker: EpubMakerPageObject;
  featureFlags: FeatureFlagsPageObject;
};

export const test = base.extend<FunctionalFixtures>({
  page: async ({ page }, use) => {
    await resetBrowserStorage(page);
    await use(page);
  },
  calendarDrill: async ({ page }, use) => {
    await use(new CalendarDrillPageObject(page));
  },
  epubMaker: async ({ page }, use) => {
    await use(new EpubMakerPageObject(page));
  },
  featureFlags: async ({ page }, use) => {
    await use(new FeatureFlagsPageObject(page));
  },
});

export { expect };
