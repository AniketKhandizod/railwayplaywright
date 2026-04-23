import { Page, Locator, expect } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils";

export enum ConversationEmailDirection{
  Inbox = "Inbox",
  Outbox = "Outbox",
  Unread = "Unread"
}
// Lead ID	Lead Name	Project	Subject	Activity Owner	Activity date	Actions
export class EmailConversationPage {
  private  page: Page;
  private  EmailDirectionBar: Locator;
  private  EmailWaitTillDropdownResults: Locator;
  private  EmailFilterDropdownResults: Locator;

  private  LeadIdList: Locator;
  private  LeadNameList: Locator;
  private  EmailProjectList: Locator;
  private  EmailSubjectList: Locator;
  private  EmailActivityOwnerList: Locator;
  private  EmailActivityDateList: Locator;
  private  EmailActionList: Locator;
  private  utils: Utils;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();

    // Direction change
    this.EmailDirectionBar = page.locator("div.select2-container.emails.form-control.select2.email-select span.select2-chosen");
    this.EmailWaitTillDropdownResults = page.locator("li.select2-highlighted");
    this.EmailFilterDropdownResults = page.locator("li.select2-result-selectable");
  }

  private async getHeaderElementsCount():Promise<void>{
    await this.utils.waitTillFullPageLoad(this.page);
    const headerElementsCount = await this.page.locator("#activities-container tr th").count();

    if(headerElementsCount === 7){
      this.LeadIdList = this.page.locator("//tbody[@class='activities']/tr/td[1]");
      this.LeadNameList = this.page.locator("//tbody[@class='activities']/tr/td[2]");
      this.EmailProjectList = this.page.locator("//tbody[@class='activities']/tr/td[3]");
      this.EmailSubjectList = this.page.locator("//tbody[@class='activities']/tr/td[4]");
      this.EmailActivityOwnerList = this.page.locator("//tbody[@class='activities']/tr/td[5]");
      this.EmailActivityDateList = this.page.locator("//tbody[@class='activities']/tr/td[6]");
      this.EmailActionList = this.page.locator("//tbody[@class='activities']/tr/td[7]");
    }else{
      this.LeadIdList = this.page.locator("//tbody[@class='activities']/tr/td[1]");
      this.LeadNameList = this.page.locator("//tbody[@class='activities']/tr/td[2]");
      this.EmailSubjectList = this.page.locator("//tbody[@class='activities']/tr/td[3]");
      this.EmailActivityOwnerList = this.page.locator("//tbody[@class='activities']/tr/td[4]");
      this.EmailActivityDateList = this.page.locator("//tbody[@class='activities']/tr/td[5]");
      this.EmailActionList = this.page.locator("//tbody[@class='activities']/tr/td[6]");
    }
  }

  async selectDirection(direction:ConversationEmailDirection){
    await this.getHeaderElementsCount();
    await this.EmailDirectionBar.click();
    await this.EmailWaitTillDropdownResults.waitFor({state: "visible"});
    await this.EmailFilterDropdownResults.filter({hasText: direction}).click();
  }

  async getLeadIdList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.LeadIdList.first().textContent().then(text => text?.trim() || '');
  }

  async getLeadNameList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.LeadNameList.first().textContent().then(text => text?.trim() || '');
  }

  async getEmailProjectList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.EmailProjectList.first().textContent().then(text => text?.trim() || '');
  }

  async getEmailSubjectList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.EmailSubjectList.first().textContent().then(text => text?.trim() || '');
  }

  async getEmailActivityOwnerList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.EmailActivityOwnerList.first().textContent().then(text => text?.trim() || '');
  }

  async getEmailActivityDateList():Promise<string>{
    await this.getHeaderElementsCount();
    return await this.EmailActivityDateList.first().textContent().then(text => text?.trim() || '');
  }

}