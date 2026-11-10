import type { Page } from "@playwright/test";
import { expect, test } from "../support/fixtures";

const coverUrl = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 3"><path fill="navy" d="M0 0h2v3H0z"/></svg>',
)}`;

function book(
  title: string,
  {
    firstReadOn = null,
    ratingOutOf10 = null,
    review = null,
  }: {
    firstReadOn?: string | null;
    ratingOutOf10?: number | null;
    review?: string | null;
  } = {},
) {
  return {
    title,
    author: null,
    coverUrl,
    firstReadOn,
    rereadDates: [],
    ratingOutOf10,
    review,
  };
}

const prideAndPrejudice = book("Pride and Prejudice");
const finishedBooks = [
  book("The Great Gatsby", {
    firstReadOn: "2025-11",
    ratingOutOf10: 8,
    review:
      "Gatsby’s parties are dazzling, but the quiet moments are what linger.",
  }),
  book("Frankenstein", { firstReadOn: "2025-10-27" }),
  book("The Time Machine"),
];

type BookshelfResponse = Record<
  "reading" | "wantToRead" | "read",
  ReturnType<typeof book>[]
>;

async function mockBookshelf(page: Page, groups: Partial<BookshelfResponse>) {
  await page.route(
    (url) => url.searchParams.get("route") === "v1/bookshelf",
    (route) =>
      route.fulfill({
        json: { reading: [], wantToRead: [], read: [], ...groups },
      }),
  );
}

test("Bookshelf adapts to populated and empty sections", async ({ page }) => {
  const groups = {
    reading: [prideAndPrejudice],
    wantToRead: [book("Meditations"), book("Anne of Green Gables")],
    read: [finishedBooks[0]],
  };
  await mockBookshelf(page, groups);
  await page.goto("/bookshelf/");

  const reading = page.getByRole("region", { name: "Currently reading" });
  const finished = page.getByRole("region", { name: "Finished" });
  const want = page.getByRole("region", { name: "Want to read" });
  const wantToggle = want.locator(":scope > details > summary");
  const firstReadingTitle = reading.getByText("Pride and Prejudice");

  await expect(firstReadingTitle).not.toHaveCSS("font-size", "14px");
  for (const title of ["The Time Machine", "The Call of the Wild"]) {
    groups.reading.push(book(title));
    await page.reload();
    await expect(reading.getByRole("listitem")).toHaveCount(
      groups.reading.length,
    );
    await expect(reading.getByRole("listitem").first()).toContainText(
      "Pride and Prejudice",
    );
    await expect(firstReadingTitle).toHaveCSS("font-size", "14px");
  }

  await expect(finished.getByRole("listitem")).toHaveCount(1);
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: /^(Currently reading|Want to read|Finished)$/,
    }),
  ).toHaveText(["Currently reading", "Want to read", "Finished"]);
  await expect(want.getByRole("list")).toBeHidden();
  await wantToggle.press("Enter");
  await expect(want.getByRole("listitem")).toHaveCount(2);
  await wantToggle.click();
  await expect(want.getByRole("list")).toBeHidden();
  await expect(reading).toHaveCSS("border-top-width", "0px");
  await expect(want).toHaveCSS("border-top-width", "1px");
  await expect(want).toHaveCSS("border-bottom-width", "1px");
  await expect(finished).toHaveCSS("border-top-width", "0px");

  groups.read = [];
  await page.reload();
  await expect(want.getByRole("list")).toBeHidden();
  await expect(want).toHaveCSS("border-bottom-width", "1px");
  await expect(finished).toHaveCount(0);

  groups.reading = [];
  await page.reload();
  await expect(want).toHaveCSS("border-top-width", "1px");
  await expect(want).toHaveCSS("border-bottom-width", "1px");
  await expect(want.getByRole("listitem")).toHaveCount(2);
  await expect(reading).toHaveCount(0);
  await wantToggle.press("Enter");
  await expect(want.getByRole("list")).toBeHidden();

  groups.wantToRead = [];
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "The bookshelf is empty" }),
  ).toBeVisible();

  groups.read = [finishedBooks[0]];
  await page.reload();
  await expect(finished).toHaveCSS("border-top-width", "0px");
});

test("Bookshelf puts current reads before finished books and preserves their API order", async ({
  page,
}) => {
  await mockBookshelf(page, {
    reading: [prideAndPrejudice],
    read: finishedBooks,
  });
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
  await mockBookshelf(page, {
    reading: [prideAndPrejudice],
    read: finishedBooks,
  });
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
