import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils";

export class BulkCallAvailabilitiesPage {
  private readonly page: Page;

  // Bulk Call Availabilities filter 
  private readonly filterFunnel: Locator;
  private readonly enterSalesNameInFilter: Locator;
  private readonly applyFilter: Locator;
  private readonly leaveFlag: Locator;
  private readonly fallbackUser: Locator;
  private readonly fallbackUserReplace: Locator;
  private readonly saveFallbackUserButton: Locator;
  private readonly utils: Utils;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();
    
    // Bulk Call Availabilities filter 
    this.filterFunnel = page.locator(".toggle-filters");
    this.enterSalesNameInFilter = page.locator("#search_params_search_string");
    this.applyFilter = page.locator(".btn.btn-primary.btn-sm");

    // Bulk Call Availabilities table
    this.leaveFlag = page.locator(".td_class div.bootstrap-switch-animate");

    // fallback user
    this.fallbackUser = page.locator("div[class='select2-container select2-container-multi replace_with_sales form-control'] input");
    this.fallbackUserReplace = page.locator("div[class='select2-container select2-container-multi mt-2 sales_picker form-control'] input");
    this.saveFallbackUserButton = page.locator("button#save-call-availability");

  }

  async applyFilterFunnel(salesName: string){
    await this.filterFunnel.click();
    await this.enterSalesNameInFilter.fill(salesName);
    await this.applyFilter.click();
  }

  async tikLeaveFlag(markAvailable: boolean): Promise<boolean>{
    const today = new Date();
    const dayOfWeek = today.getDay();
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Convert to 0-based index where Monday = 0, Sunday = 6
    let dayIndex: number;
    if (dayOfWeek === 0) { // Sunday
      dayIndex = 6;
    } else {
      dayIndex = dayOfWeek - 1; // Monday = 0, Tuesday = 1, ..., Saturday = 5
    }
    
    let nthIndex: number;
    switch (dayIndex) {
      case 0: // Monday
        nthIndex = 0;
        break;
      case 1: // Tuesday
        nthIndex = 1;
        break;
      case 2: // Wednesday
        nthIndex = 2;
        break;
      case 3: // Thursday
        nthIndex = 3;
        break;
      case 4: // Friday
        nthIndex = 4;
        break;
      case 5: // Saturday
        nthIndex = 5;
        break;
      case 6: // Sunday
        nthIndex = 6;
        break;
      default:
        nthIndex = 7;
        break;
    }
    this.utils.waitTillFullPageLoad(this.page);
    let returnflag = false;
    if(await this.page.locator(`td[data-day='${days[nthIndex]}']`).getAttribute('data-user-available') === 'available' && markAvailable){
      await this.page.locator('.bootstrap-switch-handle-on').nth(nthIndex).click();
      returnflag = true;
    }
    return returnflag;
  }

  async selectFallbackUser(salesName: string){
    await this.fallbackUser.fill(salesName);
    await this.page.keyboard.press("Enter");
  }

  async selectFallbackUserReplace(salesName: string){
    await this.fallbackUserReplace.fill(salesName);
    await this.page.keyboard.press("Enter");
  }

  async clickSaveFallbackUserButton(){
    await this.saveFallbackUserButton.click();
  }

}