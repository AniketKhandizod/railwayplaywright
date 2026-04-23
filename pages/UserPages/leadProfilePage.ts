  import { Page, Locator, expect } from "@playwright/test";
  import { Utils } from "../../utils/PlaywrightTestUtils.ts";

  export enum TaskType {
    All = "All",
    Open = "Open",
    Completed = "Completed"
  }

  export enum TaskDetailsOnLeadProfile {
    TaskTitle = 0,
    TaskDescription = 1,
    TaskDueDate = 2,
    TaskPriority = 3,
    TaskCompletedOn = 4,
    TaskCreator = 5,
    TaskAssigned = 6,
    TaskRemark = 8,
  }

  export class LeadProfilePage {
    private readonly page: Page;
    private readonly utils: Utils;
    private readonly newEnquiriesButton: Locator;
    private readonly editLeadButton: Locator;
    private readonly firstNameInput: Locator;
    private readonly saveButton: Locator;
    private readonly loadingSpinner: Locator;
    private readonly leadName: Locator;
    private readonly actionButtonsList: Locator;
    private readonly noteActionButton: Locator;
    private readonly callActionButton: Locator;
    private readonly emailActionButton: Locator;
    private readonly sMSActionButton: Locator;
    private readonly whatsAppActionButton: Locator;
    private readonly businessWhatsAppActionButton: Locator;
    private readonly siteVisitActionButton: Locator;
    private readonly followUpActionButton: Locator;
    private readonly offlineCallActionButton: Locator;
    private readonly loanDetailsActionButton: Locator;
    private readonly reassingActionButton: Locator;
    private readonly conductedSiteVisitActionButton: Locator;
    private readonly documentActionButton: Locator;
    private readonly mergeLeadActionButton: Locator;
    private readonly moreButton: Locator;
    private readonly activityTab: Locator;
    private readonly starred: Locator;
    private readonly notes: Locator;
    private readonly calls: Locator;
    private readonly siteVisits: Locator;
    private readonly feed: Locator;
    private readonly followUp: Locator;
    private readonly email: Locator;
    private readonly sms: Locator;
    private readonly whatsApp: Locator;
    private readonly leadMerge: Locator;
    private readonly history: Locator;
    private readonly activityList: Locator;
    private readonly leadId: Locator;
    private readonly addSecondaryAccess: Locator;
    private readonly enterSecondarySalesName: Locator;
    private readonly secondarySalesHighlighted: Locator;
    private readonly saveSecondaryAccess: Locator;
    private readonly removeSecondarySalesButton: Locator;
    private readonly salesPullButton: Locator;
    private readonly pendingTaskButton: Locator;
    private readonly addTaskButton: Locator;
    private readonly addTaskButtonList: Locator;
    private readonly sortTaskButton: Locator;
    private readonly sortTaskButtonList: Locator;
    private readonly addTaskButtonFilter: Locator;
    private readonly countTaskButton: Locator;
    private readonly taskEllipsisButton: Locator;
    private readonly taskEditOption: Locator;
    private readonly taskViewOption: Locator;
    private readonly taskActivityEllipsisButton: Locator;
    private readonly markTaskCompletedOption: Locator;
    private readonly markTaskArchivedOption: Locator;
    private readonly saveTaskComplition: Locator;
    private readonly taskTitle: Locator;
    private readonly firstNameField: Locator;
    private readonly primaryEmailField: Locator;
    private readonly projectOption: Locator;
    private readonly saveLeadButton: Locator;
    private readonly tableActionDropdown: Locator;
    private readonly gotoDetailsButton: Locator;
    private readonly scheduledDateInput: Locator;
    private readonly activeDayPicker: Locator;
    private readonly conflictMessage: Locator;
    private readonly ignoreAndScheduleButton: Locator;
    private readonly noFutureActivityCount: Locator;
    //Channel partner
    private readonly channelPartnerOnLeadProfile: Locator;
    private readonly noFutureActivityMessage: Locator;
    private readonly noFutureActivityButton: Locator;
    private readonly noFutureActivityCloseButton: Locator;
    //Missed Site Visit
    private readonly firstLeadActionDropdown: Locator;
    private readonly detailsButtonInDropdown: Locator;
    private readonly siteVisitActivityTab: Locator;
    private readonly siteVisitActionDropdown: Locator;



    constructor(page: Page) {
      this.page = page;
      this.utils = new Utils();
      this.newEnquiriesButton = page.getByText("NEW ENQUIRIES");
      this.editLeadButton = page.locator("#ion_edit_lead_profile");
      this.firstNameInput = page.getByRole("textbox", { name: "First Name" });
      this.saveButton = page.getByRole("button", { name: "Save" });
      this.loadingSpinner = page.locator(".block_ui");

      // Lead profile
      this.leadName = page.locator('.float-left > div:nth-child(2)').first();
      this.leadId = page.locator("span[name='lead_id']").first();
      this.actionButtonsList = page.locator("#lead-forms-container div[class='card '] li");
      this.tableActionDropdown = page.locator(".table-action-btn.dropdown-toggle.btn.btn-light.btn-sm");
      this.followUp = page.locator("#Followup_lead_profile");

      // Lead Actions
      this.noteActionButton = page.locator("#add_note_navigation_lead_profile");
      this.callActionButton = page.locator("#call-dropdown");
      this.emailActionButton = page.locator("#email-dropdown");
      this.sMSActionButton = page.locator("#send_sms_lead_profile");
      this.whatsAppActionButton = page.locator("#whatsapp-dropdown");
      this.businessWhatsAppActionButton = page.locator("#whatsapp-btn");
      this.siteVisitActionButton = page.locator("#lead_schedule_site_visit_lead_profile");
      this.followUpActionButton = page.locator("#lead_schedule_followup_lead_profile");
      this.offlineCallActionButton = page.locator("#offline_call_form_lead_profile");
      this.loanDetailsActionButton = page.locator(".nav-link.px-2.lead-check-loan-details");
      this.reassingActionButton = page.locator("#lead_reassign_lead_profile");
      this.conductedSiteVisitActionButton = page.locator("#lead_site_visit_lead_profile");
      this.documentActionButton = page.locator(".nav-link.px-2.lead-view-assets");
      this.mergeLeadActionButton = page.locator("#lead_merge_lead_profile");
      this.moreButton = page.locator("#activity_tabs_more_lead_profile");
      this.gotoDetailsButton = page.locator("button.dropdown-item.goto_details");

      // Lead Activity
      this.activityTab = page.locator("#tab_activity_lead_profile");
      this.starred = page.locator("#Starred_lead_profile");
      this.notes = page.locator("#Note_lead_profile");
      this.calls = page.locator("#Call_lead_profile");
      this.siteVisits = page.locator("#SiteVisit_lead_profile");
      this.feed = page.locator("#Feed_lead_profile");
      this.email = page.locator("#Email_lead_profile");
      this.sms = page.locator("#Sms_lead_profile");
      this.whatsApp = page.locator("#Whatsapp_lead_profile");
      this.leadMerge = page.locator("#MergeLeads_lead_profile");
      this.history = page.locator("#tab_activity_audit_lead_profile");

      // No future activity locators
      this.firstNameField = page.locator("div[class='col-md-5 col-sm-5 col-lg-5'] input[placeholder='First Name']");
      this.primaryEmailField = page.locator("input[placeholder='Primary Email'][name='primary_email_email']");
      this.projectOption = page.locator("li.select2-result-selectable");
      this.saveLeadButton = page.locator(".pull-right.btn.btn-primary.save.btn-sm.lead_submit");
      this.scheduledDateInput = page.locator("input[name='scheduled_date']");
      this.activeDayPicker = page.locator(".active.day");
      this.conflictMessage = page.getByText("Activities are already scheduled for following leads");
      this.ignoreAndScheduleButton = page.getByRole('button', { name: 'Ignore & Schedule' });
      this.noFutureActivityCount = page.locator("#unscheduled_leads .title-item-body-count");
      this.noFutureActivityMessage = page.getByText("No future activity");
      this.noFutureActivityButton = page.getByRole('button', { name: 'No Future Activity' });
      this.noFutureActivityCloseButton = page.getByRole('button', { name: 'Close' });
      this.activityList = page.locator(".activities_list .card-body");

      // Add secondary access
      this.addSecondaryAccess = page.locator(".add-secondary-sales");
      this.enterSecondarySalesName = page.locator(".secondary-sales input[class='select2-input select2-default']");
      this.secondarySalesHighlighted = page.locator(".select2-highlighted");
      this.saveSecondaryAccess = page.locator(".add_secondary_sales");
      this.removeSecondarySalesButton = page.locator(".secondary-sales .select2-search-choice-close").first();

      // Sales pull Button
      this.salesPullButton = page.locator(".lead_pull_to_sales");

      // Task
      this.pendingTaskButton = page.locator("span.task-completed-circle");
      this.countTaskButton = page.locator(".task-count-container");
      this.addTaskButton = page.locator(".add_todo_task");
      this.addTaskButtonFilter = page.locator(".sort_tasks_responses_label");
      this.addTaskButtonList = page.locator(".dropdown-menu.type.show a");
      // action on lead page about task
      this.taskEllipsisButton = page.locator("a.task-edit-dropdown i");
      this.taskEditOption = page.locator("a.edit_todo_task");
      this.taskViewOption = page.locator("a.details");

      // Activity on task
      this.taskActivityEllipsisButton = page.locator("[class='dropdown task_status float-left'][title='Change status'] .dropdown-toggle");
      this.markTaskCompletedOption = page.locator("[class='dropdown-item save_status'][data-value='completed']");
      this.markTaskArchivedOption = page.locator("[class='dropdown-item save_status'][data-value='archived']");
      this.saveTaskComplition = page.locator(".save_task_status");

      // get task details on lead profile page
      this.taskTitle = page.locator(".lead_todo_tasks span:nth-of-type(1)");

      // Channel partner
      this.channelPartnerOnLeadProfile = page.locator("span[class='channel_partner_text']");

      // Missed site visit
      this.firstLeadActionDropdown = page.locator('tbody.crm-leads tr td.text-right a.table-action-btn.dropdown-toggle').first();
      this.detailsButtonInDropdown = page.locator("div.dropdown.show button.dropdown-item.goto_details");
      this.siteVisitActivityTab = page.locator("#SiteVisit_lead_profile");
      this.siteVisitActionDropdown = page.locator('div.timeline-item div.pull-right.d-flex.align-items-center.justify-content-end a[data-toggle="dropdown"]').first();

    }

    async goToNewEnquiries() {
      await this.newEnquiriesButton.click();
    }

    async getLeadId(): Promise<string> {
      return await this.leadId.textContent() || "";
    }
    async clickOnBodyElement() {
      await this.page.click('body');
    }

    async openLeadById(id: string) {
      await this.loadingSpinner.waitFor({ state: "hidden" });
      await this.page
        .getByRole("cell", { name: `# ${id}` })
        .locator("div")
        .click();
    }

    async editFirstName(newName: string) {
      await this.editLeadButton.click();
      await this.firstNameInput.fill(newName);
      await this.saveButton.click();
      await this.loadingSpinner.waitFor({ state: "hidden" });
    }

    async getLeadProfile(): Promise<string> {
      return (await this.leadName.textContent() || "").trim();
    }

    async getActionButtonsList(): Promise<string[]> {
      return await this.actionButtonsList.allTextContents();
    }

    async clickOnNoteActionButton() {
      await this.noteActionButton.waitFor({ state: "visible" });
      await this.noteActionButton.click();
    }

    async clickOnFollowUpTab() {
      await this.followUp.waitFor({ state: "visible" });
      await this.followUp.click();
    }

    async clickOnCallActionButton() {
      await this.callActionButton.waitFor({ state: "visible" });
      await this.callActionButton.click();
    }

    async clickOnEmailActionButton() {
      await this.emailActionButton.waitFor({ state: "visible" });
      await this.emailActionButton.click();
    }

    async clickOnSMSActionButton() {
      await this.sMSActionButton.waitFor({ state: "visible" });
      await this.sMSActionButton.click();
    }

    async clickOnWhatsAppActionButton() {
      await this.whatsAppActionButton.waitFor({ state: "visible" });
      await this.whatsAppActionButton.click();
    }

    async clickOnBusinessWhatsAppActionButton() {
      await this.businessWhatsAppActionButton.waitFor({ state: "visible" });
      await this.businessWhatsAppActionButton.click();

    }

    async selectProjectOption() {
      await this.clickOnProjectDropdown();
      await this.page.keyboard.press('Enter');
    }

    async clickOnSiteVisitActionButton() {
      await this.siteVisitActionButton.waitFor({ state: "visible" });
      await this.siteVisitActionButton.click();
    }

    async isFollowUpActionButtonVisible(): Promise<boolean> {
      return await this.followUpActionButton.isVisible();
    }

    async clickOnFollowUpActionButton() {
      await this.followUpActionButton.waitFor({ state: "visible" });
      await this.followUpActionButton.click();
    }

    async clickOnOfflineCallActionButton() {
      await this.offlineCallActionButton.waitFor({ state: "visible" });
      await this.offlineCallActionButton.click();
    }

    async clickOnLoanDetailsActionButton() {
      await this.loanDetailsActionButton.waitFor({ state: "visible" });
      await this.loanDetailsActionButton.click();
    }

    async clickOnReassignActionButton() {
      await this.reassingActionButton.waitFor({ state: "visible" });
      await this.utils.jsClick(this.page,this.reassingActionButton);
    }

    async clickOnConductedSiteVisitActionButton() {
      await this.conductedSiteVisitActionButton.waitFor({ state: "visible" });
      await this.conductedSiteVisitActionButton.click();
    }

    async clickOnDocumentActionButton() {
      await this.documentActionButton.waitFor({ state: "visible" });
      await this.documentActionButton.click();
    }

    async clickOnMergeLeadActionButton() {
      await this.mergeLeadActionButton.waitFor({ state: "visible" });
      await this.mergeLeadActionButton.click();
    }

    async clickOnMoreButton() {
      await this.utils.waitTillFullPageLoad(this.page);
      await this.moreButton.waitFor({ state: "visible" });
      await this.utils.jsClick(this.page,this.moreButton);
    }

    async clickOnDetails() {
      await this.gotoDetailsButton.click();
    }
  // Activity Tab
    async clickOnActivityTab() {
      await this.activityTab.waitFor({ state: "visible" });
      await this.activityTab.click();
    }

    async clickOnStarredTab() {
      await this.starred.waitFor({ state: "visible" });
      await this.starred.click();
    }

    async clickOnNotesTab() {
      await this.notes.waitFor({ state: "visible" });
      await this.notes.click();
    }

    async clickOnCallsTab() {
      await this.calls.waitFor({ state: "visible" });
      await this.calls.click();
    }

    async clickOnSiteVisitsTab() {
      await this.siteVisits.waitFor({ state: "visible" });
      await this.siteVisits.click();
    }

    async clickOnFeedTab() {
      await this.feed.waitFor({ state: "visible" });
      await this.feed.click();
    }

    async clickOnEmailTab() {
      await this.email.waitFor({ state: "visible" });
      await this.email.click();
    }

    async clickOnSmsTab() {
      await this.sms.waitFor({ state: "visible" });
      await this.sms.click();
    }

    async clickOnWhatsAppTab() {
      await this.whatsApp.waitFor({ state: "visible" });
      await this.whatsApp.click();
    }

    async clickOnLeadMergeTab() {
      await this.leadMerge.waitFor({ state: "visible" });
      await this.leadMerge.click();
    }

    async clickOnHistoryTab() {
      await this.history.waitFor({ state: "visible" });
      await this.history.click();
    }

    // Activity listing
    async getActivityList() {
      return await this.activityList;
    }

    // Secondary access test
    async isSecondaryAccessPresent(isVisible: boolean) {
      await this.utils.waitTillFullPageLoad(this.page);

      expect(await this.noteActionButton.isVisible()).toBe(isVisible);
      expect(await this.callActionButton.isVisible()).toBe(isVisible);
      expect(await this.emailActionButton.isVisible()).toBe(isVisible);
      expect(await this.sMSActionButton.isVisible()).toBe(isVisible);
      expect(await this.whatsAppActionButton.isVisible()).toBe(isVisible);
      expect(await this.siteVisitActionButton.isVisible()).toBe(isVisible);
      expect(await this.followUpActionButton.isVisible()).toBe(isVisible);
      expect(await this.offlineCallActionButton.isVisible()).toBe(isVisible);
    }

    async isPullButtonVisibleForSales(isVisible: boolean) {
      await this.utils.waitTillFullPageLoad(this.page);
      expect(await this.salesPullButton.isVisible()).toBe(isVisible);
    }

    async clickOnAddSecondaryAccess() {
      await this.addSecondaryAccess.waitFor({ state: "visible" });
      await this.addSecondaryAccess.click();
    }

    async enterSecondarySales(secondarySales: string) {
      await this.enterSecondarySalesName.fill(secondarySales);
      await this.secondarySalesHighlighted.first().click();
    }

    async clickOnSaveSecondaryAccess() {
      await this.saveSecondaryAccess.waitFor({ state: "visible" });
      await this.saveSecondaryAccess.click();
    }

    async removeSecondarySales() {
      // Remove secondary sales by clicking the remove button (X) next to selected sales
      // In select2, selected items have a remove button with class select2-search-choice-close
      await this.utils.waitTillFullPageLoad(this.page);
      if (await this.removeSecondarySalesButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await this.removeSecondarySalesButton.click();
        await this.utils.waitTillFullPageLoad(this.page);
      }
      // Save the changes
      await this.clickOnSaveSecondaryAccess();
    }

    async selectTodaysDateForSchedule() {
      await this.clickOnScheduledDateInput();
      await this.clickOnActiveDayPicker();
      await this.clickOnBodyElement();
    }

    async clickOnPendingTaskButton() {
      await this.pendingTaskButton.waitFor({ state: "visible" });
      await this.pendingTaskButton.click();
    }

    async getPendingTaskCount(): Promise<string> {
      return (await this.countTaskButton.textContent() ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
    }

    async clickOnAddTaskButton() {
      await this.addTaskButton.waitFor({ state: "visible" });
      await this.addTaskButton.click();
    }

    async clickOnAddTaskButtonList(taskType: TaskType) {
      await this.addTaskButtonFilter.waitFor({ state: "visible" });
      await this.addTaskButtonFilter.click();
      await this.addTaskButtonList.filter({ hasText: taskType }).click();
    }

    async clickOnTaskEllipsisButtonAndSelectOption(option: string) {
      await this.taskEllipsisButton.waitFor({ state: "attached" });
      await this.taskEllipsisButton.waitFor({ state: "visible" }); // Replace sleep with this
      await this.taskEllipsisButton.click();
      if(option === "Edit"){
        await this.taskEditOption.waitFor({ state: "visible" }); // Add explicit wait
        await this.taskEditOption.click();
      }else if(option === "View"){
        await this.taskViewOption.waitFor({ state: "visible" }); // Add explicit wait
        await this.taskViewOption.click();
      }else{
      }
    }
    // Activity on task
    async clickOnTaskActivityEllipsisButton() {
      await this.taskActivityEllipsisButton.waitFor({ state: "visible" });
      await this.taskActivityEllipsisButton.click();
    }

    async clickOnMarkTaskCompletedOption() {
      await this.taskActivityEllipsisButton.waitFor({ state: 'visible' });
      while (!(await this.markTaskCompletedOption.isVisible())) {
        await this.taskActivityEllipsisButton.click();
        await this.page.waitForTimeout(100);
      }
      await this.markTaskCompletedOption.waitFor({ state: 'visible' });
      while (!(await this.saveTaskComplition.isVisible())) {
        await this.markTaskCompletedOption.click();
        await this.page.waitForTimeout(100);
      }
      await this.saveTaskComplition.waitFor({ state: 'visible' });
      await this.saveTaskComplition.click();
    }

    async fillFirstNameField(firstName: string) {
      await this.firstNameField.fill(firstName);
    }

    async fillPrimaryEmailField(email: string) {
      await this.primaryEmailField.fill(email);
    }

    async clickOnProjectDropdown() {
      await this.projectOption.first().click();
    }

    async clickOnSaveLeadButton() {
      await this.saveLeadButton.click();
      await this.utils.waitTillFullPageLoad(this.page);
    }

    async clickTableActionDropdown() {
      await this.tableActionDropdown.click();
    }

    async clickGotoDetails() {
      await this.gotoDetailsButton.click();
      await this.utils.waitTillFullPageLoad(this.page);
    }

    async clickOnScheduledDateInput() {
      await this.scheduledDateInput.click();
    }

    async isIgnoreAndScheduleButtonVisible(): Promise<boolean> {
      return await this.ignoreAndScheduleButton.isVisible();
    }

    async clickOnActiveDayPicker() {
      await this.activeDayPicker.click();
    }

    async getConflictMessage(): Promise<string> {
      return await this.conflictMessage.textContent() || "";
    }

    async clickOnIgnoreAndScheduleButton() {
      await this.ignoreAndScheduleButton.click();
      await this.utils.waitTillFullPageLoad(this.page);
    }

    async getNoFutureActivityCount(): Promise<string> {
      return await this.noFutureActivityCount.textContent() || "";
    }

    async clickOnMarkTaskArchivedOption() {
      await this.taskActivityEllipsisButton.waitFor({ state: 'visible' });
      while (!(await this.markTaskArchivedOption.isVisible())) {
        await this.taskActivityEllipsisButton.click();
        await this.page.waitForTimeout(100);
      }
      await this.markTaskArchivedOption.waitFor({ state: 'visible' });
      while (!(await this.saveTaskComplition.isVisible())) {
        await this.markTaskArchivedOption.click();
        await this.page.waitForTimeout(100);
      }
      await this.saveTaskComplition.waitFor({ state: 'visible' });
      await this.saveTaskComplition.click();
    }

    async getTaskDetailsOnLeadProgile(valueOf: TaskDetailsOnLeadProfile): Promise<string> {
      if(valueOf === 1){
        return (await this.taskTitle.nth(1).textContent() || "").trim().toLowerCase();
      }else if(valueOf === 2){
        return (await this.taskTitle.nth(2).textContent() || "").trim().toLowerCase();
      }else if(valueOf === 3){
        return (await this.taskTitle.nth(3).textContent() || "").trim().toLowerCase();
      }else if(valueOf === 4){
        return (await this.taskTitle.nth(4).textContent() || "").trim().toLowerCase();
      }else if(valueOf === 5){
        return (await this.taskTitle.nth(5).textContent() || "").trim().toLowerCase();
      }else if(valueOf === 6){
        return (await this.taskTitle.nth(6).textContent() || "").trim().toLowerCase();
      }else if(valueOf === 8){
        return (await this.taskTitle.nth(8).textContent() || "").trim().toLowerCase();
      }else{
        //console.log("Invalid value");
        return "";
      }

    }

    async getChannelPartnerOnLeadProfile(): Promise<string> {
      await this.channelPartnerOnLeadProfile.waitFor({ state: "visible" });
      return (await this.channelPartnerOnLeadProfile.textContent() || "").trim().toLowerCase();
    }

    async clickFirstLeadActionDropdown() {
      await this.firstLeadActionDropdown.click();
    }

    async clickDetailsButtonInDropdown() {
      await this.detailsButtonInDropdown.click();
    }

    async clickSiteVisitActivityTab() {
      await this.siteVisitActivityTab.click();
    }

    async clickSiteVisitActionDropdown() {
      await this.siteVisitActionDropdown.click();
    }

  }