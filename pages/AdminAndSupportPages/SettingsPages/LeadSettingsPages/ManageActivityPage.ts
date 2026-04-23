import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../../utils/PlaywrightTestUtils.ts";
import { properties } from "../../../../properties/v2.ts";
import { expect } from "@playwright/test";

export class ManageActivityPage {
    private readonly page: Page;
    private readonly utils: Utils;
    private readonly APIforVirtualWalkthrough: Locator;
    private readonly EnableActivityValidation: Locator;
    private readonly FollowupValidationHours: Locator;
    private readonly FollowupValidationMinutes: Locator;
    private readonly SiteVisitValidationHours: Locator;
    private readonly SiteVisitValidationMinutes: Locator;
    private readonly SiteVisitValidationEnd: Locator;
    private readonly FollowupStartDay: Locator;
    private readonly FollowupEndDay: Locator;
    private readonly SiteVisitStartDay: Locator;
    private readonly SiteVisitEndDay: Locator;
    private readonly FollowupCancellationReasons: Locator;
    private readonly PickupforSiteVisit: Locator;
    private readonly ConductSiteVisitOnline: Locator;
    private readonly AutoConductOnlineSiteVisit: Locator;
    private readonly EnterPickupLocations: Locator;
    private readonly SelectPickupLocation: Locator;
    private readonly SaveChangesButton: Locator;

constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();
    this.APIforVirtualWalkthrough = page.locator("#client_configuration_api_key_for_vr");
    this.EnableActivityValidation = page.locator("#client_configuration_activity_calender_time_attributes_active");
    this.FollowupValidationHours = page.locator("[name='client_configuration[activity_calender_time][followup_hours]']");
    this.FollowupValidationMinutes = page.locator("[name='client_configuration[activity_calender_time][followup_minutes]']");
    this.SiteVisitValidationHours = page.locator("select[name$='t_hours]']");
    this.SiteVisitValidationMinutes = page.locator("select[name$='t_minutes]']");
    this.FollowupStartDay = page.locator("[name='client_configuration[followup_configuration][start]']");
    this.FollowupEndDay = page.locator("[name='client_configuration[followup_configuration][end]']");
    this.SiteVisitStartDay = page.locator("[name='client_configuration[site_visit_configuration][start]']");
    this.SiteVisitEndDay = page.locator("[name='client_configuration[site_visit_configuration][end]']");
    this.PickupforSiteVisit = page.locator("#client_configuration_pickup");
    this.AutoConductOnlineSiteVisit = page.locator("#client_configuration_auto_conduct_online_meeting");
    this.EnterPickupLocations = page.getByRole('textbox' , {name: 'Enter pickup location'});
    this.SelectPickupLocation = page.locator('.select2-result-label');
    this.SaveChangesButton = page.getByRole('button', { name: 'Save' });
}
    async clickOnAPIforVirtualWalkthrough() {
        await this.APIforVirtualWalkthrough.fill(properties.APIforVirtualWalkthrough);
    }
    async clickOnEnableActivityValidation() {
        if(await this.EnableActivityValidation.isChecked()) {
            return;   
        }
        else{
            await this.EnableActivityValidation.check(); //check / uncheck
        }
    }
    async SelectSiteVisitValidationTime(hours: string, minutes: string) {
        await this.SiteVisitValidationHours.click();
        await this.SiteVisitValidationHours.selectOption(hours);
        await this.SiteVisitValidationMinutes.click();
        await this.SiteVisitValidationMinutes.selectOption(minutes);
    }
    async SelectStartAndEndDaySiteVisit(start: string, end: string) {
        await this.SiteVisitStartDay.fill(start);
        await this.SiteVisitEndDay.fill(end);
    }
    async SaveSiteVisitValidation() {
        await this.SaveChangesButton.click();
    }
}