import { expect, type Locator, type Page } from "@playwright/test";

export class EpubMakerPageObject {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get saveButton(): Locator {
    return this.page.getByRole("button", { name: "Save EPUB", exact: true });
  }

  get undoButton(): Locator {
    return this.page.getByRole("button", { name: "Undo page change", exact: true });
  }

  get redoButton(): Locator {
    return this.page.getByRole("button", { name: "Redo page change", exact: true });
  }

  get pastedContentInput(): Locator {
    return this.page.getByPlaceholder("Paste HTML, text, or image here").last();
  }

  get addPastedContentButton(): Locator {
    return this.page.getByRole("button", { name: "Add pasted content" }).last();
  }

  get titleInput(): Locator {
    return this.page.getByPlaceholder("EPUB Maker");
  }

  get authorInput(): Locator {
    return this.page.getByPlaceholder("Name");
  }

  get fileNameInput(): Locator {
    return this.page.getByPlaceholder("my-book.epub");
  }

  pageTitleInput(chapterNumber: number): Locator {
    return this.page.getByRole("textbox", { name: `Page title ${chapterNumber}` });
  }

  async goto() {
    await this.page.goto("/tools/epub-maker");
    await expect(this.page.getByRole("heading", { name: "EPUB Maker" })).toBeVisible();
  }

  async addTextPage(content: string) {
    await this.pastedContentInput.fill(content);
    await this.addPastedContentButton.click();
  }
}
