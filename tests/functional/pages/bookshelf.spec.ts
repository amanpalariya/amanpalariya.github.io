import { expect, test } from "../support/fixtures";

test("Bookshelf preview counts exercise empty and populated sections", async ({
  page,
}) => {
  await page.goto("/bookshelf/?preview=1");
  await expect(
    page.getByRole("button", { name: /^Change theme/ }),
  ).toBeEnabled();

  const controls = page.getByRole("group", { name: "Preview book counts" });
  const readingCount = controls.getByRole("combobox", {
    name: "Currently reading",
  });
  const finishedCount = controls.getByRole("combobox", { name: "Finished" });
  const wantCount = controls.getByRole("combobox", { name: "Want to read" });
  const reading = page.getByRole("region", { name: "Currently reading" });
  const finished = page.getByRole("region", { name: "Finished" });
  const want = page.getByRole("region", { name: "Want to read" });
  const wantToggle = want.locator(":scope > details > summary");
  const firstReadingTitle = reading.getByText("Pride and Prejudice");

  await expect(firstReadingTitle).not.toHaveCSS("font-size", "14px");
  await readingCount.selectOption("2");
  await expect(firstReadingTitle).toHaveCSS("font-size", "14px");
  await readingCount.selectOption("3");
  await finishedCount.selectOption("1");
  await wantCount.selectOption("2");
  await expect(reading.getByRole("listitem")).toHaveCount(3);
  await expect(reading.getByRole("listitem").first()).toContainText(
    "Pride and Prejudice",
  );
  await expect(firstReadingTitle).toHaveCSS("font-size", "14px");
  await expect(reading.getByText("The Time Machine")).toHaveCSS(
    "font-size",
    "14px",
  );
  await expect(finished.getByRole("listitem")).toHaveCount(1);
  const sectionOrder = page.getByRole("region", {
    name: /^(Currently reading|Want to read|Finished)$/,
  });
  await expect(sectionOrder).toHaveCount(3);
  await expect(sectionOrder.nth(0)).toHaveAttribute(
    "aria-labelledby",
    "currently-reading",
  );
  await expect(sectionOrder.nth(1)).toHaveAttribute(
    "aria-labelledby",
    "want-to-read",
  );
  await expect(sectionOrder.nth(2)).toHaveAttribute(
    "aria-labelledby",
    "finished",
  );
  await expect(want.getByRole("list")).toBeHidden();
  await wantToggle.press("Enter");
  await expect(want.getByRole("listitem")).toHaveCount(2);
  await wantToggle.click();
  await expect(want.getByRole("list")).toBeHidden();
  await expect(reading).toHaveCSS("border-top-width", "0px");
  await expect(want).toHaveCSS("border-top-width", "1px");
  await expect(want).toHaveCSS("border-bottom-width", "1px");
  await expect(finished).toHaveCSS("border-top-width", "0px");

  await finishedCount.selectOption("0");
  await expect(finished).toHaveCount(0);
  await expect(want.getByRole("list")).toBeHidden();
  await expect(want).toHaveCSS("border-bottom-width", "1px");
  await readingCount.selectOption("0");
  await expect(reading).toHaveCount(0);
  await expect(want).toHaveCSS("border-top-width", "1px");
  await expect(want).toHaveCSS("border-bottom-width", "1px");
  await expect(want.getByRole("listitem")).toHaveCount(2);
  await wantToggle.press("Enter");
  await expect(want.getByRole("list")).toBeHidden();
  await wantCount.selectOption("0");
  await expect(
    page.getByRole("heading", { name: "The bookshelf is empty" }),
  ).toBeVisible();
  await expect(page.getByText("Sample entries")).toHaveCount(0);

  await finishedCount.selectOption("1");
  await expect(finished).toHaveCSS("border-top-width", "0px");
});

test("Bookshelf puts current reads before books ordered by finish date", async ({
  page,
}) => {
  await page.goto("/bookshelf/");

  const shelf = page.getByRole("region", { name: "Books", exact: true });
  await expect(shelf.getByRole("heading", { level: 2 })).toHaveText([
    "Currently reading",
    "Finished",
  ]);
  const reading = shelf.getByRole("region", { name: "Currently reading" });
  await expect(reading.getByRole("listitem")).toHaveText(/Pride and Prejudice/);
  await expect(reading.getByText("Reading", { exact: true })).toHaveCount(0);

  const finished = shelf.getByRole("region", { name: "Finished" });
  await expect(finished).toHaveCSS("border-top-width", "1px");
  const books = finished.getByRole("listitem");
  await expect(books.nth(0)).toContainText("The Great Gatsby");
  await expect(books.nth(1)).toContainText("Frankenstein");
  await expect(books.nth(2)).toContainText("The Time Machine");
  await expect(finished.getByText("Pride and Prejudice")).toHaveCount(0);
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
  const trigger = page.locator("summary").filter({
    has: page.getByText("The Great Gatsby", { exact: true }),
  });
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

  await trigger.locator("img").click();
  await expect(details.getByText("Nov 2025")).toBeVisible();
  await expect(
    details.getByText(/Gatsby’s parties are dazzling/),
  ).toBeVisible();
  expect(await coverPositions()).toEqual(before);

  await details.click();
  await expect(details).toBeHidden();
  expect(await coverPositions()).toEqual(before);

  const title = trigger.getByText("The Great Gatsby", { exact: true });
  await title.click();
  await expect(details).toBeVisible();
  await title.click();
  await expect(details).toBeHidden();

  await trigger.press("Enter");
  await expect(details).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(details).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(await coverPositions()).toEqual(before);
});
