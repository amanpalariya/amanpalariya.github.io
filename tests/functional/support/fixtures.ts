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
  page: async ({ page }, fixtureUse) => {
    await resetBrowserStorage(page);
    await fixtureUse(page);
  },
  calendarDrill: async ({ page }, fixtureUse) => {
    await fixtureUse(new CalendarDrillPageObject(page));
  },
  epubMaker: async ({ page }, fixtureUse) => {
    await fixtureUse(new EpubMakerPageObject(page));
  },
  featureFlags: async ({ page }, fixtureUse) => {
    await fixtureUse(new FeatureFlagsPageObject(page));
  },
});

export { expect };
