import { describe, expect, it } from "vitest";
import {
  buildAutoEpubFileName,
  buildEpubFileName,
  sanitizeDownloadFileName,
} from "./file-name";

describe("EPUB file names", () => {
  it("removes characters that are invalid or unsafe in common file systems", () => {
    expect(sanitizeDownloadFileName(' A <bad>:"/\\\\|?* name...\n ')).toBe(
      "A bad name",
    );
  });

  it("prefers a manual file name and appends the epub extension", () => {
    expect(buildEpubFileName("Custom Book", "Title", "Author")).toBe(
      "Custom Book.epub",
    );
  });

  it("builds an automatic title-author file name when no manual name is provided", () => {
    expect(buildAutoEpubFileName("Title", "Author")).toBe("Title - Author.epub");
  });

  it("uses a stable fallback when all inputs sanitize to empty strings", () => {
    expect(buildEpubFileName(" <> ", "", "")).toBe("epub-maker-pages.epub");
  });

  it("does not duplicate an existing epub extension regardless of case", () => {
    expect(buildEpubFileName("Book.EPUB", "", "")).toBe("Book.EPUB");
  });
});
