import { expect, test } from "../support/fixtures";

test.describe("Feature Flags page", () => {
  test("persists changed feature flag values across refreshes", async ({ page }) => {
    await page.goto("/features");

    const blogsFlag = page.getByRole("checkbox", { name: "Blogs" });
    const emptyStatesFlag = page.getByRole("checkbox", { name: "Force empty states" });

    await expect(blogsFlag).toBeChecked();
    await expect(emptyStatesFlag).not.toBeChecked();

    await blogsFlag.setChecked(false, { force: true });
    await emptyStatesFlag.setChecked(true, { force: true });
    await page.reload();

    await expect(page.getByRole("checkbox", { name: "Blogs" })).not.toBeChecked();
    await expect(page.getByRole("checkbox", { name: "Force empty states" })).toBeChecked();
  });
});
