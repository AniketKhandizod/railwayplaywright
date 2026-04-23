import { Page, Locator } from "@playwright/test";
import { DatePicker } from "../../UserPages/DatePicker.ts";
import { AheadOf, Utils } from "../../../utils/PlaywrightTestUtils.ts";

export class ChannelPartnerFormOnNewLeadPage {

    private readonly page: Page;
    private readonly utils: Utils;
    private readonly channelParnterNameOnLeadProfile: Locator;
    private readonly channelParnterBirthdayOnLeadProfilePage: Locator;
    private readonly channelParnterAnniversaryOnLeadProfilePage: Locator;
    private readonly channelParnterReranumberOnLeadProfilePage: Locator;
    private readonly channelParnterReravalidityOnLeadProfilePage: Locator;
    private readonly channelParnterSalutationOnLeadProfilePage: Locator;
    private readonly channelParnterFirstNameOnLeadProfilePage: Locator;
    private readonly channelParnterLastNameOnLeadProfilePage: Locator;
    private readonly channelParnterPrimaryPhoneOnLeadProfilePage: Locator;
    private readonly channelParnterAlternatePhoneOnLeadProfilePage: Locator;
    private readonly channelParnterEmailOnLeadProfilePage: Locator;
    private readonly channelParnterAlternateEmailOnLeadProfilePage: Locator;
    private readonly channelParnterDesignationOnLeadProfilePage: Locator;
    private readonly channelParnterPANOnLeadProfilePage: Locator;
    private readonly channelParnterProjectOnLeadProfilePage: Locator;
    private readonly enterProjectNameOnLeadProfilePage: Locator;
    private readonly projectDropdown: Locator;
    private readonly saveButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.utils = new Utils();
        this.channelParnterNameOnLeadProfile = page.locator("//div[@id='channel_partner']/parent::div//input[@name='name']");
        this.channelParnterBirthdayOnLeadProfilePage = page.locator("//div[@id='channel_partner']/parent::div//input[@name='birthday']");
        this.channelParnterAnniversaryOnLeadProfilePage = page.locator("//div[@id='channel_partner']/parent::div//input[@name='anniversary']");
        this.channelParnterReranumberOnLeadProfilePage = page.locator("input[name='rera_number']");
        this.channelParnterReravalidityOnLeadProfilePage = page.locator("//div[@id='channel_partner']/parent::div//input[@name='rera_validity']");
        this.channelParnterSalutationOnLeadProfilePage = page.locator("#channel_partner_contact_details + div span[class='select2-chosen']");
        this.channelParnterFirstNameOnLeadProfilePage = page.locator("#channel_partner_contact_details + div input[name='first_name']");
        this.channelParnterLastNameOnLeadProfilePage = page.locator("#channel_partner_contact_details + div input[name='last_name']");
        this.channelParnterPrimaryPhoneOnLeadProfilePage = page.locator("#channel_partner_contact_details + div +div input[name='cp_ph_number']");
        this.channelParnterAlternatePhoneOnLeadProfilePage = page.locator("#channel_partner_contact_details + div +div input[name='cp_alternate_ph_number']");
        this.channelParnterEmailOnLeadProfilePage = page.locator("#channel_partner_contact_details + div +div input[name='email']");
        this.channelParnterAlternateEmailOnLeadProfilePage = page.locator("#channel_partner_contact_details + div +div input[name='alternate_email']");
        this.channelParnterDesignationOnLeadProfilePage = page.locator("#channel_partner_contact_details + div +div input[name='designation']");
        this.channelParnterPANOnLeadProfilePage = page.locator("#channel_partner_contact_details + div +div input[name='pan']");
        this.channelParnterProjectOnLeadProfilePage = page.locator("#channel_partner_contact_details + div +div input[class='select2-input']");
        this.enterProjectNameOnLeadProfilePage = page.locator("#channel_partner_contact_details + div + div .select2-input");
        this.projectDropdown = page.locator("#select2-drop li");
        this.saveButton = page.locator(".save_channel_partner");
    }

    async channelPartnerNameOnLeadProfilePage(name: string) {
        await this.channelParnterNameOnLeadProfile.fill(name);
    }
    
    async channelPartnerBirthdayOnLeadProfilePage(birthday: number) {
        await this.channelParnterBirthdayOnLeadProfilePage.click();
        const datePicker = new DatePicker(this.page);
        await datePicker.selectDate(await this.utils.calculateFutureDate(AheadOf.Day, birthday, 'd MMM yyyy'));
    }
    
    async channelPartnerAnniversaryOnLeadProfilePage(anniversary: number) {
        await this.channelParnterAnniversaryOnLeadProfilePage.click();
        const datePicker = new DatePicker(this.page);
        await datePicker.selectDate(await this.utils.calculateFutureDate(AheadOf.Day, anniversary, 'd MMM yyyy'));
    }
    
    async channelPartnerReranumberOnLeadProfilePage(reranumber: string) {
        await this.channelParnterReranumberOnLeadProfilePage.fill(reranumber);
    }

    async channelPartnerReravalidityOnLeadProfilePage(reravalidity: number) {
        await this.channelParnterReravalidityOnLeadProfilePage.click();
        const datePicker = new DatePicker(this.page);
        await datePicker.selectDate(await this.utils.calculateFutureDate(AheadOf.Day, reravalidity, 'd MMM yyyy'));
    }

    async channelPartnerSalutationOnLeadProfilePage(salutation: string) {
        await this.channelParnterSalutationOnLeadProfilePage.click();
        await this.projectDropdown.filter({ hasText: salutation }).first().click();
    }
    
    async channelPartnerFirstNameOnLeadProfilePage(firstName: string) {
        await this.channelParnterFirstNameOnLeadProfilePage.fill(firstName);
    }
    
    async channelPartnerLastNameOnLeadProfilePage(lastName: string) {
        await this.channelParnterLastNameOnLeadProfilePage.fill(lastName);
    }
    
    async channelPartnerPrimaryPhoneOnLeadProfilePage(primaryPhone: string) {
        await this.channelParnterPrimaryPhoneOnLeadProfilePage.fill(" "+primaryPhone);
    }
    
    async channelPartnerAlternatePhoneOnLeadProfilePage(alternatePhone: string) {
        await this.channelParnterAlternatePhoneOnLeadProfilePage.fill(" "+alternatePhone);
    }
    
    async channelPartnerEmailOnLeadProfilePage(email: string) {
        await this.channelParnterEmailOnLeadProfilePage.fill(email);
    }
    
    async channelPartnerAlternateEmailOnLeadProfilePage(alternateEmail: string) {
        await this.channelParnterAlternateEmailOnLeadProfilePage.fill(alternateEmail);
    }

    async channelPartnerDesignationOnLeadProfilePage(designation: string) {
        await this.channelParnterDesignationOnLeadProfilePage.fill(designation);
    }

    async channelPartnerPANOnLeadProfilePage(pan: string) {
        await this.channelParnterPANOnLeadProfilePage.fill(pan);
    }

    async channelPartnerProjectOnLeadProfilePage(project: string) {
        await this.channelParnterProjectOnLeadProfilePage.click();
        await this.enterProjectNameOnLeadProfilePage.fill(project);
        await this.projectDropdown.filter({ hasText: project }).first().click();
    }

    async channelPartnerSaveOnLeadProfilePage() {
        await this.saveButton.click();
    }

}