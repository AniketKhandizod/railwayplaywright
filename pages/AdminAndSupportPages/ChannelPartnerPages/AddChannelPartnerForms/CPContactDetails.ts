import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../../utils/PlaywrightTestUtils.ts";

export class CPContactDetailsPage {
  private readonly page: Page;
  private readonly utils:Utils;
  private readonly ContactDetails: Locator;
  private readonly salutationOfPartner: Locator;
  private readonly salutationDropdownOfPartner: Locator;
  private readonly firstNameOfPartner: Locator;
  private readonly lastNameOfPartner: Locator;
  private readonly phoneCode: Locator;
  private readonly phoneCodeDropdown: Locator;
  private readonly phoneNumberOfPartner: Locator;
  private readonly emailOfPartner: Locator;
  private readonly alternatePhoneOfPartner: Locator;
  private readonly alternatePhoneCode: Locator;
  private readonly alternatePhoneCodeDropdown: Locator;
  private readonly alternateEmailOfPartner: Locator;
  private readonly designationOfPartner: Locator;
  private readonly panOfPartner: Locator;
  private readonly locationOfWorkOfPartner: Locator;
  private readonly projectOfPartner: Locator;
  private readonly projectDropdownOfPartner: Locator;
  private readonly addressOfPartner: Locator;
  private readonly streetOfPartner: Locator;
  private readonly countryOfPartner: Locator;
  private readonly stateOfPartner: Locator;
  private readonly cityOfPartner: Locator;
  private readonly zipOfPartner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();
    this.ContactDetails = page.locator("//a[text()='Contact details']");
    this.salutationOfPartner = page.locator("#s2id_channel_partner_contact_salutation span.select2-chosen");
    this.salutationDropdownOfPartner = page.locator("#select2-drop li");
    this.firstNameOfPartner = page.locator("#channel_partner_contact_first_name");
    this.lastNameOfPartner = page.locator("#channel_partner_contact_last_name");
    this.phoneCode = page.locator("//label[@for='channel_partner_contact_phone']/parent::div//div[@class='selected-flag']");
    this.phoneCodeDropdown = page.locator("//label[@for='channel_partner_contact_phone']/parent::div//ul[@id='country-listbox']/li");
    this.phoneNumberOfPartner = page.locator("input[data-field='phone']");
    this.emailOfPartner = page.locator("input.email");
    this.alternatePhoneCode = page.locator("//label[@for='channel_partner_contact_alternate_phone']/parent::div//div[@class='selected-flag']");
    this.alternatePhoneCodeDropdown = page.locator("//label[@for='channel_partner_contact_alternate_phone']/parent::div//ul[@id='country-listbox']/li");
    this.alternatePhoneOfPartner = page.locator("#contact_alt_phone_number");
    this.alternateEmailOfPartner = page.locator("input[data-field='alternate_email']");
    this.designationOfPartner = page.locator("#channel_partner_contact_designation");
    this.panOfPartner = page.locator("#channel_partner_contact_pan");
    this.locationOfWorkOfPartner = page.locator("#channel_partner_location");
    this.projectOfPartner = page.locator("#s2id_channel_partner_project_ids input");
    this.projectDropdownOfPartner = page.locator("#select2-drop li");
    this.addressOfPartner = page.locator("#channel_partner_address_address1");
    this.streetOfPartner = page.locator("#channel_partner_address_address2");
    this.countryOfPartner = page.locator("#channel_partner_address_country");
    this.stateOfPartner = page.locator("select[name='channel_partner[address][state]']");
    this.cityOfPartner = page.locator("#channel_partner_address_city");
    this.zipOfPartner = page.locator("#channel_partner_address_zip");
  }

  async clickOnContactDetails() {
    await this.ContactDetails.click();
    await this.utils.waitTillFullPageLoad(this.page);
  }

  async selectSalutationOfPartner(salutation: string) {
    await this.salutationOfPartner.click();
    await this.salutationDropdownOfPartner.filter({ hasText: salutation }).click();
  }

  async enterFirstNameOfPartner(firstName: string) {
    await this.firstNameOfPartner.fill(firstName);
  }

  async enterLastNameOfPartner(lastName: string) {
    await this.lastNameOfPartner.fill(lastName);
  }

  async enterPhoneNumberOfPartner(countryCode: string, phoneNumber: string) {
    await this.phoneCode.click();
    await this.phoneCodeDropdown.filter({ hasText: countryCode }).first().click();
    await this.phoneNumberOfPartner.clear();
    await this.phoneNumberOfPartner.fill(phoneNumber);
  }

  async enterEmailOfPartner(email: string) {
    await this.emailOfPartner.fill(email);
  }
  
  async enterAlternatePhoneOfPartner(alternatePhone: string) {
    await this.alternatePhoneCode.click();
    await this.alternatePhoneCodeDropdown.filter({ hasText: "+91" }).first().click();
    await this.alternatePhoneOfPartner.clear();
    await this.alternatePhoneOfPartner.fill(alternatePhone);
  }

  async enterAlternateEmailOfPartner(alternateEmail: string) {
    await this.alternateEmailOfPartner.fill(alternateEmail);
  }

  async enterDesignationOfPartner(designation: string) {
    await this.designationOfPartner.fill(designation);
  }
  
  async enterPanOfPartner(pan: string) {
    await this.panOfPartner.fill(pan);
  }

  async enterLocationOfWorkOfPartner(location: string) {
    await this.locationOfWorkOfPartner.fill(location);
  }

  async enterProjectOfPartner(project: string) {
    await this.projectOfPartner.fill(project);
    await this.projectDropdownOfPartner.filter({ hasText: project }).click();
  }

  async enterAddressOfPartner(address: string) {
    await this.addressOfPartner.fill(address);
  }

  async enterStreetOfPartner(street: string) {
    await this.streetOfPartner.fill(street);
  }

  async enterCountryOfPartner(country: string) {
    await this.countryOfPartner.selectOption({ label: country });
  }
  
  async enterStateOfPartner(state: string) {
    await this.stateOfPartner.selectOption({ label: state });
  }

  async enterCityOfPartner(city: string) {
    await this.cityOfPartner.fill(city);
  }

  async enterZipOfPartner(zip: string) {
    await this.zipOfPartner.fill(zip);
  }
  
  

}