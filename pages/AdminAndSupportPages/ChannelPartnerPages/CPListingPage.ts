import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils.ts";

export class CPListingPage {
  private readonly page: Page;
  private readonly utils:Utils;
  private readonly createNewChannelPartner: Locator;
  private readonly importChannelPartner: Locator;
  private readonly funnelButton: Locator;
  private readonly searchPartnerByName: Locator;
  private readonly statusOfPartner: Locator;
  private readonly applyFilter: Locator;
  private readonly channelPartnerName: Locator;
  private readonly name: Locator;
  private readonly partnerContanct: Locator;
  private readonly partnerEmail: Locator;
  private readonly partnerCreatedAt: Locator;
  private readonly actionButton: Locator;
  private readonly editChannelPartner: Locator;
  private readonly deactivateChannelPartner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();
    this.createNewChannelPartner = page.locator("a[class='modal-remote-form-link btn btn-primary']");
    this.importChannelPartner = page.locator("input[class='import-channel-partners']");

    // Filter
    this.funnelButton = page.locator("button[class='btn btn-light btn-icon toggle-filters']");
    this.searchPartnerByName = page.locator("#search");
    this.statusOfPartner = page.locator("#s2id_filters_active span.select2-chosen");
    this.applyFilter = page.locator("input.btn.btn-primary.btn-sm");

    // Listing Element
    this.channelPartnerName = page.locator("(//table[@class='table table-responsive'] //td)[1]");
    this.name = page.locator("(//table[@class='table table-responsive'] //td)[2]");
    this.partnerContanct = page.locator("(//table[@class='table table-responsive'] //td)[3]");
    this.partnerEmail = page.locator("(//table[@class='table table-responsive'] //td)[4]");
    this.partnerCreatedAt = page.locator("(//table[@class='table table-responsive'] //td)[6]");

    // Action button
    this.actionButton = page.locator(".text-right.actions a.table-action-btn.dropdown-toggle.btn.btn-light.btn-sm");
    this.editChannelPartner = page.locator("a[title='Edit']");
    this.deactivateChannelPartner = page.locator("//a[text()='Deactivate']");

  }

  async clickOnNewPartnerButton(){
    await this.createNewChannelPartner.click();
  }
  
  async ImportFileChannelPartner(filePath: string){
    await this.importChannelPartner.setInputFiles(filePath);
  }

  // Filter
  async clickOnFunnelButton(){
    await this.funnelButton.click();
  }

  async enterSearchPartnerByName(name: string){
    await this.searchPartnerByName.fill(name);
  }

  async clickOnApplyFilterButton(){
    await this.applyFilter.click();
    await this.utils.waitTillFullPageLoad(this.page);
  }

  async getChannelPartnerName(){
    return await this.channelPartnerName.first().textContent();
  }

  // Get Values
  async getPartnerName(){
    return await this.name.first().textContent();
  }

  async getPartnerContanct(){
    return await this.partnerContanct.first().textContent();
  }

  async getPartnerEmail(){
    return await this.partnerEmail.first().textContent();
  }

  async getPartnerCreatedAt(){
    return await this.partnerCreatedAt.first().textContent();
  }

  // Actions
  async clickOnEditChannelPartner():Promise<string>{
    await this.actionButton.click();
    await this.editChannelPartner.click();
    await this.utils.waitTillFullPageLoad(this.page);
    return await this.page.url();
  }
}