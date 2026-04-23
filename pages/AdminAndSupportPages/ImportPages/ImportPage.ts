import { Page, Locator } from "@playwright/test";

export class ImportPage {
  private readonly page: Page;
  private readonly ImportLeads: Locator;
  private readonly ImportSiteVisits: Locator;
  private readonly ImportFollowups: Locator;
  private readonly ImportSRDs: Locator;

  constructor(page: Page) {
    this.page = page;
    this.ImportLeads = page.getByRole('link', { name: ' import leads Import leads' });
    this.ImportSiteVisits = page.getByRole('link', { name: ' import Site visits Update' });
    this.ImportFollowups = page.getByRole('link', { name: ' import followups Update' });
    this.ImportSRDs = page.locator("//span[text()='import srds']");
  }

  async clickOnImportLeads() {
    await this.ImportLeads.click();
  }

  async clickOnImportSiteVisits() {
    await this.ImportSiteVisits.click();
  }

  async clickOnImportFollowups() {
    await this.ImportFollowups.click();
  }

  async clickOnImportSRDs() {
    await this.ImportSRDs.click();
  }
}