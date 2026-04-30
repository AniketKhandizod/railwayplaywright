import { Page, Locator, expect } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils";

export enum ConversationFollowupDirection{
  All = "All",
  Scheduled = "Scheduled",
  Conducted = "Conducted",
  Pending = "Pending",
  Cancelled = "Cancelled",
  Completed = "Completed"
}
// Lead ID	Lead Name	Project	Subject	Activity Owner	Activity date	Actions
export class FollowupConversationPage {
  private  page: Page;
  private  FollowupDirectionBar: Locator;
  private  FollowupWaitTillDropdownResults: Locator;
  private  FollowupFilterDropdownResults: Locator;

  private  LeadIdList: Locator;
  private  LeadNameList: Locator;
  private  FollowupProjectList: Locator;
  private  FollowupSubjectList: Locator;
  private  FollowupActivityOwnerList: Locator;
  private  FollowupActivityDateList: Locator;
  private  FollowupActionList: Locator;
  private  FollowupTypeList: Locator;
  private  FollowupStatusList: Locator;
  private  FollowupScheduleOnList: Locator;
  private  FollowupConductedOnList: Locator;

  // Filter
  private  funnelButton: Locator;
  private  dateFilter: Locator;
  private  selectTodayButton: Locator;
  private  applyButton: Locator;

  private  utils: Utils;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();

    // Direction change
    this.FollowupDirectionBar = page.locator(".followup-select .select2-chosen");
    this.FollowupWaitTillDropdownResults = page.locator("li.select2-highlighted");
    this.FollowupFilterDropdownResults = page.locator("li.select2-result-selectable");

     // Filter
     this.funnelButton = page.locator("button.toggle-filters");
     this.dateFilter = page.locator("input.form-control.date_range");
     this.selectTodayButton = page.locator(".daterangepicker li");
     this.applyButton = page.locator("button.apply-filter");
    }

  private async getHeaderElementsCount():Promise<void>{
    await this.utils.waitTillFullPageLoad(this.page);
    const headerElementsCount = await this.page.locator("#activities-container tr th").count();
    if(headerElementsCount === 9){
      this.LeadIdList = this.page.locator("//tbody[@class='activities']/tr/td[1]");
      this.LeadNameList = this.page.locator("//tbody[@class='activities']/tr/td[2]");
      this.FollowupProjectList = this.page.locator("//tbody[@class='activities']/tr/td[3]");
      this.FollowupTypeList = this.page.locator("//tbody[@class='activities']/tr/td[4]");
      this.FollowupStatusList = this.page.locator("//tbody[@class='activities']/tr/td[5]");
      this.FollowupActivityOwnerList = this.page.locator("//tbody[@class='activities']/tr/td[6]");
      this.FollowupScheduleOnList = this.page.locator("//tbody[@class='activities']/tr/td[7]");
      this.FollowupConductedOnList = this.page.locator("//tbody[@class='activities']/tr/td[8]");
      this.FollowupActionList = this.page.locator("//tbody[@class='activities']/tr/td[9]");
    }else{
      this.LeadIdList = this.page.locator("//tbody[@class='activities']/tr/td[1]");
      this.LeadNameList = this.page.locator("//tbody[@class='activities']/tr/td[2]");
      this.FollowupTypeList = this.page.locator("//tbody[@class='activities']/tr/td[3]");
      this.FollowupStatusList = this.page.locator("//tbody[@class='activities']/tr/td[4]");
      this.FollowupActivityOwnerList = this.page.locator("//tbody[@class='activities']/tr/td[5]");
      this.FollowupScheduleOnList = this.page.locator("//tbody[@class='activities']/tr/td[6]");
      this.FollowupConductedOnList = this.page.locator("//tbody[@class='activities']/tr/td[7]");
      this.FollowupActionList = this.page.locator("//tbody[@class='activities']/tr/td[8]");
    }
  }

  async selectDirection(direction:ConversationFollowupDirection){
    await this.getHeaderElementsCount();
    await this.FollowupDirectionBar.click();
    await this.FollowupWaitTillDropdownResults.waitFor({state: "visible"});
    await this.FollowupFilterDropdownResults.filter({hasText: direction}).click();
  }

  async selectTodaysDate(){
    await this.funnelButton.click();
    await this.dateFilter.click();
    await this.selectTodayButton.filter({hasText: "Today"}).click();
    await this.applyButton.click();
  }

  async getLeadIdList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.LeadIdList.first().textContent().then(text => text?.trim() || '');
  }

  async getLeadNameList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.LeadNameList.first().textContent().then(text => text?.trim() || '');
  }

  async getFollowupProjectList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.FollowupProjectList.first().textContent().then(text => text?.trim() || '');
  }

  async getFollowupTypeList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.FollowupTypeList.first().textContent().then(text => text?.trim() || '');
  }

  async getFollowupStatusList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.FollowupStatusList.first().textContent().then(text => text?.trim() || '');
  }

  async getFollowupActivityOwnerList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.FollowupActivityOwnerList.first().textContent().then(text => text?.trim() || '');
  }

  async getFollowupScheduleOnList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.FollowupScheduleOnList.first().textContent().then(text => text?.trim() || '');
  }

  async getFollowupConductedOnList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.FollowupConductedOnList.first().textContent().then(text => text?.trim() || '');
  }

  async getFollowupActionList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.FollowupActionList.first().textContent().then(text => text?.trim() || '');
  }

}