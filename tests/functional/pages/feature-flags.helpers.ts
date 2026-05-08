import { expect, type Locator, type Page } from "@playwright/test";

export class FeatureFlagsPageObject {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  flag(label: "Blogs" | "Force empty states"): Locator {
    return this.page.getByRole("checkbox", { name: label });
  }

  async goto() {
    await this.page.goto("/features");
    await expect(this.page.getByRole("heading", { name: "Feature Flags" })).toBeVisible();
  }

  async setFlag(label: "Blogs" | "Force empty states", checked: boolean) {
    await this.goto();
    await this.flag(label).setChecked(checked, { force: true });
    await expect(this.flag(label)).toBeChecked({ checked });
  }
}
