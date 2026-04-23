import { Page, Locator } from "@playwright/test";
import { Utils, AheadOf } from "../../../utils/PlaywrightTestUtils.ts";
import { DatePicker } from "../DatePicker.ts";
import { properties } from "../../../properties/v2.ts";

export enum SiteVisitType {
    Visit = "Visit",
    HomeVisit = "Home Visit",
    OnlineMeeting = "Online Meeting"
}
export class SiteVisitPage {

    private readonly page: Page;
    private readonly utils: Utils;
    private readonly SiteVisitButton: Locator;
    private readonly SelectProjectDropdown: Locator;
    private readonly SelectProject: Locator;
    private readonly SiteVisitTypeDropdown: Locator;
    private readonly SiteVisitType: Locator;
    private readonly ScheduledActivity: Locator;
    private readonly IgnoreActivity: Locator;
    private readonly TentativeActivityChange: Locator;
    private readonly TentativeActivitySelect: Locator;
    private readonly SiteVisitUploadAttachmentButton: Locator;
    private readonly SVUploadDialog: Locator;
    private readonly SelectFolder: Locator;
    private readonly HoverOnFile: Locator;
    private readonly SelectFile: Locator;
    private readonly SaveChangesButton: Locator;
    private readonly ScheduleSiteVisit: Locator;
    private readonly SiteVisitCreated: Locator;
    private readonly SiteVisitTab: Locator;
    private readonly SiteVisitCard: Locator;
    private readonly SiteVisitOptions: Locator;
    private readonly RescheduleSiteVisit: Locator;
    private readonly SVScheduleDatePicker: Locator;
    private readonly SVScheduleTimePicker: Locator;
    private readonly SVEndDatePicker: Locator;
    private readonly SVEndTimePicker: Locator;
    private readonly startTimeInput: Locator;
    private readonly endTimeInput: Locator;
    private readonly SVRescheduleButton: Locator;
    private readonly ConfirmSiteVisitButton: Locator;
    private readonly ConfirmSiteVisitOption: Locator;
    private readonly SVAddInviteeOption: Locator;
    private readonly SVAddInviteeFormCheck: Locator;
    private readonly SVAddInviteeSelectTeam: Locator;
    private readonly SVAddInviteeEnterTeamName: Locator;
    private readonly SVAddInviteeSalesDropdown: Locator;
    private readonly SVAddInviteeSelectSales: Locator;
    private readonly SVAddInviteeSaveButton: Locator;
    private readonly SearchLeadId: Locator;
    private readonly SearchButton: Locator;
    private readonly SecondarySalesCheck: Locator;
    private readonly SecondarySales: Locator;
    private readonly MarkDidNotVisitOption: Locator;
    private readonly DidNotVisitButton: Locator;
    private readonly MarkNotInterestedOption: Locator;
    private readonly MarkNotInterestedButton: Locator;
    private readonly MarkConductedOption: Locator;
    private readonly MarkConductedButton: Locator;
    private readonly SiteVisitDurationValidation: Locator;
    private readonly DatePicker: DatePicker;
    private readonly SiteVisitCloseButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.utils = new Utils();
        this.SiteVisitButton = page.locator('#lead_schedule_site_visit_lead_profile');
        this.SelectProjectDropdown = page.getByRole('link', { name: 'Select Project' });
        this.SelectProject = page.locator('#select2-drop');
        this.SiteVisitTypeDropdown = page.locator("//label[contains(text(), 'Site visit type')]/following::div[contains(@class,'select2-container')][1]");
        this.SiteVisitType = page.locator('.select2-result-label');
        this.ScheduledActivity = page.getByRole('heading', { name: 'Scheduled activities' });
        this.IgnoreActivity = page.getByRole('button', { name: 'Ignore & Schedule' });
        this.TentativeActivityChange = page.getByRole('link', { name: 'Confirmed' });
        this.TentativeActivitySelect = page.getByText('Tentative', { exact: true });
        this.SiteVisitUploadAttachmentButton = page.getByRole('link', { name: 'Upload attachments' });
        this.SVUploadDialog = page.locator('h5.modal-title').getByText('Assets', { exact: true });
        this.SelectFolder = page.getByRole('link', { name: 'Documents' });
        this.HoverOnFile = page.locator('.asset').nth(1);
        this.SelectFile = page.locator('.asset-select').nth(1);
        this.SaveChangesButton = page.getByRole('button', { name: 'Save changes' });
        this.ScheduleSiteVisit = page.getByRole('button', { name: 'Schedule Site visit' });
        this.SiteVisitCreated = page.getByText('Site visit for Visit scheduled successfully');
        this.SiteVisitTab = page.getByRole('tab', { name: 'Site visit', exact: true });
        this.SiteVisitCard = page.locator('.timeline-item', { hasText: 'The Site visit is scheduled' });
        this.SiteVisitOptions = this.SiteVisitCard.locator('[data-toggle="dropdown"]');
        this.RescheduleSiteVisit = page.getByRole('link', { name: 'Reschedule' });
        this.SVScheduleDatePicker = page.locator('.scheduled_on [name="scheduled_date"]');
        this.SVScheduleTimePicker = page.locator('.scheduled_on [name=scheduled_time]');
        this.SVEndDatePicker = page.locator('.ends_on [name="ends_on_date"]');
        this.SVEndTimePicker = page.locator('.ends_on [name="ends_on_time"]');
        this.startTimeInput = page.locator('.scheduled_on [name="scheduled_time"]');
        this.endTimeInput = page.locator('.ends_on [name="ends_on_time"]');
        this.SVRescheduleButton = page.getByRole('button', { name: 'Reschedule' });
        this.ConfirmSiteVisitButton = page.getByRole('link', { name: 'Confirm' });
        this.ConfirmSiteVisitOption = page.getByRole('button', { name: 'Confirm' });
        this.SVAddInviteeOption = page.getByRole('link', { name: 'Add available invitee' });
        this.SVAddInviteeFormCheck = page.getByText('Site visit - Add invitee');
        this.SVAddInviteeSelectTeam = page.getByRole('link', { name: 'Select team' });
        this.SVAddInviteeEnterTeamName = page.locator('#select2-drop').getByRole('textbox');
        this.SVAddInviteeSalesDropdown = page.getByRole('link', { name: 'Select an invitee' })
        this.SVAddInviteeSelectSales = page.locator('.select2-result-label')
        this.SVAddInviteeSaveButton = page.getByRole('button', { name: 'Add Invitee' });
        this.SearchLeadId = page.locator('[name="search_string"]');
        this.SearchButton = page.locator('.search-button');
        this.SecondarySalesCheck = page.getByText('Secondary sales :');
        this.SecondarySales = page.locator('#secondary_sale_ids')
        this.MarkDidNotVisitOption = page.getByRole('link', { name: 'Mark did not visit' });
        this.DidNotVisitButton = page.getByRole('button', { name: 'Did not visit' });
        this.MarkNotInterestedOption = page.getByRole('link', { name: 'Mark not interested' });
        this.MarkNotInterestedButton = page.getByRole('button', { name: 'Mark not interested' });
        this.MarkConductedOption = page.getByRole('link', { name: 'Mark as conducted' });
        this.MarkConductedButton = page.getByRole('button', { name: 'Save' });
        this.SiteVisitDurationValidation = page.getByText('Site visit duration must be atleast');
        this.DatePicker = new DatePicker(page);
        this.SiteVisitCloseButton = page.locator('.close_site_visit');
    }

    async SiteVisitButtonClick() {
        await this.SiteVisitButton.click();
    }
    async SelectProjectClick() {
        await this.SelectProjectDropdown.click();
        await this.SelectProject.nth(0).click();
    }
    async SiteVisitTypeClick(siteVisitType: SiteVisitType) {
        await this.SiteVisitTypeDropdown.click();
        await this.SiteVisitType.getByText(siteVisitType, { exact: true }).click();
    }
    async SiteVisitUploadAttachment() {
        await this.SiteVisitUploadAttachmentButton.click();
        await this.SVUploadDialog.waitFor({ state: 'visible' });
        await this.SelectFolder.click();
        await this.HoverOnFile.hover();
        await this.SelectFile.click();
        await this.SaveChangesButton.click();
    }
    async ScheduleSiteVisitClick() {
        await this.ScheduleSiteVisit.click();
    }
    async ScheduledActivityIgnoreClick() {
        if (await this.ScheduledActivity.isVisible()) {
            await this.IgnoreActivity.click();
        }
    }
    async SiteVisitCreatedCheck() {
        await this.SiteVisitCreated.isVisible();
    }
    async SiteVisitTabClick() {
        await this.SiteVisitTab.click();
    }
    async SiteVisitCardCheck() {
        return await this.SiteVisitCard.first().isVisible();
    }
    async TentativeActivityChangeClick() {
        await this.TentativeActivityChange.click();
        await this.TentativeActivitySelect.click();
    }
    async SiteVisitOptionsClick() {
        await this.SiteVisitOptions.first().click();
    }
    async RescheduleSiteVisitClick() {
        if (await this.RescheduleSiteVisit.isVisible()) {
            await this.RescheduleSiteVisit.click();
        }
        else {
            await this.utils.waitUntilDurationPassed(2000);
            await this.SiteVisitOptions.first().click();
            await this.RescheduleSiteVisit.click();
        }
        await this.utils.waitUntilDurationPassed(2000);
    }
    async SVDatePickerClick() {
        await this.SVScheduleDatePicker.click();
    }
    async SelectNextDate() {
        await this.SVScheduleDatePicker.click();
        const datePicker = new DatePicker(this.page);
        const nextDate = await this.utils.calculateFutureDate(AheadOf.Day, 1, 'd LLL yyyy');
        await datePicker.selectDate(nextDate);
    }
    async SVRescheduleClick() {
        await this.SVRescheduleButton.click();
    }
    async ConfirmSiteVisitClick() {
        await this.ConfirmSiteVisitButton.click();
        await this.ConfirmSiteVisitOption.click();
    }

    async SiteVisitAddInviteeClick(): Promise<string> {
        if (await this.SVAddInviteeOption.isVisible()) {
            await this.SVAddInviteeOption.click();
        }
        else {
            await this.page.reload({ waitUntil: 'networkidle' });
            await this.SiteVisitOptions.first().click();
            await this.SVAddInviteeOption.click();
        }
        await this.SVAddInviteeFormCheck.waitFor({ state: 'visible' });
        await this.SVAddInviteeSelectTeam.click();
        await this.SVAddInviteeEnterTeamName.fill(properties.SV_Invitee_team);
        await this.page.getByText(properties.SV_Invitee_team + ' (active)').click();
        await this.SVAddInviteeSalesDropdown.click();
        const SalesName = (await this.SVAddInviteeSelectSales.textContent())?.replace(/\s*\(.*?\)$/, "");
        await this.SVAddInviteeSelectSales.click();
        await this.SVAddInviteeSaveButton.click();
        return SalesName ?? '';
    }
    async SiteVisitAddedInviteeCheck(leadId: string): Promise<string> {
        await this.SearchLeadId.fill("#" + leadId);
        await this.SearchButton.click();
        await this.SecondarySalesCheck.waitFor({ state: 'visible' });
        const rawHTML = await this.SecondarySales.innerHTML();
        const secondarysalesArray = rawHTML
            .replace(/<br\s*\/?>/gi, '\n')
            .split('\n')
            .map(s => s.replace(/^\d+\s*:\s*/, '').trim())
            .filter(Boolean);
        return secondarysalesArray[0] ?? '';
    }
    async MarkDidNotVisit() {
        if (await this.MarkDidNotVisitOption.isVisible()) {
            await this.MarkDidNotVisitOption.click();
        }
        else {
            await this.page.reload({ waitUntil: 'networkidle' });
            await this.SiteVisitOptions.first().click();
            await this.MarkDidNotVisitOption.click();
        }
        await this.DidNotVisitButton.click();
    }
    async MarkNotInterested() {
        if (await this.MarkNotInterestedOption.isVisible()) {
            await this.MarkNotInterestedOption.click();
        }
        else {
            await this.page.reload({ waitUntil: 'networkidle' });
            await this.SiteVisitOptions.first().click();
            await this.MarkNotInterestedOption.click();
        }
        await this.MarkNotInterestedButton.click();
    }
    async MarkConducted() {
        if (await this.MarkConductedOption.isVisible()) {
            await this.MarkConductedOption.click();
        }
        else {
            await this.page.reload({ waitUntil: 'networkidle' });
            await this.SiteVisitOptions.first().click();
            await this.MarkConductedOption.click();
        }
    }
    async MarkConductedButtonClick() {
        await this.MarkConductedButton.click();
    }

    // Method to schedule site visit with custom start and end times
    async EnterSiteVisitCustomTime(startTime: string, endTime: string) {
        // Set start and end times
        await this.startTimeInput.click();
        await this.DatePicker.selectTime(startTime);
        await this.endTimeInput.click();
        await this.DatePicker.selectTime(endTime);
        return [startTime, endTime];
    }

    async EnterSiteVisitCustomDate(startDate: string, endDate: string) {
        await this.SVScheduleDatePicker.click();
        await this.DatePicker.selectDate(startDate)
        await this.SVEndDatePicker.click();
        await this.DatePicker.selectDate(endDate);
        return [startDate, endDate];

    }

    async SVTimePickerGetTime(): Promise<number> {
        const startTimeText = await this.SVScheduleTimePicker.getAttribute('data-default-time');
        const endTimeText = await this.SVEndTimePicker.getAttribute('data-default-time');
        
        // Use the utility method to calculate time difference
        return await this.utils.calculateTimeDifferenceSafely(startTimeText, endTimeText);
    }

    // Method to get the count of site visits
    async getSiteVisitCount(): Promise<number> {
        return await this.SiteVisitCard.count() ?? 0;
    }

    // Method to check if validation error is visible
    async isValidationErrorVisible(): Promise<boolean> {
        const validationError = this.SiteVisitDurationValidation;
        return await validationError.isVisible();
    }

    async SiteVisitCloseButtonClick() {
        await this.SiteVisitCloseButton.click();
    }
}