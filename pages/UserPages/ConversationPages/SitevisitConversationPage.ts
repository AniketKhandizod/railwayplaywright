import { Page, Locator, expect } from "@playwright/test";
import { AheadOf, Utils } from "../../../utils/PlaywrightTestUtils";

export enum ConversationSitevisitDirection{
  Scheduled = "Scheduled",
  Conducted = "Conducted",
  DidNotVisit = "Did not visit",
  Pending = "Pending",
  Invalid = "Invalid",
  CustomerNotInterested = "Customer Not Interested (Dropped)",
  LeadLostUnqualified = "Lead lost/Unqualified (Cancelled)",
  All = "All"
}

export class SitevisitConversationPage {
  private  page: Page;
  private  utils: Utils;

  private  SitevisitDirectionBar: Locator;
  private  SitevisitWaitTillDropdownResults: Locator;
  private  SitevisitFilterDropdownResults: Locator;

  private  LeadIdList: Locator;
  private  LeadNameList: Locator;
  private  ProjectList: Locator;
  private  InitiatedByList: Locator;
  private  StatusList: Locator;
  private  ActivityOwnerList: Locator;
  private  ActivityScheduleOnList: Locator;
  private  ConductedOnList: Locator;

  // Filter
  private  funnelButton: Locator;
  private  dateFilter: Locator;
  private  applyButton: Locator;
  private  selectTodayButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();

    // Direction change
    this.SitevisitDirectionBar = page.locator(".site-visit-select .select2-chosen");
    this.SitevisitWaitTillDropdownResults = page.locator("li.select2-highlighted");
    this.SitevisitFilterDropdownResults = page.locator("li.select2-result-selectable");

    // Sitevisit list
    this.LeadIdList = page.locator("//tbody[@class='activities']/tr/td[1]");
    this.LeadNameList = page.locator("//tbody[@class='activities']/tr/td[2]");
    this.ProjectList = page.locator("//tbody[@class='activities']/tr/td[3]");
    this.InitiatedByList = page.locator("//tbody[@class='activities']/tr/td[4]");
    this.StatusList = page.locator("//tbody[@class='activities']/tr/td[5]");
    this.ActivityOwnerList = page.locator("//tbody[@class='activities']/tr/td[6]");
    this.ActivityScheduleOnList = page.locator("//tbody[@class='activities']/tr/td[7]");
    this.ConductedOnList = page.locator("//tbody[@class='activities']/tr/td[8]");

    
    // Filter
    this.funnelButton = page.locator("button.toggle-filters");
    this.dateFilter = page.locator("input.form-control.date_range");
    this.selectTodayButton = page.locator(".daterangepicker li");
    this.applyButton = page.locator("button.apply-filter");
  }


  async selectDirection(direction:ConversationSitevisitDirection){
    await this.SitevisitDirectionBar.click();
    await this.SitevisitWaitTillDropdownResults.waitFor({state: "visible"});
    await this.SitevisitFilterDropdownResults.filter({hasText: direction}).click();
    await this.utils.waitTillFullPageLoad(this.page);
  }

  async selectTodaysDate(){
    await this.funnelButton.click();
    await this.dateFilter.click();
    await this.selectTodayButton.filter({hasText: "Today"}).click();
    await this.applyButton.click();
    await this.utils.waitTillFullPageLoad(this.page);
    await this.utils.waitUntilDurationPassed(5000);
  }

  async getLeadIdList():Promise<string>{
    return await this.LeadIdList.last().textContent().then(text => text?.trim() || '');
  }

  async getLeadNameList():Promise<string>{
    return await this.LeadNameList.last().textContent().then(text => text?.trim() || '');
  }

  async getProjectList():Promise<string>{
    return await this.ProjectList.last().textContent().then(text => text?.trim() || '');
  }

  async getInitiatedByList():Promise<string>{
    return await this.InitiatedByList.last().textContent().then(text => text?.trim() || '');
  }

  async getStatusList():Promise<string>{
    return await this.StatusList.last().textContent().then(text => text?.trim() || '');
  }

  async getActivityOwnerList():Promise<string>{
    return await this.ActivityOwnerList.last().textContent().then(text => text?.trim() || '');
  }

  async getActivityScheduleOnList():Promise<string>{
    return await this.ActivityScheduleOnList.last().textContent().then(text => text?.trim() || '');
  }

  async getConductedOnList():Promise<string>{
    return await this.ConductedOnList.last().textContent().then(text => text?.trim() || '');
  }
}