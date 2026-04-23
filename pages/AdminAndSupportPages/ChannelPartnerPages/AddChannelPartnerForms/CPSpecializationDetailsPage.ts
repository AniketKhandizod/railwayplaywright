import { Page, Locator } from "@playwright/test";
import { AheadOf, Utils } from "../../../../utils/PlaywrightTestUtils.ts";
import { DatePicker } from "../../../UserPages/DatePicker.ts";

export enum ChannelPartnerType{
  Local = "Local",
  National = "National",
  International = "International",
  Well_Wisher = "Well Wisher",
  Internal_Channel_Partner = "Internal Channel Partner",
}

export enum PropertyType{
  Studio = "Studio",
  Villa = "Villa",
  Apartment = "Apartment",
  Penthouse = "Penthouse",
  Duplex = "Duplex"
}
export class CPSpecializationDetailsPage {
  private readonly page: Page;
  private readonly utils:Utils;
  private readonly specializationDetails: Locator;
  private readonly cpType: Locator;
  private readonly cpTypeDropdown: Locator;
  private readonly cpCode: Locator;
  private readonly cpReraNumber: Locator;
  private readonly cpReraName: Locator;
  private readonly reraValidity: Locator;
  private readonly propertyType: Locator;
  private readonly propertyTypeDropdown: Locator;
  private readonly minBudget: Locator;
  private readonly maxBudget: Locator;
  private readonly individualCheckBox: Locator;
  private readonly fulltimeCheckbox: Locator;
  private readonly locationSpecific: Locator;
  private readonly saveFrom: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();
    this.specializationDetails = page.locator("//a[text()='Specialization']");
    this.cpType = page.locator("#s2id_channel_partner_channel_partner_type span.select2-chosen");
    this.cpTypeDropdown = page.locator("#select2-drop li");
    this.cpCode = page.locator("#channel_partner_channel_partner_code");
    this.cpReraNumber = page.locator("#channel_partner_rera_number");
    this.cpReraName = page.locator("#channel_partner_rera_name");
    this.reraValidity = page.locator("#channel_partner_rera_validity");
    this.propertyType = page.locator("#s2id_channel_partner_property_type input");
    this.propertyTypeDropdown = page.locator("#select2-drop li");
    this.minBudget = page.locator("#channel_partner_min_budget");
    this.maxBudget = page.locator("#channel_partner_max_budget");
    this.individualCheckBox = page.locator("//input[@id='channel_partner_is_individual']/parent::label");
    this.fulltimeCheckbox = page.locator("//input[@id='channel_partner_is_fulltime']/parent::label");
    this.locationSpecific = page.locator("//input[@id='channel_partner_is_location_specific']/parent::label");
    this.saveFrom = page.locator("input[class='btn btn-primary']");
  }

  async clickOnSpecializationDetails() {
    await this.specializationDetails.click();
  }

  async selectCpType(cpType: ChannelPartnerType) {
    await this.cpType.click();
    await this.cpTypeDropdown.filter({ hasText: cpType }).click();
  }

  async enterCpCode(cpCode: string) {
    await this.cpCode.fill(cpCode);
  }

  async enterCpReraNumber(cpReraNumber: string) {
    await this.cpReraNumber.fill(cpReraNumber);
  }
  
  async enterCpReraName(cpReraName: string) {
    await this.cpReraName.fill(cpReraName);
  }

  async enterReraValidity(date: number) {
    await this.reraValidity.click();
    const datePicker = new DatePicker(this.page);
    await datePicker.selectDate(await this.utils.calculateFutureDate(AheadOf.Day, date, 'd MMM yyyy'));
  }
  
  async selectPropertyType(propertyType: PropertyType) {
    await this.propertyType.click();
    await this.propertyTypeDropdown.filter({ hasText: propertyType }).first().click();
  }

  async enterMaxBudget(maxBudget: string) {
    await this.maxBudget.fill(maxBudget);
  }

  async enterMinBudget(minBudget: string) {
    await this.minBudget.fill(minBudget);
  }

  async isIndividual(flag: boolean) {
      await this.individualCheckBox.setChecked(flag);
  }

  async isFulltime(flag: boolean) {
      await this.fulltimeCheckbox.setChecked(flag);
  }

  async isLocationSpecific(flag: boolean) {
      await this.locationSpecific.setChecked(flag);
  }

  async savePartner() {
    await this.saveFrom.click();
  }
  
  

}