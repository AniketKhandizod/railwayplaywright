import { Page, Locator } from "@playwright/test";

export class SettingPage {
  private readonly page: Page;
  private readonly UserManagement: Locator;
  private readonly Billing: Locator;
  private readonly SearchLists: Locator;
  private readonly LeadSettings: Locator;
  private readonly Import: Locator;
  private readonly Export: Locator;
  private readonly Telephony: Locator;
  private readonly PartnerSettings: Locator;
  private readonly NotificationSettings: Locator;
  private readonly OtherSettings: Locator;
  private readonly EnableFeatures: Locator;
  private readonly CustomFields: Locator;
  private readonly Incentives: Locator;
  private readonly CompanyDetails: Locator;
  private readonly PreSalesConfiguration: Locator;
  private readonly PostSalesConfiguration: Locator;
  private readonly BookingLists: Locator;
  private readonly UserTargets: Locator;
  private readonly Goals: Locator;
  private readonly ReassignLeads: Locator;
  private readonly Bulkjobhistory: Locator;
  private readonly RoutingSetup: Locator;
  private readonly FeedbackForm: Locator;
  private readonly PropertLanding: Locator;
  private readonly BulkCheckLeadPresence: Locator;

  constructor(page: Page) {
    this.page = page;
    this.UserManagement = page.locator("[ubts='User Management'] p");
    this.Billing = page.locator("[ubts='Billing'] p");
    this.SearchLists = page.locator("[ubts='Search Lists'] p");
    this.LeadSettings = page.locator("[ubts='Lead Settings'] p");
    this.Import = page.locator("[ubts='Import'] p");
    this.Export = page.locator("[ubts='Export'] p");
    this.Telephony = page.locator("[ubts='Telephony'] p");
    this.PartnerSettings = page.locator("[ubts='Partner Settings'] p");
    this.NotificationSettings = page.locator("[ubts='Notification Settings'] p");
    this.OtherSettings = page.locator("[ubts='Other Settings'] p");
    this.EnableFeatures = page.locator("[ubts='Enable Features'] p");
    this.CustomFields = page.locator("[ubts='Custom Fields'] p");
    this.Incentives = page.locator("[ubts='Incentives'] p");
    this.CompanyDetails = page.locator("[ubts='Company Details'] p");
    this.PreSalesConfiguration = page.locator("[ubts='Pre Sales Configuration'] p");
    this.PostSalesConfiguration = page.locator("[ubts='Post Sales Configuration'] p");
    this.BookingLists = page.locator("[ubts='Booking Lists'] p");
    this.UserTargets = page.locator("[ubts='User Targets'] p");
    this.Goals = page.locator("[ubts='Goals'] p");
    this.ReassignLeads = page.locator("[ubts='Reassign Leads'] p");
    this.Bulkjobhistory = page.locator("[ubts='Bulk job history'] p");
    this.RoutingSetup = page.locator("[ubts='Routing Setup'] p");
    this.FeedbackForm = page.locator("[ubts='Feedback Form'] p");
    this.PropertLanding = page.locator("[ubts='Propert Landing'] p");
    this.BulkCheckLeadPresence = page.locator("[ubts='Bulk Check Lead Presence'] p");
  }

  // Click on the setting page
  async clickOnUserManagement() {
    await this.UserManagement.click();
  }

  // Click on the billing page
  async clickOnBilling() {  
    await this.Billing.click();
  }

  // Click on the search lists page
  async clickOnSearchLists() {
    await this.SearchLists.click();
  }

  // Click on the lead settings page
  async clickOnLeadSettings() {
    await this.LeadSettings.click();
  }

  // Click on the import page
  async clickOnImport() {
    await this.Import.click();
  }

  // Click on the export page
  async clickOnExport() {
    await this.Export.click();
  }

  // Click on the telephony page
  async clickOnTelephony() {
    await this.Telephony.click();
  }

  // Click on the partner settings page
  async clickOnPartnerSettings() {
    await this.PartnerSettings.click();
  }

  // Click on the notification settings page
  async clickOnNotificationSettings() {
    await this.NotificationSettings.click();
  }

  // Click on the other settings page
  async clickOnOtherSettings() {
    await this.OtherSettings.click();
  }

  // Click on the enable features page
  async clickOnEnableFeatures() {
    await this.EnableFeatures.click();
  }

  // Click on the custom fields page
  async clickOnCustomFields() {
    await this.CustomFields.click();
  }

  // Click on the incentives page
  async clickOnIncentives() {
    await this.Incentives.click();
  }

  // Click on the company details page
  async clickOnCompanyDetails() {
    await this.CompanyDetails.click();
  }

  // Click on the pre sales configuration page
  async clickOnPreSalesConfiguration() {
    await this.PreSalesConfiguration.click();
  }

  // Click on the post sales configuration page
  async clickOnPostSalesConfiguration() {
    await this.PostSalesConfiguration.click();
  }

  // Click on the booking lists page
  async clickOnBookingLists() {
    await this.BookingLists.click();
  }

  // Click on the user targets page
  async clickOnUserTargets() {
    await this.UserTargets.click();
  }

  // Click on the goals page
  async clickOnGoals() {
    await this.Goals.click();
  }

  // Click on the reassign leads page
  async clickOnReassignLeads() {
    await this.ReassignLeads.click();
  }

  // Click on the bulk job history page
  async clickOnBulkjobhistory() {
    await this.Bulkjobhistory.click();
  }

  // Click on the routing setup page
  async clickOnRoutingSetup() {
    await this.RoutingSetup.click();
  }

  // Click on the feedback form page
  async clickOnFeedbackForm() {
    await this.FeedbackForm.click();
  }

  // Click on the propert landing page
  async clickOnPropertLanding() {
    await this.PropertLanding.click();
  }

  // Click on the bulk check lead presence page
  async clickOnBulkCheckLeadPresence() {
    await this.BulkCheckLeadPresence.click();
  }

}
