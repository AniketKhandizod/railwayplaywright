import { Page, Locator, expect } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils";

export enum mediumType{
  apiclient = 'Apiclient',
  email = 'Email',
  whatsapp = 'Whatsapp'
}

export enum mediumRoutingStrategy{
  roundRobin = 'Round Robin',
  weightedroundrobin = 'Weighted Round Robin'
}

export class RoutingConfigurationPage {
  private readonly page: Page;
  private readonly utils: Utils;
  private readonly saveButtonRoutingConfiguration: Locator;
  private readonly routingStrategy: Locator;
  private readonly createNewRule: Locator;
  private readonly ruleName: Locator;
  private readonly mediumType: Locator;
  private readonly waitUntilsMediumTypeVisible: Locator;
  private readonly ruleRoutingStrategy: Locator;
  private readonly mediumTypeResults: Locator;
  private readonly salesForRule: Locator;
  private readonly saveRule: Locator;
  private readonly projects: Locator;
  private readonly waitUntilsProjectsVisible: Locator;
  private readonly projectsResults: Locator;
  private readonly sourceForRule: Locator;
  private readonly waitUntilsSourceVisible: Locator;
  private readonly sourceResults: Locator;
  private readonly subSource: Locator;
  private readonly waitUntilsSubSourceVisible: Locator;
  private readonly subSourceResults: Locator;
  private readonly campaign: Locator;
  private readonly waitUntilsCampaignVisible: Locator;
  private readonly campaignResults: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();

    // Routing configurations
    this.saveButtonRoutingConfiguration = page.locator("input.btn.btn-primary.form-control.save-rc");
    this.routingStrategy = page.locator("#s2id_routing_configuration_routing_strategy span.select2-chosen");

    // Create rule
    this.createNewRule = page.locator("a.btn.btn-primary.modal-remote-form-link");
    this.ruleName = page.locator("#routing_rule_name");

    // Projects
    this.projects = page.locator("#s2id_routing_rule_project_ids");
    this.waitUntilsProjectsVisible = page.locator("li.select2-highlighted");
    this.projectsResults = page.locator("div.select2-result-label");

    // Source
    this.sourceForRule = page.locator("#s2id_routing_rule_sources");
    this.waitUntilsSourceVisible = page.locator("li.select2-highlighted");
    this.sourceResults = page.locator("div.select2-result-label");

    // Sub Source
    this.subSource = page.locator("#s2id_routing_rule_sub_sources");
    this.waitUntilsSubSourceVisible = page.locator("li.select2-highlighted");
    this.subSourceResults = page.locator("div.select2-result-label");

    // Campaign
    this.campaign = page.locator("#s2id_routing_rule_campaign_ids");
    this.waitUntilsCampaignVisible = page.locator("li.select2-highlighted");
    this.campaignResults = page.locator("div.select2-result-label");
    
    // Medium type
    this.mediumType =  page.locator("#s2id_routing_rule_medium_types");
    this.waitUntilsMediumTypeVisible = page.locator("li.select2-highlighted");
    this.mediumTypeResults = page.locator("div.select2-result-label");

    // Select Sales
    this.salesForRule = page.locator("#s2id_routing_rule_sale_ids input");

    // select routing strategy in rule
    this.ruleRoutingStrategy = page.locator("#s2id_routing_rule_routing_rule_strategy span.select2-chosen");
   
    // Save
    this.saveRule = page.locator("input[data-disable-with='Saving']");

  }

  async selectRoutingStrategy(strategy: mediumRoutingStrategy): Promise<void>{
    await this.routingStrategy.click();
    await this.waitUntilsMediumTypeVisible.waitFor({state: 'visible'});
    await this.mediumTypeResults.filter({ hasText: strategy }).first().click();
  }


  async saveRoutingConfiguration(): Promise<void>{
    await this.saveButtonRoutingConfiguration.click();
  }

  // Rule Creation
  async clickOnCreateNewRule(): Promise<void>{
    await this.createNewRule.scrollIntoViewIfNeeded();
    await this.createNewRule.click();
    await this.utils.waitTillFullPageLoad(this.page);

  }

  async enterRuleName(ruleNames: string): Promise<void>{
    await this.ruleName.waitFor({state:'visible'});
    await this.ruleName.fill(ruleNames);
  }

  async selectSubSource(subSourceName: string): Promise<void>{
    await this.subSource.scrollIntoViewIfNeeded();
    await this.subSource.click();
    await this.waitUntilsSubSourceVisible.waitFor({state: 'visible'});
    await this.subSourceResults.filter({ hasText: subSourceName }).first().click();
  }

  async selectCampaign(campaignName: string): Promise<void>{
    await this.campaign.scrollIntoViewIfNeeded();
    await this.campaign.click();
    await this.waitUntilsCampaignVisible.waitFor({state: 'visible'});
    await this.campaignResults.filter({ hasText: campaignName }).first().click();
  }

  async selectProjects(projectName: string): Promise<void>{
    await this.projects.scrollIntoViewIfNeeded();
    await this.projects.click();
    await this.waitUntilsProjectsVisible.waitFor({state: 'visible'});
    await this.projectsResults.filter({ hasText: projectName }).first().click();
  }

  async selectSources(sourceName: string): Promise<void>{
    await this.sourceForRule.scrollIntoViewIfNeeded();
    await this.sourceForRule.click();
    await this.waitUntilsSourceVisible.waitFor({state: 'visible'});
    await this.sourceResults.filter({ hasText: sourceName }).first().click();
  }

  async selectMediumType(type: mediumType):Promise<void>{
    await this.mediumType.scrollIntoViewIfNeeded();
    await this.mediumType.click();
    await this.waitUntilsMediumTypeVisible.waitFor({state: 'visible'});
    await this.mediumTypeResults.filter({ hasText: type }).first().click();
  }

  async selectMediumTypeRooted(type: mediumType):Promise<void>{
    await this.mediumType.scrollIntoViewIfNeeded();
    await this.mediumType.click();
    await this.waitUntilsMediumTypeVisible.waitFor({state: 'visible'});
    await this.mediumTypeResults.filter({ hasText: type }).first().click();
  }

  async selectSalesForRule(salesName: string):Promise<void>{
    await this.salesForRule.click();
    await this.waitUntilsMediumTypeVisible.waitFor({state: 'visible'});
    await this.mediumTypeResults.filter({ hasText: salesName }).first().click();
  }

  async selectRoutingStrategyForRule(rule: mediumRoutingStrategy):Promise<void>{
    await this.ruleRoutingStrategy.scrollIntoViewIfNeeded();
    await this.ruleRoutingStrategy.click();
    await this.waitUntilsMediumTypeVisible.waitFor({state: 'visible'});
    await this.mediumTypeResults.filter({ hasText: rule }).first().click();
  }

  async clickOnSaveRule(){
    await this.saveRule.click();
    await this.utils.waitTillFullPageLoad(this.page);
  }



}