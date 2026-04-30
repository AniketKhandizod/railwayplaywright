import { Page, Locator, expect } from "@playwright/test";
import { AheadOf, Utils } from "../../utils/PlaywrightTestUtils";

export class BulkReassignPage {
  private readonly page: Page;
  private readonly utils: Utils;
  private readonly chooseFile: Locator;
  private readonly uploadButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();
    this.chooseFile = page.locator("input#files_reassign_leads");
    this.uploadButton = page.locator(".form-group .upload");
  }

  async clickOnChooseFile(filePath: string) {
    await this.utils.waitTillFullPageLoad(this.page);
    await this.chooseFile.setInputFiles(filePath);
  }

  async clickOnUploadButton() {
    await this.uploadButton.click();
    await this.utils.waitTillFullPageLoad(this.page);
    await this.utils.sleep(2000);
  }

  async sendKeysByJS(locator: Locator, text: string) {
    await locator.evaluate((el, value) => {
      (el as HTMLInputElement).value = value as string;
      el.dispatchEvent(new Event("input", { bubbles: true })); // trigger change detection
    }, text);
  }
}