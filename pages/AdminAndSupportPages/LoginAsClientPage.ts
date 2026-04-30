import { Page, Locator } from "@playwright/test";

export class LoginAsClientPage {
  private readonly page: Page;
  private readonly addClientButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addClientButton = page.locator("#btn-add-client");
  }

  async clickOnAddClient() {
    await this.addClientButton.click();
  }

  async isAddClientButtonVisible(): Promise<boolean> {
    return await this.addClientButton.isVisible();
  }
}