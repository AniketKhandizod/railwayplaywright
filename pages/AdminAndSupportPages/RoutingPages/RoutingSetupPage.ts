import { Page, Locator, expect } from "@playwright/test";

export class RoutingSetupPage {
  private readonly page: Page;
  private readonly routingConfiguration: Locator;
  private readonly routingConfigurationLogs: Locator;
  private readonly routingConfigurationRuleLogs: Locator;

  constructor(page: Page) {
    this.page = page;
    this.routingConfiguration = page.locator("a[ubts='Setup Routing']");
    this.routingConfigurationLogs = page.locator("a[ubts='Routing Configuration Logs']");
    this.routingConfigurationRuleLogs = page.locator("a[ubts='Routing Rule Logs']");
  }

  async clickOnRoutingConfiguration():Promise<void>{
    await this.routingConfiguration.click();
  }

  async clickOnRoutingConfigurationLogs():Promise<void>{
    await this.routingConfigurationLogs.click();
  }

  async clickOnRoutingConfigurationRuleLogs():Promise<void>{
    await this.routingConfigurationRuleLogs.click();
  }
}