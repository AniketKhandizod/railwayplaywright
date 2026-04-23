import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils.ts";

export class CPConfigurationPage {
  private readonly page: Page;
  private readonly utils:Utils;
  private readonly enableChannelPartnerModule: Locator;
  private readonly allowSalesExecutiveToAddChannelPartner: Locator;
  private readonly enterReengageDayForLostLead: Locator;
  private readonly saveConfiguration: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();
    this.enableChannelPartnerModule = page.locator("div[class='form-group'] label[class='form-check-label']");
    this.allowSalesExecutiveToAddChannelPartner = page.locator(".enable_cp .form-check");
    this.enterReengageDayForLostLead = page.locator("#client_configuration_cp_new_campaign_response_days");
    this.saveConfiguration = page.locator("input[class='btn btn-primary save']");
  }

  async enableChannelPartnerModuleFlag(flag: boolean) {
      await this.enableChannelPartnerModule.setChecked(flag);
  }

  async allowSalesExecutiveToAddChannelPartnerFlag(flag: boolean) {
      await this.allowSalesExecutiveToAddChannelPartner.setChecked(flag);
  }

  async enterReengageDaysForLostLead(days: number) {
    await this.enterReengageDayForLostLead.fill(days.toString());
  }

  async clickOnSaveConfiguration() {
    await this.saveConfiguration.click();
  }
}