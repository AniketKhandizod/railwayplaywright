import { Page, Locator, expect } from "@playwright/test";
import { AheadOf, Utils } from "../../utils/PlaywrightTestUtils";

export class SidePanal {
  private readonly page: Page;
  private readonly utils: Utils;
  private readonly Dashboards: Locator;
  private readonly LeadManagement: Locator;
  private readonly Conversations: Locator;
  private readonly Tasks: Locator;
  private readonly Reports: Locator;
  private readonly ProductsServices: Locator;
  private readonly Automation: Locator;
  private readonly Assets: Locator;
  private readonly Settings: Locator;
  private readonly Signin: Locator;
  private readonly ReleaseNotes: Locator;
  private readonly allLeads: Locator;
  private readonly createLead: Locator;
  private readonly searchLeads: Locator;

  // Conversation 
  private readonly callConversation: Locator;
  private readonly emailConversation: Locator;
  private readonly smsConversation: Locator;
  private readonly WhatsAppConversation: Locator;
  private readonly sitevisitConversation: Locator;
  private readonly followupConversation: Locator;

  // Task
  private readonly newTask: Locator;
  private readonly allTask: Locator;
  private readonly openTask: Locator;
  private readonly completedTask: Locator;
  private readonly archivedTask: Locator;
  
  // Inventory
  private readonly developersLink : Locator;
  private readonly projectsLink : Locator;
  private readonly projectTowersLink: Locator;
  private readonly floorPlanLink: Locator;
  private readonly unitsLink: Locator;
  private readonly quickAddUnitLink : Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();
    this.Dashboards = page.locator("#main-menu-dashboards");

    // Lead Management
    this.LeadManagement = page.locator("#main-menu-lead-management");
    this.searchLeads = page.locator("a[ubts='Search Leads']");

    this.Conversations = page.locator("#main-menu-conversations");
    this.Tasks = page.locator("#main-menu-tasks");
    this.Reports = page.locator("#main-menu-reports");
    this.ProductsServices = page.locator("#main-menu-products-services");
    this.Automation = page.locator("#main-menu-automation");
    this.Assets = page.locator("#main-menu-assets");
    this.Settings = page.locator("#main-menu-settings");
    this.Signin = page.locator("#main-menu-signin");
    this.ReleaseNotes = page.locator("#release_notes_link_container");

    // Lead Management
    this.allLeads = page.locator('a[title="All Leads"]');
    this.createLead = page.locator('.new-lead a');

    // Conversation
    this.callConversation = page.locator("a[ubts='Conversations - Calls']");
    this.emailConversation = page.locator("a[ubts='Conversations - Emails']");
    this.smsConversation = page.locator("a[ubts='Conversations - SMSes']");
    this.WhatsAppConversation = page.locator("a[ubts='Conversations - Whatsapps']");
    this.sitevisitConversation = page.locator("a[ubts='Conversations - Site Visits']");
    this.followupConversation = page.locator("a[ubts='Conversations - Followups']");

    // Task
    this.newTask = page.locator("a[ubts='Tasks - New Task']");
    this.allTask = page.locator("a[ubts='Tasks - All']");
    this.openTask = page.locator("a[ubts='Tasks - Open']");
    this.completedTask = page.locator("a[ubts='Tasks - Completed']");
    this.archivedTask = page.locator("a[ubts='Tasks - Archieved']");

    // Inventory
    this.developersLink = page.getByRole('link',{name:'Developers'});
    this.projectsLink = page.getByRole('link',{name:'Projects'});
    this.projectTowersLink = page.getByRole('link',{name:'Project Towers'});
    this.floorPlanLink = page.getByRole('link',{name:'Floor Plans'});
    this.unitsLink = page.getByRole('link',{name:'Units'});
    this.quickAddUnitLink = page.getByRole('link',{name:'Quick Add Unit'});
  }

  // Click on the dashboards page
  async clickOnDashboards() {
    await this.Dashboards.click();
  }

  // Click on the lead management page
  async clickOnLeadManagement() {
    await this.LeadManagement.click();
  }

  // Click on the conversations page
  async clickOnConversations() {
    await this.Conversations.click();
  }
  
  // Click on the tasks page
  async clickOnTasks() {
    await this.Tasks.click();
  }
      
  // Click on the reports page
  async clickOnReports() {
    await this.Reports.click();
  }

  // Click on the products and services page
  async clickOnProductsServices() {
    await this.ProductsServices.click();
  }

  // Hover on the products and services page
  async hoverOnDeveloperProductsServiceAndClick() {
    await this.ProductsServices.hover();
    await this.developersLink.click();
    await this.utils.waitTillFullPageLoad(this.page);
  }
  async hoverOnProjectsProductsServiceAndClick() {
    await this.ProductsServices.hover();
    await this.projectsLink.click();
    await this.utils.waitTillFullPageLoad(this.page);
  }
  async hoverOnProjectTowersProductsServiceAndClick() {
    await this.ProductsServices.hover();
    await this.projectTowersLink.click();
    await this.utils.waitTillFullPageLoad(this.page);
  }
  async hoverOnFloorPlanProductsServiceAndClick() {
    await this.ProductsServices.hover();
    await this.floorPlanLink.click();
    await this.utils.waitTillFullPageLoad(this.page);
  }
  async hoverOnUnitsProductsServiceAndClick() {
    await this.ProductsServices.hover();
    await this.unitsLink.click();
    await this.utils.waitTillFullPageLoad(this.page);
  } 
  async hoverOnQuickAddUnitProductsServiceAndClick(){
    await this.ProductsServices.hover();
    await this.quickAddUnitLink.click();
    await this.utils.waitTillFullPageLoad(this.page);
  }
  // Click on the automation page
  async clickOnAutomation() {
    await this.Automation.click();
  }

  // Click on the assets page
  async clickOnAssets() {
    await this.Assets.click();
  }

  // Click on the settings page
  async clickOnSettings() {
    await this.Settings.click();
  }

  // Click on the signin page
  async clickOnSignin() {
    await this.Signin.click();
  }

  // Click on the release notes page
  async clickOnReleaseNotes() {
    await this.ReleaseNotes.click();
  }

  // Lead Management
  async clickOnAllLeads(){
    await this.LeadManagement.hover();
    await this.allLeads.click();
  }

  async clickOnSearchLeads(){
    await this.LeadManagement.hover();
    await this.searchLeads.click();
  }

  async clickOnCreateLead(){
    await this.LeadManagement.hover();
    await this.createLead.click();
  }

  // Conversation
  async clickOnCallConversation(){
    await this.Conversations.hover();
    await this.callConversation.click();
  }

  async clickOnEmailConversation(){
    await this.Conversations.hover();
    await this.emailConversation.click();
  }

  async clickOnSMSConversation(){
    await this.Conversations.hover();
    await this.smsConversation.click();
  }

  async clickOnSiteVisitConversation(){
    await this.Conversations.hover();
    await this.sitevisitConversation.click();
  }

  async clickOnFollowupConversation(){
    await this.Conversations.hover();
    await this.followupConversation.click();
  }

  async clickOnWhatsAppConversation(){
    await this.Conversations.hover();
    await this.WhatsAppConversation.click();
  }

  // Task
  async clickOnNewTask(){
    await this.Tasks.hover();
    await this.newTask.click();
  }

  async clickOnAllTask(){
    await this.Tasks.hover();
    await this.allTask.click();
    await this.page.reload();
  }

  async clickOnOpenTask(){
    await this.Tasks.hover();
    await this.openTask.click();
  }

  async clickOnCompletedTask(){
    await this.Tasks.hover();
    await this.completedTask.click();
  }

  async clickOnArchivedTask(){
    await this.Tasks.hover();
    await this.archivedTask.click();
  }
}