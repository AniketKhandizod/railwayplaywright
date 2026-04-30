import { Page, Locator, expect } from "@playwright/test";

export class NotyMessage {
  private readonly page: Page;
  private readonly saveSuccessBar: Locator;
  private readonly closeBottomLeftPopup: Locator;
  private readonly openBottomLeftPopup: Locator;
  constructor(page: Page) {
    this.page = page;
    this.saveSuccessBar = page.locator("#noty_bottom_layout_container .noty_message");
    this.closeBottomLeftPopup = page.locator(".noty_buttons #button-0");
    this.openBottomLeftPopup = page.locator(".noty_buttons #button-1");

  }
  async getNotyMessage(waitTillIsVisible: boolean) : Promise<string | null> {
    await this.saveSuccessBar.first().waitFor({ state: 'visible' });
    const status = await this.saveSuccessBar.first().textContent();
    if(waitTillIsVisible){
      await this.saveSuccessBar.first().waitFor({ state: 'hidden' });
    }
    return status;
  }
  async clickOnCloseBottomLeftPopup() {
    await this.closeBottomLeftPopup.waitFor({ state: 'attached' });
    await this.closeBottomLeftPopup.click();
  }
  async clickOnOpenBottomLeftPopup() {
    await this.openBottomLeftPopup.waitFor({ state: 'visible' });
    await this.openBottomLeftPopup.click();
  }
}