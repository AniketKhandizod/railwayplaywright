import { Page, Locator, expect } from '@playwright/test';
import { Utils } from '../../../utils/PlaywrightTestUtils.ts';

export class WorkFlowListPage {
        private readonly page: Page;
        private readonly rowNumOfWorkFlows: number = 0;
      
        private readonly clickOnFilter: Locator;
        private readonly clickOnClearAll: Locator;
        private readonly clickOnApply: Locator;
        private readonly ClickOnSelectWFStatus: Locator;
        private readonly SelectWFStatus: Locator;
        private readonly clickOnActivateButton: Locator;
        private readonly SearchWorkflow: Locator;
      
        private readonly clickOnActionButton: Locator;
        private readonly clickOnActionButton_Details: Locator;
        private readonly clickOnActionButton_Edit: Locator;
        private readonly clickOnActionButton_Active: Locator;
        private readonly clickOnActionButton_Inactive: Locator;
      
        private readonly WorkflowList: Locator;
        private readonly clickOnCreateNewWF: Locator;
        private readonly EnterWorkflowTitle: Locator;
        private readonly EnterDescription: Locator;
        private readonly clickOnSelectGroup: Locator;
        private readonly EnterSelectGroup: Locator;
        private readonly OnGetStarted: Locator;
        private readonly clickOnCancle: Locator;
        private readonly enterTextInWFEvent: Locator;
        private readonly getEventList: Locator;
        private readonly getAllChooseButton: Locator;
        private readonly removeStatus: Locator;
        private readonly CurrentStatusOfWF: Locator;
        private readonly FirstListingArray: Locator;
      
        constructor(page: Page) {
          this.page = page;
          this.clickOnFilter = page.locator("button[class='btn btn-light btn-icon toggle-filters']");
          this.clickOnClearAll = page.locator("//a[text()='Clear All']");
          this.clickOnApply = page.locator("//input[@class='btn btn-primary btn-sm']");
          this.ClickOnSelectWFStatus = page.locator("#s2id_search_params_is_active");
          this.SelectWFStatus = page.locator("//div[@class='select2-result-label']");
          this.clickOnActivateButton = page.locator("//div[@class='dropdown-menu dropdown-menu-right show'] //button");
          this.SearchWorkflow = page.locator("#search_params_name");
      
          this.clickOnActionButton = page.locator(".fa-ellipsis-v");
          this.clickOnActionButton_Details = page.locator("//a[@title='Details']");
          this.clickOnActionButton_Edit = page.locator("//a[@title='Edit']");
          this.clickOnActionButton_Active = page.locator("//button[@class='dropdown-item toggle_active text-success']");
          this.clickOnActionButton_Inactive = page.locator("//button[@class='dropdown-item toggle_active text-danger']");
      
          this.WorkflowList = page.locator("//table[@class='table table-responsive']//td[1]");
          this.clickOnCreateNewWF = page.locator("div>a[class='btn btn-primary']");
          this.EnterWorkflowTitle = page.locator("input[placeholder='Workflow title']");
          this.EnterDescription = page.locator("textarea[name='description']");
          this.clickOnSelectGroup = page.locator("//span[text()='Add workflow in a group']");
          this.EnterSelectGroup = page.locator("#select2-drop input");
          this.OnGetStarted = page.locator("text=Get Started");
          this.clickOnCancle = page.locator("text=Cancel");
          this.enterTextInWFEvent = page.locator("input[name='local-search']");
          this.getEventList = page.locator("//table[@class='table table-hover']//tr[@class='event-row']/td[2]");
          this.getAllChooseButton = page.locator("//button[@class='btn btn-primary btn-xs btn-event']");
          this.removeStatus = page.locator("#s2id_search_params_is_active .select2-search-choice-close");
          this.CurrentStatusOfWF = page.locator("td[class^='text-']");

          // Listing Element
          this.FirstListingArray = page.locator("table.table.table-responsive td");
        }
      
        // get listing elements text
        async getWorkflowTitle(): Promise<string> {
          const text = await this.FirstListingArray.nth(0).textContent();
          return text ?? ''; // Handle potential null by returning empty string
        }

        async getWorkflowDescription(): Promise<string> {
          const text = await this.FirstListingArray.nth(1).textContent();
          return text ?? ''; // Handle potential null by returning empty string
        }

        async getWorkflowTriggerEvent(): Promise<string> {
          const text = await this.FirstListingArray.nth(2).textContent();
          return text ?? ''; // Handle potential null by returning empty string
        }

        async getWorkflowTriggerCount(): Promise<string> {
          const text = await this.FirstListingArray.nth(3).textContent();
          return text ?? ''; // Handle potential null by returning empty string
        }

        async getWorkflowStatus(): Promise<string> {
          const text = await this.FirstListingArray.nth(4).textContent();
          return text ?? ''; // Handle potential null by returning empty string
        }

        async clearFilter() {
          await this.clickOnFilter.click();
          await this.clickOnClearAll.click();
        }
      
        async getCurrentStatusOfWF(): Promise<string> {
          return (await this.CurrentStatusOfWF.first().innerText()).trim();
        }
      
        async clearStatusOnly() {
          await this.removeStatus.click();
        }
      
        async clickOnFilterIcon() {
          await this.clickOnFilter.click();
        }
      
        async Activate_OR_Deactivate_WorkFlow(name: string) {
          await this.page.locator(`//td[text()='${name}']/parent::tr//a[@id='btn-drip-actions']`).click();
          await this.clickOnActivateButton.click();
        }
      
        async displayAllActiveWF() {
          await this.clickOnFilter.click();
          await this.SearchWorkflow.fill('');
          await this.ClickOnSelectWFStatus.click();
          await this.SelectWFStatus.filter({ hasText: 'Active' }).first().click();
          await this.clickOnApply.click();
        }
      
        async displayAllInactiveWF() {
          await this.clickOnFilter.click();
          await this.SearchWorkflow.fill('');
          await this.ClickOnSelectWFStatus.click();
          await this.SelectWFStatus.filter({ hasText: 'Inactive' }).first().click();
          await this.clickOnApply.click();
        }
      
        async SearchWorkFlow(name: string) {
          await this.SearchWorkflow.fill(name);
        }
      
        async clickOnApplyFilterButton() {
          await this.clickOnApply.click();
        }
      
        async Details_Action_WorkFlow() {
          await this.clickOnActionButton.nth(this.rowNumOfWorkFlows).click();
          await this.clickOnActionButton_Details.nth(this.rowNumOfWorkFlows).click();
        }
      
        async Edit_Action_WorkFlow() {
          await this.clickOnActionButton.nth(this.rowNumOfWorkFlows).click();
          await this.clickOnActionButton_Edit.nth(this.rowNumOfWorkFlows).click();
        }
      
        async Activate_Action_WorkFlow() {
          await this.clickOnActionButton.nth(this.rowNumOfWorkFlows).click();
          await this.clickOnActionButton_Active.nth(this.rowNumOfWorkFlows).click();
          await new Utils().waitTillFullPageLoad(this.page);
          expect(await this.getCurrentStatusOfWF()).toBe('Active');
        }
      
        async Deactivate_Action_WorkFlow() {
          await this.clickOnActionButton.nth(this.rowNumOfWorkFlows).click();
          await this.clickOnActionButton_Inactive.nth(this.rowNumOfWorkFlows).click();
        }
      
        async Details_Action_WorkFlow_ByName(name: string) {
          await this.page.locator(`(//td[text()='${name}'])[1]/parent::tr//a[@id='btn-drip-actions']`).click();
          await this.clickOnActionButton_Details.nth(this.rowNumOfWorkFlows).click();
        }
      
        async Edit_Action_WorkFlow_ByName(name: string) {
          await this.page.locator(`(//td[text()='${name}'])[1]/parent::tr//a[@id='btn-drip-actions']`).click();
          await this.clickOnActionButton_Edit.nth(this.rowNumOfWorkFlows).click();
        }
      
        async Activate_Action_WorkFlow_ByName(name: string) {
          await this.page.locator(`(//td[text()='${name}'])[1]/parent::tr//a[@id='btn-drip-actions']`).click();
          await this.clickOnActionButton_Active.nth(this.rowNumOfWorkFlows).click();
        }
      
        async Deactivate_Action_WorkFlow_ByName(name: string) {
          await this.page.locator(`(//td[text()='${name}'])[1]/parent::tr//a[@id='btn-drip-actions']`).click();
          await this.clickOnActionButton_Inactive.nth(this.rowNumOfWorkFlows).click();
        }
      
        async WorkFlowStatus(name: string): Promise<string> {
          return await this.page
            .locator(`(//td[text()='${name}'])[1]/following-sibling::td[4]`)
            .innerText();
        }
      
        async RandomWorkflowNameFromList(): Promise<string> {
          const count = await this.WorkflowList.count();
          const randomIndex = Math.floor(Math.random() * count);
          return (await this.WorkflowList.nth(randomIndex).innerText()).trim();
        }
      
        async FirstWorkflowNameFromList(): Promise<string> {
          return (await this.WorkflowList.first().innerText()).trim();
        }
      
        async clickOnNewWorkflowButton() {
          await this.clickOnCreateNewWF.click();
        }
      
        async enterWFName(name: string) {
          await this.EnterWorkflowTitle.fill(name);
        }
      
        async enterWFDescription(description: string) {
          await this.EnterDescription.fill(description);
        }
      
        async clickOnGetStarted() {
          await this.OnGetStarted.click();
        }
      
        async SearchWorflowEvent(text: string) {
          await this.enterTextInWFEvent.fill(text);
        }
      
        async getAllEventName(): Promise<string[]> {
          await this.page.waitForTimeout(1000);
          const count = await this.getEventList.count();
          const names: string[] = [];
          for (let i = 0; i < count; i++) {
            names.push((await this.getEventList.nth(i).innerText()).trim());
          }
          return names;
        }
      
        async getAllChooseButtonAndClick(event: WorkFlowEvents) {
          await this.getAllChooseButton.nth(event).click();
        }   
    }

// WorkFlowConditions
export enum WorkFlowConditions {
    Lead = "Lead",
    New_lead = "New lead",
    Touched = "Touched",
    Last_followup_status = "Last followup status",
    Last_followup_date = "Last followup date",
    Site_visit_status = "Site visit status",
    Followup_status = "Followup status",
    Last_incoming_call_status = "Last incoming call status",
    Last_outgoing_call_status = "Last outgoing call status",
    Latest_Activity_Scheduled_On = "Latest Activity Scheduled On",
    No_Future_Activity_On_Lead = "No Future Activity On Lead",
    Latest_Followup_Scheduled_On = "Latest Followup Scheduled On",
    Latest_Site_visit_Scheduled_On = "Latest Site visit Scheduled On",
    Last_contacted_by_Lead = "Last contacted by Lead",
    Last_Contact_attempted_by_Lead = "Last Contact attempted by Lead",
    Last_Contact_by_Sales = "Last Contact by Sales",
    Last_Contact_attempted_by_Sales = "Last Contact attempted by Sales",
    Last_Stage_Changed_On = "Last Stage Changed On",
    Last_Contact = "Last Contact",
    Last_acted_on = "Last acted on",
    Incoming_calls_Total = "Incoming calls (Total)",
    Outgoing_calls_Total = "Outgoing calls (Total)",
    Total_Answered_calls = "Total Answered calls",
    Total_Not_Answered_calls = "Total Not-Answered calls",
    Incoming_calls_Answered = "Incoming calls (Answered)",
    Incoming_calls_Not_Answered = "Incoming calls (Not-Answered)",
    Outgoing_calls_Answered = "Outgoing calls (Answered)",
    Outgoing_calls_Not_Answered = "Outgoing calls (Not-Answered)",
    Incoming_calls_Duration = "Incoming calls (Duration)",
    Outgoing_calls_Duration = "Outgoing calls (Duration)",
    Total_calls_Duration = "Total calls (Duration)",
    Quality = "Quality",
    Brochure_sent = "Brochure sent",
    Price_quote_sent = "Price quote sent",
    Currently_in = "Currently in",
    Min_budget = "Min budget",
    Max_budget = "Max budget",
    Min_possession = "Min possession",
    Max_possession = "Max possession",
    Location_preference = "Location preference",
    Property_type_preference = "Property type preference",
    BHK = "BHK",
    Transaction_type = "Transaction type",
    Interested_in_resale = "Interested in resale",
    Property_Purpose = "Property Purpose",
    Furnishing = "Furnishing",
    Facing = "Facing",
    Bathrooms = "Bathrooms",
    Funding_source = "Funding source",
    Developer = "Developer",
    Lead_Phone_Number_Verified = "Lead Phone Number Verified",
    Pending_incoming_mail = "Pending incoming mail",
    Pending_Incoming_Whatsapp_Messages_since_24_hrs = "Pending Incoming Whatsapp Messages since 24 hrs",
    Purpose = "Purpose",
    Reassigned_by = "Reassigned by",
    Reassigned_on = "Reassigned on",
    Reassigned_by_pre_sales = "Reassigned by pre sales",
    Transferred_from = "Transferred from",
    Country = "Country",
    Channel_Partner_ID = "Channel Partner ID",
    State = "State",
    City = "City",
    Nri = "Nri",
    Dropped_from_stage = "Dropped from stage",
    Drop_reason = "Drop reason",
    Stage_change_reason = "Stage change reason",
    Lead_Hotness = "Lead Hotness",
    Active = "Active",
    Lead_Primary_phone = "Lead . Primary phone",
    Lead_Primary_email = "Lead . Primary email",
    Sales = "Sales",
    Team = "Team",
    Presales_Pipeline_Stage = "Presales - Pipeline Stage",
    Sales_Pipeline_Stage = "Sales - Pipeline Stage",
    Presales_Sub_Status = "Presales - Sub Status",
    Sales_Sub_Status = "Sales - Sub Status",
    Validated_from_UI = "Validated from UI",
    Projects = "Projects",
    Campaigns = "Campaigns",
    Publisher = "Publisher",
    Sub_campaign = "Sub campaign",
    Medium_type = "Medium type",
    Medium_value = "Medium value",
    Form_Id = "Form Id",
    Lead_received_on = "Lead received on",
    Total_Site_visit_Scheduled = "Total Site visit Scheduled",
    Total_Site_visit_Conducted = "Total Site visit Conducted",
    Total_Site_visit_Missed = "Total Site visit Missed",
    Lead_Pipeline_Velocity = "Lead Pipeline Velocity",
    First_Project_Added = "First Project Added",
    Last_Project_Added = "Last Project Added",
    First_Campaign_Added = "First Campaign Added",
    Last_Campaign_Added = "Last Campaign Added",
    First_Source_Added = "First Source Added",
    Last_Source_Added = "Last Source Added",
    First_Sub_Source_Added = "First Sub Source Added",
    Last_Sub_Source_Added = "Last Sub Source Added",
    Last_note_added_on = "Last note added on",
    Second_Last_Reengaged_On = "Second Last Reengaged On",
    Last_Reengaged_On = "Last Reengaged On",
    Custom_field_Qualified_Lead = "Custom field - Qualified Lead",
    Custom_field_Creation_Source = "Custom field - Creation Source"
  }

  // WorkFlowEvents
  export enum WorkFlowEvents {
    Newlead_Created = 0,
    Newcall_Created = 1,
    Incomingcall_Missed = 2,
    Incomingcall_Answered = 3,
    Outgoingcall_Missed = 4,
    Outgoingcall_Answered = 5,
    Call_Score_Updated = 6,
    Project_Added = 7,
    Sitevisit_Scheduled = 8,
    Sitevisit_Conducted = 9,
    Sitevisit_Missed = 10,
    Sitevisit_Pending = 11,
    Sitevisit_Dropped = 12,
    Followup_Scheduled = 13,
    Followup_Pending = 14,
    Followup_Conducted = 15,
    Touched = 16,
    Email_Opened = 17,
    Email_Unsubscribed = 18,
    Email_Received = 19,
    Lead_Validated = 20,
    Pushedto_Sales = 21,
    Pulledto_Sales = 22,
    Campaignresponse_Received = 23,
    Leadre_engaged = 24,
    Lead_Reassigned = 25,
    Leadrequirement_Updated = 26,
    Leadprofile_Updated = 27,
    Stage_Changed = 31,
    Status_Changed = 29,
    Lead_Lost = 30,
    Lead_Unqualified = 31,
    Sitevisit_Rescheduled = 32,
    Lead_Verified = 33,
    Newenquiry_Received = 34,
    Booked_Lead = 35,
    Email_Sent = 36,
    Leadhotness_Updated = 37,
    Booking_Created = 38,
    Booking_Updated = 39,
    Booking_Receipt_Created = 40,
    Booking_Receipt_Updated = 41,
    Sms_Created = 42,
    Lead_Updated = 43,
    Call_Feedback_Submitted = 44,
    Note_Added_On_Lead = 45,
    Whatsapp_Sent = 46,
    Whatsapp_Delivered = 47,
    Whatsapp_Read = 48,
    Whatsapp_Received = 49,
  }
  