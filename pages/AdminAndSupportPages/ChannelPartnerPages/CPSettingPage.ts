import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils.ts";

export class CPSettingPage {
  private readonly page: Page;
  private readonly utils:Utils;
  private readonly configuration: Locator;
  private readonly managePartner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();
    this.configuration = page.locator("a[ubts='Partners - Configuration']");
    this.managePartner = page.locator("a[ubts='Partners - Manage Partners']");
  }

  async clickOnConfiguration() {
    await this.configuration.click();
  }

  async clickOnManagePartner() {
    await this.managePartner.click();
  }

}