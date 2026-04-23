import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils";

export class CampaignListingPage {
  private readonly page: Page;
  private readonly utils: Utils;
  private readonly newCampaignButton: Locator;
  private readonly filterButton: Locator;
  private readonly enterCampaignName: Locator;
  private readonly applyFilter: Locator;
  private readonly campaignName: Locator;
  private readonly actionButton: Locator;
  private readonly editButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();
    this.newCampaignButton = page.locator("#btn-new-campaign");

    // Filter
    this.filterButton = page.locator("#btn-filters");
    this.enterCampaignName = page.locator("#search_params_search_string");
    this.applyFilter = page.locator(".btn.btn-primary.btn-sm");

    // Listing element
    this.campaignName = page.locator("tbody tr span.td-bold");

    // Action button
    this.actionButton = page.locator("#btn-actions");
    this.editButton = page.locator("a[title='Edit']");
  }

  async clickOnFilterButton(nameOfCampaign: string){
    await this.filterButton.click();
    await this.enterCampaignName.fill(nameOfCampaign);
    await this.applyFilter.click();
    await this.utils.sleep(1000);
    await this.utils.waitTillFullPageLoad(this.page);
  }

  async clickOnNewCampaign(){
    await this.newCampaignButton.click();
  }

  async getCampaignName(){
    return await this.campaignName.first().textContent();
  }

  async getCampaignProjectList(){
    return await this.campaignName.nth(1).textContent();
  }

  async getCampaignStatusList(){
    return await this.campaignName.nth(2).textContent();
  }

  async clickOnActionEditButton(){
    await this.actionButton.first().click();
    await this.editButton.first().click();
  }
  
}