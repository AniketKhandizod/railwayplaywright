import { Page, Locator } from "@playwright/test";
import * as path from 'path';
export enum ClientBusinessType {
  Developer = "Developer",
  Broker = "Broker"
}


export class ClientManagementPage {
  private readonly page: Page;
  private readonly clientManagementMenu: Locator;
  private readonly firstNameField: Locator;
  private readonly lastNameField: Locator;
  private readonly clientPhoneField: Locator;
  private readonly businessNameField: Locator;
  private readonly websiteField: Locator;
  private readonly SMSMASK: Locator;
  private readonly shortNameField: Locator;
  private readonly clientEmailField: Locator;
  private readonly clientAddressField: Locator;
  private readonly clientCountryDropdown: Locator;
  private readonly clientStateDropdown: Locator;
  private readonly clientCityField: Locator;
  private readonly clientZipField: Locator;
  private readonly accountManagerFirstNameField: Locator;
  private readonly accountManagerLastNameField: Locator;
  private readonly accountManagerPhoneField: Locator;
  private readonly accountManagerEmailField: Locator;
  private readonly clientUserFirstNameField: Locator;
  private readonly clientUserLastNameField: Locator;
  private readonly clientUserPhoneField: Locator;
  private readonly clientUserEmailField: Locator;
  private readonly teamNameField: Locator;
  private readonly clientCategoryDropdown: Locator;
  private readonly clientImageInput: Locator;
  private readonly businessTypeDropdown: Locator;
  private readonly businessTypeOption: Locator;
  private readonly salesPersonNameDropdown: Locator;
  private readonly onboardingPersonNameDropdown: Locator;
  private readonly enterTextInput: Locator;
  private readonly recommendationOption: Locator;
  private readonly saveClientButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.clientManagementMenu = page.locator("#main-menu-client-management");
    this.firstNameField = page.locator("#client_first_name");
    this.lastNameField = page.locator("#client_last_name");
    this.clientPhoneField = page.locator(".form-control.phone_number.unique_phone.client_phone");
    this.businessNameField = page.locator("#client_name");
    this.websiteField = page.locator("#client_website");
    this.SMSMASK = page.locator("#transactional_sms_mask");
    this.shortNameField = page.locator("#client_short_name");
    this.clientEmailField = page.locator("#client_email");
    this.clientAddressField = page.locator("#client_address_attributes_address1");
    this.clientCountryDropdown = page.locator("#client_address_attributes_country");
    this.clientStateDropdown = page.locator("select[name='client[address_attributes][state]']");
    this.clientCityField = page.locator("#client_address_attributes_city");
    this.clientZipField = page.locator("#client_address_attributes_zip");
    this.accountManagerFirstNameField = page.locator("#client_contacts_attributes_0_first_name");
    this.accountManagerLastNameField = page.locator("#client_contacts_attributes_0_last_name");
    this.accountManagerPhoneField = page.locator("input[placeholder='Phone']");
    this.accountManagerEmailField = page.locator("#client_contacts_attributes_0_email");
    this.clientUserFirstNameField = page.locator("#user_first_name");
    this.clientUserLastNameField = page.locator("#user_last_name");
    this.clientUserPhoneField = page.locator(".form-control.phone_number.non_form_field.unique_phone.user_phone");
    this.clientUserEmailField = page.locator("#user_email");
    this.teamNameField = page.locator("#team_name");
    this.clientCategoryDropdown = page.locator("#client_category");
    this.clientImageInput = page.locator("#client_image");
    this.businessTypeDropdown = page.locator("div#s2id_client_business_type a.select2-choice");
    this.businessTypeOption = page.locator(".select2-result-label")
    this.salesPersonNameDropdown = page.locator("label[name='client[onboarding_details][sales]'] + div.select2-container a.select2-choice");
    this.onboardingPersonNameDropdown = page.locator("label[name='client[onboarding_details][onboarding]'] + div.select2-container a.select2-choice");
    this.enterTextInput = page.locator("div[id='select2-drop'] input");
    this.recommendationOption = page.locator("div[class='select2-result-label']");
    this.saveClientButton = page.locator("input[value='Save']");
  }

  async clickOnClientManagement() {
    await this.clientManagementMenu.click();
  }

  async fillFirstName(firstName: string) {
    await this.firstNameField.fill(firstName);
  }

  async fillLastName(lastName: string) {
    await this.lastNameField.fill(lastName);
  }
  async fillClientPhone(phone: string) {
    await this.clientPhoneField.click();
    await this.clientPhoneField.fill(" " + phone);
  }

  async fillBusinessName(businessName: string) {
    await this.businessNameField.fill(businessName);
  }

  async fillWebsite(website: string) {
    await this.websiteField.fill(website);
  }

  async fillSMSMask(smsMask: string) {
    await this.SMSMASK.fill(smsMask);
  }

  async fillShortName(shortName: string) {
    await this.shortNameField.fill(shortName);
  }

  async fillClientEmail(email: string) {
    await this.clientEmailField.fill(email);
  }

  async fillClientAddress(address: string) {
    await this.clientAddressField.fill(address);
  }

  async selectClientCountry(country: string = "India") {
    await this.clientCountryDropdown.selectOption(country);
  }

  async selectClientState(state: string = "Maharashtra") {
    // Wait for the state dropdown to be populated after country selection
    await this.clientStateDropdown.waitFor({ state: "visible" });
    await this.clientStateDropdown.selectOption(state);
  }

  async fillClientCity(city: string) {
    await this.clientCityField.fill(city);
  }

  async fillClientZip(zip: string) {
    await this.clientZipField.fill(zip);
  }

  async fillAccountManagerFirstName(firstName: string) {
    await this.accountManagerFirstNameField.fill(firstName);
  }

  async fillAccountManagerLastName(lastName: string) {
    await this.accountManagerLastNameField.fill(lastName);
  }

  async fillAccountManagerPhone(phone: string) {
    // Click on the phone field first to focus it
    await this.accountManagerPhoneField.click();
    // Select all content (Ctrl+A), delete it, then enter complete phone number
    await this.accountManagerPhoneField.press('Control+a');
    await this.accountManagerPhoneField.press('Delete');
    await this.accountManagerPhoneField.fill("+91 " + phone);
  }

  async fillAccountManagerEmail(email: string) {
    await this.accountManagerEmailField.fill(email);
  }

  async fillClientUserFirstName(firstName: string) {
    await this.clientUserFirstNameField.fill(firstName);
  }

  async fillClientUserLastName(lastName: string) {
    await this.clientUserLastNameField.fill(lastName);
  }

  async fillClientUserPhone(phone: string) {
    // Click on the phone field first to focus it
    await this.clientUserPhoneField.click();
    // Select all content (Ctrl+A), delete it, then enter complete phone number
    await this.clientUserPhoneField.press('Control+a');
    await this.clientUserPhoneField.press('Delete');
    await this.clientUserPhoneField.fill("+91 " + phone);
  }

  async fillClientUserEmail(email: string) {
    await this.clientUserEmailField.fill(email);
  }

  async fillTeamName(teamName: string) {
    await this.teamNameField.fill(teamName);
  }

  async selectClientCategory(category: string) {
    await this.clientCategoryDropdown.selectOption(category);
  }

  async uploadClientImage(imagePath: string) {
    await this.clientImageInput.setInputFiles(imagePath);
  }

  async selectBusinessType(businessType: ClientBusinessType) {
    await this.businessTypeDropdown.click();
    await this.page.locator(`text=${businessType}`).click();
  }

  async fillSalesPersonName(salesPersonName: string) {
    await this.salesPersonNameDropdown.click();
    await this.enterTextInput.fill(salesPersonName);
    await this.recommendationOption.waitFor({ state: "visible" });
    await this.enterTextInput.press('Enter');
  }

  async fillOnboardingPersonName(onboardingPersonName: string) {
    await this.onboardingPersonNameDropdown.click();
    await this.enterTextInput.fill(onboardingPersonName);
    await this.recommendationOption.waitFor({ state: "visible" });
    await this.enterTextInput.press('Enter');
  }

  async saveClient() {
    await this.saveClientButton.click();
  }
}