import { expect, test } from "../../support/fixtures";

test.describe("EPUB Maker input modes", () => {
  test("infers pasted HTML titles from document title and first heading", async ({ epubMaker }) => {
    await epubMaker.goto();

    await epubMaker.addHtmlPage(
      "<html><head><title>Document Title Page</title></head><body><h1>Ignored Heading</h1><p>Body.</p></body></html>",
    );
    await epubMaker.addHtmlPage("<article><h1>Heading Title Page</h1><p>Body.</p></article>");

    await expect(epubMaker.pageTitleInput(1)).toHaveValue("Document Title Page");
    await expect(epubMaker.pageTitleInput(2)).toHaveValue("Heading Title Page");
  });

  test("uploads text, HTML, and Markdown files as draft pages", async ({ epubMaker }) => {
    await epubMaker.goto();

    await epubMaker.uploadDraftFiles([
      {
        name: "plain-upload.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("Plain uploaded text\n\nThe file name becomes the page title."),
      },
      {
        name: "html-upload.html",
        mimeType: "text/html",
        buffer: Buffer.from(
          "<html><head><title>Uploaded HTML Title</title></head><body><p>HTML body.</p></body></html>",
        ),
      },
      {
        name: "markdown-upload.md",
        mimeType: "text/markdown",
        buffer: Buffer.from("# Markdown Heading\n\nMarkdown body."),
      },
    ]);

    await expect(epubMaker.pageTitleInput(1)).toHaveValue("plain upload");
    await expect(epubMaker.pageTitleInput(2)).toHaveValue("Uploaded HTML Title");
    await expect(epubMaker.pageTitleInput(3)).toHaveValue("markdown upload");
  });

  test("reports unsupported, duplicate, and empty files without adding extra pages", async ({
    page,
    epubMaker,
  }) => {
    await epubMaker.goto();

    await epubMaker.uploadDraftFiles([
      {
        name: "first.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("Only supported unique content."),
      },
      {
        name: "duplicate.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("Only supported unique content."),
      },
      {
        name: "empty.txt",
        mimeType: "text/plain",
        buffer: Buffer.from(""),
      },
      {
        name: "archive.zip",
        mimeType: "application/zip",
        buffer: Buffer.from("not a valid input for this tool"),
      },
    ]);

    await expect(epubMaker.pageTitleInput(1)).toHaveValue("first");
    await expect(epubMaker.pageTitleInput(2)).toHaveCount(0);
    await expect(page.getByText("Duplicate pages skipped")).toBeVisible();
    await expect(page.getByText("Some files were skipped")).toBeVisible();
    await expect(page.getByText("Some files were empty")).toBeVisible();
  });
});
