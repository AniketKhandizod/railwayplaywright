import { Page, Locator, expect } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils";

export enum ConversationCallDirection{
  All = "All",
  Inbound = "Inbound",
  Outbound = "Outbound"
}

export class CallConversationPage {
  private  page: Page;
  private  utils: Utils;
  private  LeadIdList: Locator;
  private  LeadNameList: Locator;
  private  CallProjectList: Locator;
  private  CallStatusList: Locator;
  private  CallDurationList: Locator;
  private  CallActivityOwnerList: Locator;
  private  LeadOwnerList: Locator;
  private  CallActivityDateList: Locator;
  private  CallRecordingList: Locator;
  private  ActionList: Locator;
  private  directionBar: Locator;
  private  waitTillDropdownResults: Locator;
  private  filterDropdownResults: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();

    // Direction change
    this.directionBar = page.locator(".select2-container.calls.form-control.select2.call-select span.select2-chosen");
    this.waitTillDropdownResults = page.locator("li.select2-highlighted");
    this.filterDropdownResults = page.locator("li.select2-result-selectable");
  }

  private async getHeaderElementsCount():Promise<void>{
    await this.utils.waitTillFullPageLoad(this.page);
    const headerElementsCount = await this.page.locator("#activities-container tr th").count();
    if(headerElementsCount === 11){
      this.LeadIdList = this.page.locator("//tbody[@class='activities']/tr/td[1]");
      this.LeadNameList = this.page.locator("//tbody[@class='activities']/tr/td[2]");
      this.CallProjectList = this.page.locator("//tbody[@class='activities']/tr/td[3]");
      this.CallStatusList = this.page.locator("//tbody[@class='activities']/tr/td[4]");
      this.CallDurationList = this.page.locator("//tbody[@class='activities']/tr/td[5]");
      this.CallActivityOwnerList = this.page.locator("//tbody[@class='activities']/tr/td[6]");
      this.LeadOwnerList = this.page.locator("//tbody[@class='activities']/tr/td[7]");
      this.CallActivityDateList = this.page.locator("//tbody[@class='activities']/tr/td[8]");
      this.CallRecordingList = this.page.locator("//tbody[@class='activities']/tr/td[9]");
      this.ActionList = this.page.locator("//tbody[@class='activities']/tr/td[10]");
    }else{
      this.LeadIdList = this.page.locator("//tbody[@class='activities']/tr/td[1]");
      this.LeadNameList = this.page.locator("//tbody[@class='activities']/tr/td[2]");
      this.CallStatusList = this.page.locator("//tbody[@class='activities']/tr/td[3]");
      this.CallDurationList = this.page.locator("//tbody[@class='activities']/tr/td[4]");
      this.CallActivityOwnerList = this.page.locator("//tbody[@class='activities']/tr/td[5]");
      this.LeadOwnerList = this.page.locator("//tbody[@class='activities']/tr/td[6]");
      this.CallActivityDateList = this.page.locator("//tbody[@class='activities']/tr/td[7]");
      this.CallRecordingList = this.page.locator("//tbody[@class='activities']/tr/td[8]");
      this.ActionList = this.page.locator("//tbody[@class='activities']/tr/td[9]");
    }
  }

  async selectDirection(direction:ConversationCallDirection){
    await this.getHeaderElementsCount();
    await this.directionBar.click();
    await this.waitTillDropdownResults.waitFor({state: "visible"});
    await this.filterDropdownResults.filter({hasText: direction}).click();
  }

  async getLeadIdList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.LeadIdList.first().textContent().then(text => text?.trim() || '');
  }

  async getLeadNameList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.LeadNameList.first().textContent().then(text => text?.trim() || '');
  }

  async getCallProjectList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.CallProjectList.first().textContent().then(text => text?.trim() || '');
  }

  async getCallStatusList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.CallStatusList.first().textContent().then(text => text?.trim() || '');
  }

  async getCallDurationList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.CallDurationList.first().textContent().then(text => text?.trim() || '');
  }

  async getCallActivityOwnerList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.CallActivityOwnerList.first().textContent().then(text => text?.trim() || '');
  }

  async getLeadOwnerList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.LeadOwnerList.first().textContent().then(text => text?.trim() || '');
  }

  async getCallActivityDateList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.CallActivityDateList.first().textContent().then(text => text?.trim() || '');
  }

  async getCallRecordingList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.CallRecordingList.first().textContent().then(text => text?.trim() || '');
  }

}