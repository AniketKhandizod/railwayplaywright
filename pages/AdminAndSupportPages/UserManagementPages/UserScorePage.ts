import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils";

export class UserScorePage {
  private readonly page: Page;
  private readonly utils: Utils;
  private readonly SalesUserNameList: Locator;
  private readonly SalesUserRoleList: Locator;
  private readonly SalesUserTeamList: Locator;
  private readonly SalesUserScoreList: Locator;
  private readonly SalesUserRosterList: Locator;
  private readonly SalesUserActionList: Locator;

  // Filter
  private readonly FilterFunnel: Locator;
  private readonly EnterSalesNameInFilter: Locator;
  private readonly ApplyFilter: Locator;
  private readonly waitUntilInvisiblityOfSecondRow: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();
    this.SalesUserNameList = page.locator("//table[@class='table table-responsive']/tbody/tr/td[1]");
    this.SalesUserRoleList = page.locator("//table[@class='table table-responsive']/tbody/tr/td[2]");
    this.SalesUserTeamList = page.locator("//table[@class='table table-responsive']/tbody/tr/td[3]");
    this.SalesUserScoreList = page.locator("#user_score");
    this.SalesUserRosterList = page.locator("#user_roaster");
    this.SalesUserActionList = page.locator("button.btn.btn-primary.btn-sm");

    // Filter
    this.FilterFunnel = page.locator("button.btn.btn-light.btn-icon.toggle-filters");
    this.EnterSalesNameInFilter = page.locator("#search_params_search_string");
    this.ApplyFilter = page.locator("input.btn.btn-primary.form-control");

    // Invisiblity
    this.waitUntilInvisiblityOfSecondRow = page.locator("//table[@class='table table-responsive']/tbody/tr[2]");
  }

  async applySalesFilter(salesName: string){
    await this.FilterFunnel.click();
    await this.EnterSalesNameInFilter.clear();
    await this.EnterSalesNameInFilter.fill(salesName);
    await this.ApplyFilter.click();
    await this.utils.waitTillFullPageLoad(this.page);
  }

  async getFirstSalesUserName(): Promise<string | null>{
    return await this.SalesUserNameList.nth(0).textContent();
  }

  async getFirstSalesUserRole(): Promise<string | null>{
    return await this.SalesUserRoleList.nth(0).textContent();
  }

  async getFirstSalesUserTeam(): Promise<string | null>{
    return await this.SalesUserTeamList.nth(0).textContent();
  }

  async getFirstSalesUserScore(): Promise<string>{
    return await this.SalesUserScoreList.nth(0).inputValue();
  }

  async updateUserScore(updatedValue: number){
    await this.SalesUserScoreList.first().clear();
    await this.SalesUserScoreList.first().fill(""+updatedValue);

    await Promise.all([
      this.SalesUserActionList.first().click(),
      this.page.on('dialog', async (dialog) => {await dialog.accept()})
    ]);
  }

  async selectRoster(selectedValue: string): Promise<void>{
    await this.SalesUserRosterList.first().selectOption(selectedValue);
  }
}