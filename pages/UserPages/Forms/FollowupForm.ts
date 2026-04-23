import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils.ts";

export class addFollowUpForm {

    private readonly page: Page;
    private readonly followUpProjectButton: Locator;
    private readonly closeButton: Locator;
    private readonly scheduleFollowUpButton: Locator;
    private readonly scheduleFollowUpDateButton: Locator;
    private readonly scheduleFollowUpTimeButton: Locator;
    private readonly followUpTypeButton: Locator;
    private readonly followUpTypeList: Locator;
    private readonly subjectField: Locator;
    private readonly agendaField: Locator;
    private readonly ignoreAndScheduleFollowUpButton: Locator;
    private readonly cancellationReasonDropdown: Locator;
    private readonly addNewFollowupButton: Locator;
    private readonly cancelAndScheduleButton: Locator;
    private readonly cancellationMessageText: Locator;
    private readonly followupStatus: Locator;
    private readonly dropdownOption: Locator;

    constructor(page: Page) {
        this.page = page;
        this.followUpProjectButton = page.locator("div.select2-container.form-control.followup_project_id");
        this.closeButton = page.locator("button.close.text-white.lead-index.close_followup");
        this.scheduleFollowUpButton = page.locator("#schedule_followup_btn");
        this.scheduleFollowUpDateButton = page.locator("input[name='scheduled_date']");
        this.scheduleFollowUpTimeButton = page.locator("input[name='scheduled_time']");

        // Follow Up type
        this.followUpTypeButton = page.locator(".form-group.followup_type div[class='select2-container form-control']");
        this.followUpTypeList = page.locator("#select2-drop li");

        // Subject
        this.subjectField = page.locator("input[name='subject']");

        // Agenda
        this.agendaField = page.locator("textarea[name='agenda']");

        //ignore and schedule follow up
        this.ignoreAndScheduleFollowUpButton = page.locator("#btn-ignore-schedule");
        this.cancellationReasonDropdown = page.locator("div.select2-container.cancellation_reason a.select2-choice");
        this.addNewFollowupButton = page.locator("a[data-toggle='collapse'][href='#date_range_show']");
        this.cancelAndScheduleButton = page.locator("button[type='submit']");
        this.cancellationMessageText = page.locator("text=This will cancel the current follow up");
        this.followupStatus = page.locator("span.float-right.small.text-muted");
        this.dropdownOption = page.locator("#select2-drop .select2-results li.select2-result-selectable");
    }

    async isProjectDropdownVisible() {
        return await this.followUpProjectButton.isVisible();
    }

    async clickOnCloseButton() {
        while(await this.closeButton.isVisible()){
            await this.closeButton.click({ force: true });
        }
    }

    async waitUntilScheduleFollowUpButtonVisible() {
        return await this.scheduleFollowUpButton.waitFor({ state: "visible" });
    }

    async navigateViaUrl(){
        const url = await this.page.url();
        const newUrl = url.split("/f/")[0]+"/f/AddNote";
        await this.page.goto(newUrl);
    }

    async clickOnScheduleFollowUpDateButton() {
        await this.scheduleFollowUpDateButton.waitFor({ state: "visible" });
        await this.scheduleFollowUpDateButton.click();
    }

    async clickOnScheduleFollowUpTimeButton() {
        await this.scheduleFollowUpTimeButton.waitFor({ state: "visible" });
        await this.scheduleFollowUpTimeButton.click();
    }

    async clickOnScheduleFollowUpButton(utils: Utils) {
        await this.scheduleFollowUpButton.click();
        await utils.waitTillFullPageLoad(this.page);
        await utils.waitUntilDurationPassed(3000);
        if(await this.ignoreAndScheduleFollowUpButton.isVisible()){
            await this.ignoreAndScheduleFollowUpButton.click();
        }
    }

    async selectFollowUpType(type: string) {
        await this.followUpTypeButton.click();
        await this.followUpTypeList.filter({ hasText: type }).first().click();
    }

    async selectFollowUpProject(project: string) {
        await this.followUpProjectButton.click();
        await this.followUpTypeList.filter({ hasText: project }).first().click();
    }

    async fillSubject(subject: string) {
        await this.subjectField.fill(subject);
    }

    async fillAgenda(agenda: string) {
        await this.agendaField.fill(agenda);
    }

    async clickOnCancellationReasonDropdown() {
        await this.cancellationReasonDropdown.click();
    }

    async selectFirstCancellationReason() {
        await this.cancellationReasonDropdown.click();
        const firstOption = this.dropdownOption.first();
        await firstOption.waitFor({ state: "visible" });
        await firstOption.click();

    }

    async clickOnAddNewFollowupButton() {
        await this.addNewFollowupButton.click();
    }

    async clickOnCancelAndScheduleButton() {
        await this.cancelAndScheduleButton.click();
    }

    async getCancellationMessageText() {
        return await this.cancellationMessageText.textContent();
    }

    async isCancellationMessageVisible() {
        return await this.cancellationMessageText.isVisible();
    }

    async getFollowupStatus() {
        return await this.followupStatus.textContent();
    }
}