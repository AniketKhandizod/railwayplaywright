import { Page, Locator, expect } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils";

export enum ConversationSmsDirection{
  Incoming = "Incoming",
  Outgoing = "Outgoing",
  All = "All"
}

export class SmsConversationPage {
  private  page: Page;
  private  utils: Utils;

  private  SmsDirectionBar: Locator;
  private  SmsWaitTillDropdownResults: Locator;
  private  SmsFilterDropdownResults: Locator;

  private  LeadIdList: Locator;
  private  LeadNameList: Locator;
  private  SmsProjectList: Locator;
  private  SmsContentList: Locator;
  private  SmsTypeList: Locator;
  private  SmsStatusList: Locator;
  private  SmsActivityOwnerList: Locator;
  private  SmsActivityDateList: Locator;
  private  SmsUnitsList: Locator;
  private  SmsActionList: Locator;


  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();

    // Direction change
    this.SmsDirectionBar = page.locator("div.select2-container.smses.form-control.select2.sms-select .select2-chosen");
    this.SmsWaitTillDropdownResults = page.locator("li.select2-highlighted");
    this.SmsFilterDropdownResults = page.locator("li.select2-result-selectable");
  }

  private async getHeaderElementsCount():Promise<void>{
    await this.utils.waitTillFullPageLoad(this.page);
    const headerElementsCount = await this.page.locator("#activities-container tr th").count();
    if(headerElementsCount === 10){
      this.LeadIdList = this.page.locator("//tbody[@class='activities']/tr/td[1]");
      this.LeadNameList = this.page.locator("//tbody[@class='activities']/tr/td[2]");
      this.SmsProjectList = this.page.locator("//tbody[@class='activities']/tr/td[3]");
      this.SmsContentList = this.page.locator("//tbody[@class='activities']/tr/td[4]");
      this.SmsTypeList = this.page.locator("//tbody[@class='activities']/tr/td[5]");
      this.SmsStatusList = this.page.locator("//tbody[@class='activities']/tr/td[6]");
      this.SmsActivityOwnerList = this.page.locator("//tbody[@class='activities']/tr/td[7]");
      this.SmsActivityDateList = this.page.locator("//tbody[@class='activities']/tr/td[8]");
      this.SmsUnitsList = this.page.locator("//tbody[@class='activities']/tr/td[9]");
      this.SmsActionList = this.page.locator("//tbody[@class='activities']/tr/td[10]");
    }else{
      this.LeadIdList = this.page.locator("//tbody[@class='activities']/tr/td[1]");
      this.LeadNameList = this.page.locator("//tbody[@class='activities']/tr/td[2]");
      this.SmsContentList = this.page.locator("//tbody[@class='activities']/tr/td[3]");
      this.SmsTypeList = this.page.locator("//tbody[@class='activities']/tr/td[4]");
      this.SmsStatusList = this.page.locator("//tbody[@class='activities']/tr/td[5]");
      this.SmsActivityOwnerList = this.page.locator("//tbody[@class='activities']/tr/td[6]");
      this.SmsActivityDateList = this.page.locator("//tbody[@class='activities']/tr/td[7]");
      this.SmsUnitsList = this.page.locator("//tbody[@class='activities']/tr/td[8]");
      this.SmsActionList = this.page.locator("//tbody[@class='activities']/tr/td[9]");
    }
  }

  async selectDirection(direction:ConversationSmsDirection){
    await this.getHeaderElementsCount();
    await this.SmsDirectionBar.click();
    await this.SmsWaitTillDropdownResults.waitFor({state: "visible"});
    await this.SmsFilterDropdownResults.filter({hasText: direction}).click();
  }

  async getLeadIdList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.LeadIdList.first().textContent().then(text => text?.trim() || '');
  }

  async getLeadNameList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.LeadNameList.first().textContent().then(text => text?.trim() || '');
  }


  async getSmsProjectList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.SmsProjectList.first().textContent().then(text => text?.trim() || '');
  }

  async getSmsContentList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.SmsContentList.first().textContent().then(text => text?.trim() || '');
  }

  async getSmsTypeList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.SmsTypeList.first().textContent().then(text => text?.trim() || '');
  }

  async getSmsStatusList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.SmsStatusList.first().textContent().then(text => text?.trim() || '');
  }

  async getSmsActivityOwnerList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.SmsActivityOwnerList.first().textContent().then(text => text?.trim() || '');
  }

  async getSmsActivityDateList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.SmsActivityDateList.first().textContent().then(text => text?.trim() || '');
  }

  async getSmsUnitsList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.SmsUnitsList.first().textContent().then(text => text?.trim() || '');
  }

  async getSmsActionList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.SmsActionList.first().textContent().then(text => text?.trim() || '');
  }
}