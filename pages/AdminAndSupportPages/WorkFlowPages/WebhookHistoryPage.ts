import { Page, Locator } from "@playwright/test";

export class WebhookHistoryPage {
    
  private readonly page: Page;
  private readonly webhookHistoryDate: Locator;
  private readonly webhookHistoryURL: Locator;
  private readonly webhookHistoryPayload: Locator;
  private readonly webhookHistoryEvent: Locator;
  private readonly webhookHistoryStatus: Locator;

  constructor(page: Page) {
    this.page = page;
    this.webhookHistoryDate = page.locator("//tbody[@class='audit_container']//tr[1]//td[1]");
    this.webhookHistoryURL = page.locator("//tbody[@class='audit_container']//tr[1]//td[2]");
    this.webhookHistoryPayload = page.locator("//tbody[@class='audit_container']//tr[1]//td[3]");
    this.webhookHistoryEvent = page.locator("//tbody[@class='audit_container']//tr[1]//td[4]");
    this.webhookHistoryStatus = page.locator("//tbody[@class='audit_container']//tr[1]//td[5]");
  }

  async getWebhookHistoryDate() {
    const content = await this.webhookHistoryDate.textContent();
    return content?.trim() || '';
  }

  async getWebhookHistoryURL() {
    const content = await this.webhookHistoryURL.textContent();
    return content?.trim() || '';
  }

  async getWebhookHistoryPayload() {
    const content = await this.webhookHistoryPayload.textContent();
    return content?.trim() || '';
  }

  async getWebhookHistoryEvent() {
    const content = await this.webhookHistoryEvent.textContent();
    return content?.trim() || '';
  }

  async getWebhookHistoryStatus() {
    const content = await this.webhookHistoryStatus.textContent();
    return content?.trim() || '';
  }
}
