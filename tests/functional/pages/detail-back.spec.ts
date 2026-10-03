import { expect, test } from "../support/fixtures";

for (const detail of [
  { path: "/blogs/git-worktree-and-patch/", listing: "/blogs/" },
  { path: "/projects/console-game-language/", listing: "/projects/" },
]) {
  test(`direct visit to ${detail.path} falls back to its listing`, async ({ page }) => {
    await page.goto(detail.path);
    await page.getByRole("link", { name: "Go back", exact: true }).press("Enter");
    await expect(page).toHaveURL(new RegExp(`${detail.listing}$`));
  });
}

test("project back button returns to the homepage it was opened from", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /^Console Game Language/ }).click();
  await expect(page).toHaveURL(/\/projects\/console-game-language\/$/);
  await page.getByRole("link", { name: "Go back", exact: true }).click();
  await expect(page).toHaveURL(/:\d+\/$/);
});

test("blog back button returns to the blog listing", async ({ page }) => {
  await page.goto("/blogs/");
  await page.getByRole("link", { name: "Room for Thought", exact: true }).press("Enter");
  await expect(page).toHaveURL(/\/blogs\/room-for-thought\/$/);
  await page.getByRole("link", { name: "Go back", exact: true }).click();
  await expect(page).toHaveURL(/\/blogs\/$/);
});
