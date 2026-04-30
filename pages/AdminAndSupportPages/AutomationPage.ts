import { Page, Locator } from "@playwright/test";

export class AutomationPage {
  private readonly page: Page;
  private readonly Workflows: Locator;
  private readonly BulkActivities: Locator;
  private readonly AudienceManager: Locator;
  private readonly LeadCaptureForms: Locator;
  private readonly CampaignSetup: Locator;
  private readonly CampaignTargets: Locator;
  private readonly VirtualNumbers: Locator;
  private readonly SourceSubSources: Locator;
  private readonly LeadScore: Locator;
  private readonly EmailTemplates: Locator;
  private readonly SMSTemplates: Locator;
  private readonly WhatsAppTemplates: Locator;
  private readonly LeadIntegration: Locator;
  private readonly ThirdPartyAccounts: Locator;
  private readonly ResyncFailedFBLeads: Locator;
  private readonly RoiTracking: Locator;
  private readonly WorkflowWebhookHistory: Locator;
  private readonly webHookHistoryPageList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.Workflows = page.locator("[ubts='Workflows']");
    this.BulkActivities = page.locator("[ubts='Bulk Activities']");
    this.WorkflowWebhookHistory = page.getByRole('link', { name: ' Workflow Webhook History' });
    this.AudienceManager = page.locator("[ubts='Audience Manager']");
    this.LeadCaptureForms = page.locator("[ubts='Lead Capture Forms']");
    this.CampaignSetup = page.locator("[ubts='Campaign Setup']");
    this.CampaignTargets = page.locator("[ubts='Campaign Targets']");
    this.VirtualNumbers = page.locator("[ubts='Virtual Numbers']");
    this.SourceSubSources = page.locator("[ubts='Source & Sub-Sources']");
    this.LeadScore = page.locator("[ubts='Lead Score']");
    this.EmailTemplates = page.locator("[ubts='Email Templates']");
    this.SMSTemplates = page.locator("[ubts='SMS Templates']");
    this.WhatsAppTemplates = page.locator("[ubts='WhatsApp Templates']");
    this.LeadIntegration = page.locator("[ubts='Lead Integration']");
    this.ThirdPartyAccounts = page.locator("[ubts='3rd Party Accounts']");
    this.ResyncFailedFBLeads = page.locator("[ubts='Resync Failed FB Leads']");
    this.RoiTracking = page.locator("[ubts='roi tracking']");
    this.webHookHistoryPageList = page.locator("div.webhook-history-list");
  }

  // Click on the workflows page
  async clickOnWorkflows() {
    await this.Workflows.click();
  }

  // Click on the bulk activities page
  async clickOnBulkActivities() {
   await this.BulkActivities.click();
  }

  // Click on the audience manager page
  async clickOnAudienceManager() {
    await this.AudienceManager.click();
  }

  // Click on the lead capture forms page
  async clickOnLeadCaptureForms() {
    await this.LeadCaptureForms.click();
  }

  // Click on the campaign setup page
  async clickOnCampaignSetup() {
    await this.CampaignSetup.click();
  }

  // Click on the campaign targets page
  async clickOnCampaignTargets() {
    await this.CampaignTargets.click();
  }

  // Click on the virtual numbers page
  async clickOnVirtualNumbers() {
    await this.VirtualNumbers.click();
  }

  // Click on the source and sub-sources page
  async clickOnSourceSubSources() {
    await this.SourceSubSources.click();
  }

  // Click on the lead score page
  async clickOnLeadScore() {
    await this.LeadScore.click();
  }

  // Click on the email templates page
  async clickOnEmailTemplates() {
    await this.EmailTemplates.click();
  }

  // Click on the sms templates page
  async clickOnSMSTemplates() {
    await this.SMSTemplates.click();
  }

  // Click on the whatsapp templates page
  async clickOnWhatsAppTemplates() {
    await this.WhatsAppTemplates.click();
  }

  // Click on the lead integration page
  async clickOnLeadIntegration() {
    await this.LeadIntegration.click();
  }

  // Click on the 3rd party accounts page
  async clickOnThirdPartyAccounts() {
    await this.ThirdPartyAccounts.click();
  }

  // Click on the resync failed fb leads page   
  async clickOnResyncFailedFBLeads() {
    await this.ResyncFailedFBLeads.click();
  }

  // Click on the roi tracking page
  async clickOnRoiTracking() {
    await this.RoiTracking.click();
  }

  // Click on the workflow webhook history page
  async clickOnWorkflowWebhookHistory() {
    await this.WorkflowWebhookHistory.click();
    return this.webHookHistoryPageList;
  }
}