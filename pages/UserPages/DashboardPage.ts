import { Page, Locator, expect } from "@playwright/test";
import { Utils } from "../../utils/PlaywrightTestUtils";

export class UserDashboard {
  private readonly page: Page;
  private readonly refreshButton;
  private readonly dhaboardTitle;
  private readonly dashboardRefreshTime;

  constructor(page: Page) {
    this.page = page;
    this.refreshButton = page.locator("i[class='ion-refresh refresh-sales-dashboard']");
    this.dhaboardTitle = page.locator(".tile-item.clickable.go_to_leads > div");
    this.dashboardRefreshTime = page.locator("span[class='refresh-time-note mr-2 small']");
  }

  async refreshDashboard(){
    const utils = new Utils();
    for(let i = 0; i < 2; i++){
        await this.refreshButton.waitFor({ state: "visible" });
        await utils.sleep(500);
        await this.dashboardRefreshTime.waitFor({ state: "visible" });
        await this.refreshButton.click();
        await this.page.waitForLoadState('networkidle');
    }
  }

  async getDashboardTitle(): Promise<Locator>{
    await this.page.waitForLoadState('networkidle');
    return this.dhaboardTitle;
  }
}