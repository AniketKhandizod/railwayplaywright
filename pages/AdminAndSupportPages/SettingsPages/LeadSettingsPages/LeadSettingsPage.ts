import { Page, Locator } from "@playwright/test";

export class LeadSettingsPage {
    private readonly page: Page;
    private readonly ManageActivitySettings: Locator;
    private readonly CustomizeYourLeadForm: Locator;
    private readonly ManageLeadAccessControl: Locator;
    private readonly LeadNotifications: Locator;
    private readonly SiteVisitDuration: Locator;
    private readonly CustomizeYourBookingForm: Locator;
    private readonly ManagePipelineStages: Locator;
    private readonly ManageBookingCancellationReasons: Locator;
    private readonly ManageInterestedPropertyStages: Locator;
    private readonly ManageBedroomTypes: Locator;

    constructor(page: Page) {
        this.page = page;
        this.ManageActivitySettings = page.locator("[ubts='Manage Activity Settings'] p");
        this.CustomizeYourLeadForm = page.locator("[ubts='Customize Your Lead Form'] p");
        this.ManageLeadAccessControl = page.locator("[ubts='Manage Lead Access Control'] p");
        this.LeadNotifications = page.locator("[ubts='Lead Notifications'] p");
        this.SiteVisitDuration = page.locator("[ubts='Site Visit Duration'] p");
        this.CustomizeYourBookingForm = page.locator("[ubts='Customize Your Booking Form'] p");
        this.ManagePipelineStages = page.locator("[ubts='Manage Pipeline Stages'] p");
        this.ManageBookingCancellationReasons = page.locator("[ubts='Manage Booking Cancellation Reasons'] p");
        this.ManageInterestedPropertyStages = page.locator("[ubts='Manage Interested Property Stages'] p");
        this.ManageBedroomTypes = page.locator("[ubts='Bedroom Types'] p");
    }

    async clickOnManageActivitySettings() {
        await this.ManageActivitySettings.click();
    }

    async clickOnCustomizeYourLeadForm() {
        await this.CustomizeYourLeadForm.click();
    }

}