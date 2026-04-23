import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils";

export class ImportFilePage {
  private readonly page: Page;
  private readonly ChooseFile: Locator;
  private readonly utils: Utils;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();
    this.ChooseFile = page.getByRole('button', { name: 'Choose File' });
  }

  async clickOnChooseFile(filePath: string) {
    await this.ChooseFile.setInputFiles(filePath);
    await this.utils.waitTillFullPageLoad(this.page);
  }

}