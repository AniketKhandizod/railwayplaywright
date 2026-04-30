import { Page, Locator } from "@playwright/test";

export enum Configuration {
    EnableCaptcha = 0,
    PhoneVerification = 1,
    Selfhosting = 2,
    CalendarSlotsForSiteisit = 3,
}

export class LeadCaptureFormListingPage {
  private readonly page: Page;
  private readonly funnel: Locator;
  private readonly breadcrumToLeadCaptureFormLisiting: Locator;
  private readonly search: Locator;
  private readonly searchInput: Locator;
  private readonly selectSearched: Locator;
  private readonly filterButton: Locator;
  private readonly listingResult: Locator;

  constructor(page: Page) {

    // Create new lead capture form
    this.page = page;
    this.funnel = page.locator("button[class='btn btn-light btn-icon toggle-filters']");
    this.breadcrumToLeadCaptureFormLisiting = page.locator("a[ubts='Lead Capture Forms']");
    this.search = page.getByRole('link', { name: 'Search by name' });
    this.searchInput = page.locator('#select2-drop').getByRole('textbox');
    this.selectSearched = page.locator("div[class='select2-result-label']");
    this.filterButton = page.locator("input[data-disable-with='Filter']");
    this.listingResult = page.locator("table[class='table table-responsive'] td");
  }

  async navigateToLeadCaptureFormListing() {
    await this.breadcrumToLeadCaptureFormLisiting.click();
  }

  async searchLeadCaptureForm(searchText: string): Promise<Locator> {
    await this.funnel.click();
    await this.search.click();
    await this.searchInput.fill(searchText);
    await this.selectSearched.click();
    await this.filterButton.click();
    return this.listingResult;
  }
}
