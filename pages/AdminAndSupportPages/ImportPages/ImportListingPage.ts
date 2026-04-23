import { Page, Locator } from "@playwright/test";

export class ImportListingPage {
  private readonly page: Page;
  private readonly NewUpload: Locator;

  // SV and FU import listing page
  private readonly SVFUImportListingPageUpdatedDate: Locator;
  private readonly SVFUImportListingPageTotalFUSV: Locator;
  private readonly SVFUImportListingPageIntiatedBy: Locator;
  private readonly SVFUImportListingPageStatus: Locator;
  private readonly refreshButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.NewUpload = page.getByRole('link', { name: 'New Upload' });
    this.SVFUImportListingPageUpdatedDate = page.locator("(//table[@class='table table-responsive bulk_uploads']/tbody/tr/td)[1]");
    this.SVFUImportListingPageTotalFUSV = page.locator("(//table[@class='table table-responsive bulk_uploads']/tbody/tr/td)[2]");
    this.SVFUImportListingPageIntiatedBy = page.locator("(//table[@class='table table-responsive bulk_uploads']/tbody/tr/td)[3]");
    this.SVFUImportListingPageStatus = page.locator("(//table[@class='table table-responsive bulk_uploads']/tbody/tr/td)[4]");
    this.refreshButton = page.locator("a[title='Refresh']");
  }

  async clickOnNewUpload() {
    await this.NewUpload.click();
  }

  async clickOnRefreshButton() {
    await this.refreshButton.click();
  }

  async getSVFUImportListingPageUpdatedDate() {
    return await this.SVFUImportListingPageUpdatedDate.first();
  }
  async getSVFUImportListingPageTotalFUSV() {
    return await this.SVFUImportListingPageTotalFUSV.first();
  }
  async getSVFUImportListingPageIntiatedBy() {
    return await this.SVFUImportListingPageIntiatedBy.first();
  }
  async getSVFUImportListingPageStatus() {
    return await this.SVFUImportListingPageStatus.first();
  }

}