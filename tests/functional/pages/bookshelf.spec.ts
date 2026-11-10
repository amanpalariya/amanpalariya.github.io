import { expect, test } from "../support/fixtures";

test("Bookshelf reviews open and close without moving the covers", async ({
  page,
}) => {
  await page.goto("/bookshelf/");
  await expect(page.getByRole("button", { name: /^Change theme/ })).toBeEnabled();
  await page.evaluate(() => document.fonts.ready);

  const trigger = page.getByRole("button", {
    name: "My review of The Great Gatsby",
  });
  const covers = page.getByRole("region", { name: "Books" }).locator("img");
  const coverPositions = () =>
    covers.evaluateAll((images) =>
      images.map((image) => image.getBoundingClientRect().toJSON()),
    );

  await trigger.scrollIntoViewIfNeeded();
  const before = await coverPositions();

  await trigger.press("Enter");
  const review = page.getByRole("dialog", { name: "The Great Gatsby" });
  await expect(review).toBeVisible();
  expect(await coverPositions()).toEqual(before);

  await page.keyboard.press("Escape");
  await expect(review).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(await coverPositions()).toEqual(before);
});
