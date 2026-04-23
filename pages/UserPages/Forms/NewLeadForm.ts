import { Page, Locator } from "@playwright/test";

export class NewLeadForm {

    private readonly page: Page;
    private readonly firstName: Locator;
    private readonly lastName: Locator;
    private readonly primaryEmail: Locator;
    private readonly primaryPhone: Locator;
    private readonly intrestedProject: Locator;
    private readonly intrestedProjectEnterValue: Locator;
    private readonly highlightedProjectDropdown: Locator;
    private readonly saveLeadButton: Locator;
    private readonly primaryPhoneCountrySelect: Locator;
    private readonly primaryPhoneCountrySelectOptions: Locator;
    private readonly leadCampaign: Locator;
    private readonly leadCampaignSelect: Locator;
    private readonly leadCampaignHighlighted: Locator;
    private readonly channelPartner: Locator;
    private readonly channelPartnerName: Locator;
    private readonly channelPartnerDropdown: Locator;

    private readonly addChannelPartner: Locator;


    constructor(page: Page) {
        this.page = page;

        this.firstName = page.locator("#basic_info input[name='first_name']");
        this.lastName = page.locator("#basic_info input[name='last_name']");
        this.primaryEmail = page.locator("#basic_info input[name='primary_email_email']");

        // Phone Selection
        this.primaryPhone = page.locator("#basic_info input[name='primary_phone_ph_number']");
        this.primaryPhoneCountrySelect = page.locator("#basic_info .selected-flag");
        this.primaryPhoneCountrySelectOptions = page.locator("#country-listbox .dial-code");

        // Interested Project
        this.intrestedProject = page.locator(".project_of_interest + a + div a .select2-chosen");
        this.intrestedProjectEnterValue = page.locator(".select2-drop-active input");
        this.highlightedProjectDropdown = page.locator(".select2-highlighted");

        // Select lead campeign
        this.leadCampaign = page.getByRole('link', { name: 'Walkin' });
        this.leadCampaignSelect = page.locator("#select2-drop input");
        this.leadCampaignHighlighted = page.locator(".select2-highlighted");

        // Save lead button
        this.saveLeadButton = page.locator(".lead_submit");

        // Channel partner
        this.channelPartner = page.locator("//label[text()='Channel Partner']/parent::div //span[@class='select2-chosen']");
        this.channelPartnerName = page.locator("#select2-drop input");
        this.channelPartnerDropdown = page.locator("#select2-drop li");
        this.addChannelPartner = page.locator(".add_channel_partner");


    }

    async enterFirstName(firstName: string) {
        await this.firstName.fill(firstName);
    }

    async enterLastName(lastName: string) {
        await this.lastName.fill(lastName);
    }

    async enterPrimaryEmail(primaryEmail: string) {
        await this.primaryEmail.fill(primaryEmail);
    }

    async enterPrimaryPhone(countryCode: string,primaryPhone: string) {

        await this.primaryPhoneCountrySelect.click();
        await this.primaryPhone.fill(" "+primaryPhone);
        for (let i = 0; i < await this.primaryPhoneCountrySelectOptions.count(); i++) {
            const option = this.primaryPhoneCountrySelectOptions.nth(i);
            if (await option.textContent() === countryCode) {
                await option.click();
                break;
            }
        }
    }

    async enterIntrestedProject(intrestedProject: string) {
        await this.intrestedProject.click();
        await this.intrestedProjectEnterValue.fill(intrestedProject);
        await this.highlightedProjectDropdown.click();
    }

    async selectLeadCampaign(leadCampaign: string) {
        await this.leadCampaign.click();
        await this.leadCampaignSelect.fill(leadCampaign);
        await this.leadCampaignHighlighted.click();
    }

    async clickOnSaveLeadButton() {
        await this.saveLeadButton.click();
    }

    async selectChannelPartner(cpName: string){
        await this.channelPartner.click();
        await this.channelPartnerName.fill(cpName);
        await this.channelPartnerDropdown.filter({ hasText: cpName }).first().click();
    }

    async clickOnAddChannelPartner() {
        await this.addChannelPartner.click();
    }


}