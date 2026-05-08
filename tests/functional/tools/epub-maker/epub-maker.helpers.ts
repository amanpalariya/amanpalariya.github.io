import { expect, type Download, type Locator, type Page } from "@playwright/test";

type UploadFilePayload = {
  name: string;
  mimeType: string;
  buffer: Buffer;
};

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

  get embedRemoteImagesSwitch(): Locator {
    return this.page.getByRole("checkbox", { name: "Embed remote images" });
  }

  get keepExternalLinksSwitch(): Locator {
    return this.page.getByRole("checkbox", { name: "Keep external links" });
  }

  get disableCoverButton(): Locator {
    return this.page.getByLabel("Disable cover", { exact: true });
  }

  get enableCoverButton(): Locator {
    return this.page.getByLabel("Enable cover", { exact: true });
  }

  get openCoverSettingsButton(): Locator {
    return this.page.getByRole("button", { name: /Open cover settings/ });
  }

  get coverSizePresetButton(): Locator {
    return this.page.getByRole("button", { name: "Select cover size preset" });
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

  async addHtmlPage(html: string) {
    await this.addTextPage(html);
  }

  async uploadDraftFiles(files: UploadFilePayload[]) {
    await this.page.locator('input[type="file"]').first().setInputFiles(files);
  }

  async generateDownload(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent("download");
    await this.saveButton.click();
    return downloadPromise;
  }

  async setEmbedRemoteImages(checked: boolean) {
    await this.embedRemoteImagesSwitch.setChecked(checked, { force: true });
    await expect(this.embedRemoteImagesSwitch).toBeChecked({ checked });
  }

  async setKeepExternalLinks(checked: boolean) {
    await this.keepExternalLinksSwitch.setChecked(checked, { force: true });
    await expect(this.keepExternalLinksSwitch).toBeChecked({ checked });
  }

  async selectCoverSizePreset(label: string) {
    await this.openCoverSettingsButton.click();
    await expect(this.page.getByRole("dialog", { name: "Cover settings" })).toBeVisible();
    await this.coverSizePresetButton.click();
    await this.page.getByRole("menuitem", { name: new RegExp(label) }).click();
    await expect(this.coverSizePresetButton).toContainText(label);
    await this.page.keyboard.press("Escape");
    await expect(this.page.getByRole("dialog", { name: "Cover settings" })).toBeHidden();
  }
}
