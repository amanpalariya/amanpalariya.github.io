import type { Page } from "@playwright/test";
import { expect, test } from "../support/fixtures";

const coverUrl = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 3"><path fill="navy" d="M0 0h2v3H0z"/></svg>',
)}`;

type ApiBook = {
  title: string;
  author: string | null;
  coverUrl: string | null;
  firstReadOn: string | null;
  rereadDates: string[];
  ratingOutOf10: number | null;
  review: string | null;
};

type BookshelfResponse = Record<"reading" | "wantToRead" | "read", ApiBook[]>;

function book(
  title: string,
  overrides: Partial<Omit<ApiBook, "title">> = {},
): ApiBook {
  return {
    title,
    author: null,
    coverUrl: null,
    firstReadOn: null,
    rereadDates: [],
    ratingOutOf10: null,
    review: null,
    ...overrides,
  };
}

const sampleBooks: BookshelfResponse = {
  reading: [
    book("Pride and Prejudice", { author: "Jane Austen", coverUrl }),
    book("Dune", { author: "Frank Herbert", ratingOutOf10: 9 }),
    book("The Call of the Wild", { coverUrl }),
  ],
  wantToRead: [
    book("Meditations", { author: "Marcus Aurelius" }),
    book("Anne of Green Gables", { coverUrl }),
    book("A Room of One’s Own"),
  ],
  read: [
    book("The Great Gatsby", {
      author: "F. Scott Fitzgerald",
      coverUrl,
      firstReadOn: "2025-11",
      ratingOutOf10: 8,
      review:
        "Gatsby’s parties are dazzling, but the quiet moments are what linger.",
    }),
    book("Frankenstein", {
      author: "Mary Shelley",
      firstReadOn: "2025-10-27",
    }),
    book("The Time Machine", {
      coverUrl,
      ratingOutOf10: 0,
      review: "A short journey with lasting questions.",
    }),
  ],
};

const sections = [
  { key: "reading", name: "Currently reading" },
  { key: "wantToRead", name: "Want to read" },
  { key: "read", name: "Finished" },
] as const;

async function openBookshelf(page: Page, groups: Partial<BookshelfResponse>) {
  // Install the mock before navigation. No live API or remote cover downloads.
  await page.route(
    (url) => url.searchParams.get("route") === "v1/bookshelf",
    (route) =>
      route.fulfill({
        json: { reading: [], wantToRead: [], read: [], ...groups },
      }),
  );
  // Wait for the mocked response before asserting the rendered shelf, so cold
  // development bundle loading does not consume the UI assertion timeout.
  await Promise.all([
    page.waitForResponse(
      (response) =>
        new URL(response.url()).searchParams.get("route") === "v1/bookshelf" &&
        response.status() === 200,
    ),
    page.goto("/bookshelf/", { waitUntil: "domcontentloaded" }),
  ]);
  await expect(page.getByRole("status")).toHaveText("Books loaded.");
}

test.describe("Bookshelf section combinations", () => {
  // Keep the app loaded between named scenarios instead of downloading and
  // hydrating the development bundles for every combination.
  for (const reading of [0, 1, 3]) {
    test(`${reading} current reads with every wanted/finished combination`, async ({
      page,
    }) => {
      const groups: BookshelfResponse = {
        reading: sampleBooks.reading.slice(0, reading),
        wantToRead: [],
        read: [],
      };
      let firstScenario = true;
      for (const wantToRead of [0, 1, 3]) {
        for (const read of [0, 1, 3]) {
          await test.step(`${reading} currently reading, ${wantToRead} wanted, ${read} finished`, async () => {
            const counts = { reading, wantToRead, read };
            groups.wantToRead = sampleBooks.wantToRead.slice(0, wantToRead);
            groups.read = sampleBooks.read.slice(0, read);
            if (firstScenario) {
              await openBookshelf(page, groups);
              firstScenario = false;
            } else {
              await page
                .getByRole("link", {
                  name: "ap. — Aman Palariya home",
                  exact: true,
                })
                .click();
              await expect(
                page.getByRole("region", { name: "Books", exact: true }),
              ).toHaveCount(0);
              const menu = page.getByRole("button", {
                name: "Open mobile navigation menu",
              });
              if (await menu.isVisible()) await menu.click();
              await page
                .locator("header")
                .getByRole("link", { name: "Bookshelf", exact: true })
                .click();
              await expect(page.getByRole("status")).toHaveText(
                "Books loaded.",
              );
            }

            const shelf = page.getByRole("region", {
              name: "Books",
              exact: true,
            });
            const visibleSections = sections.filter(
              ({ key }) => counts[key] > 0,
            );
            const empty = shelf.getByRole("heading", {
              name: "The bookshelf is empty",
            });
            if (visibleSections.length === 0) {
              await expect(empty).toBeVisible();
            } else {
              await expect(empty).toHaveCount(0);
              await expect(shelf.getByRole("heading", { level: 2 })).toHaveText(
                visibleSections.map(({ name }) => name),
              );
            }

            for (const { key, name } of sections) {
              const section = shelf.getByRole("region", { name, exact: true });
              if (counts[key] === 0) {
                await expect(section).toHaveCount(0);
                continue;
              }

              if (key === "wantToRead") {
                const list = section.getByRole("list");
                const toggle = section.locator(":scope > details > summary");
                if (visibleSections.length === 1) {
                  await expect(list).toBeVisible();
                } else {
                  await expect(list).toBeHidden();
                  await toggle.press("Enter");
                  await expect(list).toBeVisible();
                }
                await expect(section).toHaveCSS("border-top-width", "1px");
                await expect(section).toHaveCSS("border-bottom-width", "1px");
              } else {
                const index = visibleSections.findIndex(
                  (entry) => entry.key === key,
                );
                const divided =
                  index > 0 && visibleSections[index - 1].key !== "wantToRead";
                await expect(section).toHaveCSS(
                  "border-top-width",
                  divided ? "1px" : "0px",
                );
              }

              const cards = section.getByRole("listitem");
              await expect(cards).toHaveCount(counts[key]);
              // Check all titles in API order, including sections with several books.
              for (const [index, entry] of groups[key].entries()) {
                await expect(
                  cards.nth(index).getByText(entry.title, { exact: true }),
                ).toBeVisible();
              }
              if (key === "reading") {
                const title = cards
                  .first()
                  .getByText(groups.reading[0].title, { exact: true });
                if (reading === 1) {
                  await expect(title).not.toHaveCSS("font-size", "14px");
                } else {
                  await expect(title).toHaveCSS("font-size", "14px");
                }
                await expect(
                  section.getByText("Reading", { exact: true }),
                ).toHaveCount(0);
              }
              if (key === "wantToRead") {
                await section.locator(":scope > details > summary").click();
                await expect(section.getByRole("list")).toBeHidden();
              }
            }
          });
        }
      }
    });
  }
});

test("Bookshelf mixes all author, cover, and rating combinations in every section", async ({
  page,
}) => {
  const groups: BookshelfResponse = { reading: [], wantToRead: [], read: [] };
  for (const { key } of sections) {
    for (const author of [null, "A book author"]) {
      for (const cover of [null, coverUrl]) {
        for (const rating of [null, 7]) {
          groups[key].push(
            book(
              `${key}: ${author ? "author" : "no author"}, ${cover ? "cover" : "no cover"}, ${rating === null ? "no rating" : "rating"}`,
              { author, coverUrl: cover, ratingOutOf10: rating },
            ),
          );
        }
      }
    }
  }
  await openBookshelf(page, groups);
  await page
    .getByRole("region", { name: "Want to read" })
    .locator(":scope > details > summary")
    .click();

  for (const { key, name } of sections) {
    const cards = page
      .getByRole("region", { name, exact: true })
      .getByRole("listitem");
    await expect(cards).toHaveCount(8);
    for (const [index, entry] of groups[key].entries()) {
      const card = cards.nth(index);
      await card.scrollIntoViewIfNeeded();
      const caption = card
        .getByText(entry.title, { exact: true })
        .locator("..");
      await expect(caption).toHaveText(entry.title + (entry.author ?? ""));
      if (entry.coverUrl) {
        await expect(card.locator("img")).toHaveAttribute(
          "src",
          entry.coverUrl,
        );
        await expect(card.locator("img")).toHaveJSProperty("complete", true);
        await expect(card.locator("img")).not.toHaveJSProperty(
          "naturalWidth",
          0,
        );
        await expect(card.locator("svg")).toHaveCount(0);
      } else {
        await expect(card.locator("img")).toHaveCount(0);
        await expect(card.locator("svg")).toBeVisible();
      }
      const badge = card.getByText(/My rating/).locator("..");
      if (entry.ratingOutOf10 === null) {
        await expect(badge).toHaveCount(0);
      } else {
        await expect(badge).toHaveText("My rating ★ 3.5/5");
      }
      // Author/cover/rating alone should not create an empty details control.
      await expect(card.locator("summary")).toHaveCount(0);
    }
  }
});

test("Bookshelf falls back for a failed cover and preserves a zero rating", async ({
  page,
}) => {
  const brokenCover = "https://covers.test/broken.svg";
  await page.route(brokenCover, (route) =>
    route.fulfill({ status: 404, body: "" }),
  );
  await openBookshelf(page, {
    reading: [
      book("Missing cover", {
        author: "Still visible",
        coverUrl: brokenCover,
        ratingOutOf10: 0,
      }),
    ],
  });

  const card = page.getByRole("listitem");
  await expect(card.getByText("Missing cover", { exact: true })).toBeVisible();
  await expect(card.getByText("Still visible", { exact: true })).toBeVisible();
  await expect(card.locator("img")).toHaveCount(0);
  await expect(card.locator("svg")).toBeVisible();
  await expect(card.getByText(/My rating/).locator("..")).toHaveText(
    "My rating ★ 0/5",
  );
});

test("Bookshelf details support dates, reviews, rereads, and keyboard dismissal without shifting covers", async ({
  page,
}) => {
  const reread = book("A reread", {
    firstReadOn: "2024",
    rereadDates: ["2026-03-12", "2025-07"],
  });
  await openBookshelf(page, {
    reading: sampleBooks.reading.slice(0, 1),
    read: [...sampleBooks.read, reread],
  });
  await expect(
    page.getByRole("button", { name: /^Change theme/ }),
  ).toBeEnabled();
  await page.evaluate(() => document.fonts.ready);

  const finished = page.getByRole("region", { name: "Finished" });
  const trigger = (title: string) =>
    finished.locator("summary").filter({
      has: page.getByText(title, { exact: true }),
    });
  const details = (title: string) =>
    page.getByRole("region", {
      name: `Reading details for ${title}`,
      exact: true,
    });
  const covers = finished
    .getByRole("listitem")
    .locator(":scope > details > summary > span > span:first-child");
  const coverPositions = () =>
    covers.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().toJSON()),
    );

  const gatsby = trigger("The Great Gatsby");
  const gatsbyDetails = details("The Great Gatsby");
  await gatsby.scrollIntoViewIfNeeded();
  const before = await coverPositions();

  await gatsby.locator("img").click();
  await expect(gatsbyDetails.getByText("Nov 2025")).toBeVisible();
  await expect(
    gatsbyDetails.getByText(/Gatsby’s parties are dazzling/),
  ).toBeVisible();
  expect(await coverPositions()).toEqual(before);

  await gatsbyDetails.click();
  await expect(gatsbyDetails).toBeHidden();
  expect(await coverPositions()).toEqual(before);

  const title = gatsby.getByText("The Great Gatsby", { exact: true });
  await title.click();
  await expect(gatsbyDetails).toBeVisible();
  await title.click();
  await expect(gatsbyDetails).toBeHidden();
  await gatsby.press("Enter");
  await expect(gatsbyDetails).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(gatsbyDetails).toBeHidden();
  await expect(gatsby).toBeFocused();
  expect(await coverPositions()).toEqual(before);

  // A date alone, a review alone, and the latest reread all expose details.
  await trigger("Frankenstein").press("Enter");
  const dateOnly = details("Frankenstein");
  await expect(dateOnly.locator("time")).toHaveAttribute(
    "datetime",
    "2025-10-27",
  );
  await expect(dateOnly).toHaveText("Read Oct 27, 2025");
  await expect(
    finished.getByRole("listitem").nth(1).locator("img"),
  ).toHaveCount(0);

  await trigger("The Time Machine").press("Enter");
  const reviewOnly = details("The Time Machine");
  await expect(reviewOnly).toHaveText(
    "A short journey with lasting questions.",
  );
  await expect(reviewOnly.locator("time")).toHaveCount(0);
  await expect(dateOnly).toBeHidden();

  await trigger("A reread").press("Enter");
  const rereadDetails = details("A reread");
  await expect(rereadDetails.locator("time")).toHaveAttribute(
    "datetime",
    "2026-03-12",
  );
  await expect(rereadDetails).toHaveText("Read Mar 12, 2026");
  await expect(reviewOnly).toBeHidden();
});
