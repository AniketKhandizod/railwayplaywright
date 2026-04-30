import { Page, Locator } from "@playwright/test";

export class ManageUserPage {
  private readonly page: Page;
  private readonly ManageUserCard: Locator;
  private readonly UserScoreCard: Locator;
  private readonly BulkCallAvailabilitiesCard: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.ManageUserCard = page.locator("#btn-manage-user");
    this.UserScoreCard = page.locator("a[ubts='User Scores']");

    this.BulkCallAvailabilitiesCard = page.locator("a[ubts='Attendance & Availability']");
  }

  async clickUserScore(){
    this.UserScoreCard.click();
  }

  async clickBulkCallAvailabilities(){
    this.BulkCallAvailabilitiesCard.click();
  }
}