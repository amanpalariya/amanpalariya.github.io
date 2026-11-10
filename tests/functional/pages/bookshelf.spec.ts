import { expect, test } from "../support/fixtures";

test("Bookshelf puts current reads before books ordered by finish date", async ({
  page,
}) => {
  await page.goto("/bookshelf/");

  const shelf = page.getByRole("region", { name: "Books", exact: true });
  await expect(shelf.getByRole("heading", { level: 2 })).toHaveText([
    "Currently reading",
    "The collection",
  ]);
  const reading = shelf.getByRole("region", { name: "Currently reading" });
  await expect(reading.getByRole("listitem")).toHaveText(/Pride and Prejudice/);
  await expect(reading.getByText("Reading", { exact: true })).toHaveCount(0);

  const collection = shelf.getByRole("region", { name: "The collection" });
  const books = collection.getByRole("listitem");
  await expect(books.nth(0)).toContainText("The Great Gatsby");
  await expect(books.nth(1)).toContainText("Frankenstein");
  await expect(books.nth(2)).toContainText("The Time Machine");
  await expect(collection.getByText("Pride and Prejudice")).toHaveCount(0);
});

test("Bookshelf cover details open and close without moving the covers", async ({
  page,
}) => {
  await page.goto("/bookshelf/");
  await expect(
    page.getByRole("button", { name: /^Change theme/ }),
  ).toBeEnabled();
  await page.evaluate(() => document.fonts.ready);

  const label = "Reading details for The Great Gatsby";
  const trigger = page.locator("summary").and(page.getByLabel(label));
  const details = page.getByRole("region", { name: label });
  const covers = page
    .getByRole("region", { name: "Books", exact: true })
    .locator("img");
  const coverPositions = () =>
    covers.evaluateAll((images) =>
      images.map((image) => image.getBoundingClientRect().toJSON()),
    );

  await trigger.scrollIntoViewIfNeeded();
  const before = await coverPositions();

  await trigger.click();
  await expect(details.getByText("Nov 2025")).toBeVisible();
  await expect(
    details.getByText(/Gatsby’s parties are dazzling/),
  ).toBeVisible();
  expect(await coverPositions()).toEqual(before);

  await details.click();
  await expect(details).toBeHidden();
  expect(await coverPositions()).toEqual(before);

  await trigger.press("Enter");
  await expect(details).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(details).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(await coverPositions()).toEqual(before);
});
