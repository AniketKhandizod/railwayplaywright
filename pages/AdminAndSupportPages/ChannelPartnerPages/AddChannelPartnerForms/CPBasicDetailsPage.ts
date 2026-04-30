import { Page, Locator } from "@playwright/test";
import { AheadOf, Utils } from "../../../../utils/PlaywrightTestUtils.ts";
import { DatePicker } from "../../../UserPages/DatePicker.ts";

export class CPBasicDetailsPage {
  private readonly page: Page;
  private readonly utils:Utils;
  private readonly basicForm: Locator;
  private readonly nameOfCP: Locator;
  private readonly dateOfJoining: Locator;
  private readonly sourceOfRecruitment: Locator;
  private readonly cpBirthday: Locator;
  private readonly cpAnniversary: Locator;
  private readonly saveForm: Locator;


  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();
    this.basicForm = page.locator("//a[text()='Basics']");
    this.nameOfCP = page.locator("#channel_partner_name");
    this.dateOfJoining = page.locator("#channel_partner_date_of_joining");
    this.sourceOfRecruitment = page.locator("#channel_partner_source_of_recruitment");
    this.cpBirthday = page.locator("#channel_partner_birthday");
    this.cpAnniversary = page.locator("#channel_partner_anniversary");
    this.saveForm = page.locator("input[class='btn btn-primary']");
  }

  async clickOnBasicForm() {
    await this.basicForm.click();
  }

  async enterNameOfCP(name: string) {
    await this.nameOfCP.fill(name);
  }
  
  async enterDateOfJoining(date: number) {
    await this.utils.waitTillFullPageLoad(this.page);
    await this.dateOfJoining.click();
    const datePicker = new DatePicker(this.page);
    await datePicker.selectDate(await this.utils.calculateFutureDate(AheadOf.Day, date, 'd MMM yyyy'));
  }

  async enterSourceOfRecruitment(source: string) {
    await this.sourceOfRecruitment.fill(source);
  }
  
  async enterCpBirthday(birthday: number) {
    await this.cpBirthday.click();
    const datePicker = new DatePicker(this.page);
    await datePicker.selectDate(await this.utils.calculateFutureDate(AheadOf.Day, birthday, 'd MMM yyyy'));
  }

  async enterCpAnniversary(anniversary: number) {
    await this.cpAnniversary.click();
    const datePicker = new DatePicker(this.page);
    await datePicker.selectDate(await this.utils.calculateFutureDate(AheadOf.Day, anniversary, 'd MMM yyyy'));
  }
  
  async clickOnSaveForm() {
    await this.saveForm.click();
  }

}