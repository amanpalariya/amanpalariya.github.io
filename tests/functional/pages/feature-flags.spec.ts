import { expect, test } from "../support/fixtures";

test.describe("Feature Flags page", () => {
  test("persists changed feature flag values across refreshes", async ({ page, featureFlags }) => {
    await featureFlags.goto();

    const blogsFlag = featureFlags.flag("Blogs");
    const emptyStatesFlag = featureFlags.flag("Force empty states");
    await expect(blogsFlag).toBeChecked();
    await expect(emptyStatesFlag).not.toBeChecked();

    await blogsFlag.setChecked(false, { force: true });
    await emptyStatesFlag.setChecked(true, { force: true });
    await page.reload();

    await expect(page.getByRole("checkbox", { name: "Blogs" })).not.toBeChecked();
    await expect(page.getByRole("checkbox", { name: "Force empty states" })).toBeChecked();
  });

  test("force empty states flag shows empty states instead of real content", async ({
    page,
    featureFlags,
  }) => {
    await page.goto("/projects");
    await expect(page.getByText("SAMPAN")).toBeVisible();
    await expect(page.getByText("There are no projects yet!")).toHaveCount(0);

    await page.goto("/blogs");
    await expect(page.getByText("Code Rewrite is Dangerous")).toBeVisible();
    await expect(page.getByText("There are no blogs yet!")).toHaveCount(0);

    await page.goto("/tools");
    await expect(page.getByText("Calendar Drill")).toBeVisible();
    await expect(page.getByText("No tools found")).toHaveCount(0);

    await featureFlags.setFlag("Force empty states", true);

    await page.goto("/");
    await expect(page.getByText("There is no work experience yet!")).toBeVisible();
    await expect(page.getByText("There are no projects yet!")).toBeVisible();
    await expect(page.getByText("Console Game Language")).toHaveCount(0);

    await page.goto("/projects");
    await expect(page.getByText("There are no projects yet!")).toBeVisible();
    await expect(page.getByText("SAMPAN")).toHaveCount(0);

    await page.goto("/blogs");
    await expect(page.getByText("There are no blogs yet!")).toBeVisible();
    await expect(page.getByText("Code Rewrite is Dangerous")).toHaveCount(0);

    await page.goto("/tools");
    await expect(page.getByText("No tools found")).toBeVisible();
    await expect(page.getByText("Calendar Drill")).toHaveCount(0);
    await expect(page.getByText("EPUB Maker")).toHaveCount(0);
  });

  test("blogs flag controls blog navigation and blog page access", async ({ page, featureFlags }) => {
    await featureFlags.setFlag("Blogs", false);

    await page.goto("/");
    const primaryNavigation = page.getByRole("navigation", { name: "Primary navigation" });
    await expect(primaryNavigation.getByRole("link", { name: "Blogs" })).toHaveCount(0);

    await page.goto("/blogs");
    await expect(page.getByRole("heading", { name: "Dear explorer, are you lost?" })).toBeVisible();
    await expect(page.getByText("Code Rewrite is Dangerous")).toHaveCount(0);

    await page.goto("/blogs/code-rewrite-is-dangerous");
    await expect(page.getByText("Code Rewrite is Dangerous")).toHaveCount(0);

    await featureFlags.setFlag("Blogs", true);

    await page.goto("/");
    await expect(primaryNavigation.getByRole("link", { name: "Blogs" })).toBeVisible();

    await page.goto("/blogs");
    await expect(page.getByRole("heading", { name: "My Blogs" })).toBeVisible();
    await expect(page.getByText("Code Rewrite is Dangerous")).toBeVisible();

    await page.goto("/blogs/code-rewrite-is-dangerous");
    await expect(page.getByText("Code Rewrite is Dangerous")).toBeVisible();
  });
});
