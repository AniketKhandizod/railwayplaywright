import { Page, Locator, expect } from '@playwright/test';
//import { WorkFlowEvents } from '../enums/WorkFlowEvents';

export class CreateWorkFlowPage {
    private readonly page: Page;
    private readonly addConditionHeader: Locator;
    private readonly addConditionBelowOperators: Locator;
    private readonly addActionHeader: Locator;
    private readonly matchAny: Locator;
    private readonly matchAll: Locator;
    private readonly selectCondition1: Locator;
    private readonly conditionList: Locator;
    private readonly addMoreConditions1: Locator;
    private readonly selectCondition2: Locator;
    private readonly addMoreConditions2: Locator;
    private readonly operator1: Locator;
    private readonly operator2: Locator;
    private readonly operatorOptions: Locator;
    private readonly value1: Locator;
    private readonly value2: Locator;
    private readonly valueInput: Locator;
    private readonly valueList: Locator;
    private readonly ifSuccess: Locator;
    private readonly ifFailure: Locator;
    private readonly addActionButton: Locator;
    private readonly selectActionDropdown: Locator;
    private readonly actionList: Locator;
    private readonly noteInput: Locator;
    private readonly saveActions: Locator;
    private readonly backToAllWF: Locator;
    private readonly delayButton: Locator;
    private readonly delayTimeUnit: Locator;
    private readonly delayOption: Locator;
    private readonly delayInput: Locator;
    private readonly addDelayConfirm: Locator;
    private readonly saveButtons: Locator;
    private readonly webhookUrl: Locator;
    private readonly webhookRequestType: Locator;
    private readonly webhookRequestTypeOptions: Locator;
    private readonly webhookRequestParams: Locator;
    private readonly webhookRequestParamsOptions: Locator;
    private readonly errorEmail: Locator;
    private readonly customPayloadCheckbox: Locator;
    private readonly customPayloadInput: Locator;

    constructor(page: Page) {
        this.page = page;
        // Condition/Action headers
        this.addConditionHeader = this.page.locator("div[class='col-sm-5 col-lg-5 rbdr add-condition'] h3");
        this.addConditionBelowOperators = this.page.locator("button[class='btn btn-primary mt10 add-trigger-btn']");
        this.addActionHeader = this.page.getByRole('heading', { name: 'Add actions' });
        this.matchAny = this.page.locator('//input[@name="match_all" and @value="false"]/parent::label');
        this.matchAll = this.page.locator('//input[@name="match_all" and @value="true"]/parent::label');

        // Condition 1
        this.selectCondition1 = this.page.locator('//div[@class="select2-container form-control predicate workflow-input"]');
        this.conditionList = this.page.locator("//li[starts-with(@class,'select2-results-dept-1')]//div");
        this.addMoreConditions1 = this.page.locator('//button[text()="Add conditions"]');

        // Condition 2
        this.selectCondition2 = this.page.locator('(//div[@class="select2-container form-control predicate workflow-input"])[2]');
        this.addMoreConditions2 = this.page.locator('(//button[text()="Add conditions"])[2]');

        // Operator 1 & 2
        this.operator1 = this.page.locator('//div[@class="select2-container form-control operator workflow-input"]');
        this.operator2 = this.page.locator('(//div[@class="select2-container form-control operator workflow-input"])[2]');
        this.operatorOptions = this.page.locator("//li[starts-with(@class,'select2-results-dept-0')]//div");

        // Values
        this.value1 = this.page.locator('//div[@class="select2-container form-control value workflow-input"]');
        this.value2 = this.page.locator('(//div[@class="select2-container form-control value workflow-input"])[2]');
        this.valueInput = this.page.locator('#select2-drop .select2-input');
        this.valueList = this.page.locator('#select2-drop ul.select2-results li');

        // Outcome
        this.ifSuccess = this.page.locator('div[class^="condition c-yes fl"]');
        this.ifFailure = this.page.locator('div[class^="condition c-no fr"]');

        // Add Action
        this.addActionButton = this.page.getByRole('button', { name: 'Add action' });
        this.selectActionDropdown = this.page.locator('div.select2-container.action-type');
        this.actionList = this.page.locator('li.select2-result');
        this.noteInput = this.page.getByRole('textbox', { name: 'Enter Value' });
        this.saveActions = this.page.locator('button.btn.btn-primary.mt10.save-actions-btn');

        // Back navigation
        this.backToAllWF = this.page.locator('text=All Workflows');

        // Delay
        this.delayButton = this.page.getByRole('link', { name: '- Add delay' });
        this.delayTimeUnit = this.page.locator('div.select2-container.entity');
        this.delayOption = this.page.locator('#select2-drop li');
        this.delayInput = this.page.locator("input[name='entity-prev-val']");
        this.addDelayConfirm = this.page.getByText('Add', { exact: true }).nth(1);

        // Webhook
        this.webhookUrl = this.page.locator('input[name="webhook-url"]');
        this.webhookRequestType = this.page.getByRole('link', { name: 'Enter request type GET/POST/' });
        this.webhookRequestTypeOptions = this.page.getByText('POST', { exact: true });
        this.webhookRequestParams = this.page.getByRole('link', { name: 'Enter params type JSON' });
        this.webhookRequestParamsOptions = this.page.getByText('JSON', { exact: true });
        this.errorEmail = this.page.locator("div.error_addresses input.select2-input");
        this.customPayloadCheckbox = this.page.locator(".custom_payload.workflow-input");
        this.customPayloadInput = this.page.locator(".form-control.mb10.payload.workflow-input");

        // Save Workflow
        this.saveButtons = this.page.locator('//button[text()="Save"]');
    }

    async clickOnWFSave() {
        const count = await this.saveButtons.count();
        for (let i = 0; i < count; i++) {
          const btn = this.saveButtons.nth(i);
          if (await btn.isVisible()) {
            await btn.click();
            break;
          }
        }
      }
    
      async addDelay(minutes: string) {
        await this.delayButton.click();
        await this.delayTimeUnit.click();
        await this.delayOption.filter({ hasText: 'Minutes' }).first().click();
        await this.delayInput.first().fill(minutes);
        await this.addDelayConfirm.click();
      
      }
    
      async clickOnAddCondition() {
        await this.addConditionHeader.click();
      }

      async clickOnAddConditionBelowOperators() {
        await this.addConditionBelowOperators.click();
      }
    
      async clickOnAddAction() {
        await this.addActionHeader.click();
      }
    
      async clickOnMatchAll() {
        await this.matchAll.click();
      }
    
      async clickOnMatchAny() {
        await this.matchAny.click();
      }
    
      async clickOnIfConditionSucceeds() {
        await this.ifSuccess.click();
      }
    
      async clickOnIfConditionFails() {
        await this.ifFailure.click();
      }
    
      async clickOnAddActionAfterSelectingAction() {
        await this.addActionButton.click();
      }
    
      async selectCondition(condition: WorkFlowConditions) {
        await this.selectCondition1.click();
        for (let i = 0; i < await this.conditionList.count(); i++) {
            const conditionElement = this.conditionList.nth(i);
            if (await conditionElement.isVisible() && (await conditionElement.textContent()) === condition) {
                await conditionElement.click();
                break;
            }
        }
      }
    
      async selectCondition_2(condition: WorkFlowConditions) {
        await this.selectCondition2.click();
        for (let i = 0; i < await this.conditionList.count(); i++) {
            const conditionElement = this.conditionList.nth(i);
            if (await conditionElement.isVisible() && (await conditionElement.textContent()) === condition) {
                await conditionElement.click();
                break;
            }
        }
      }
    
      async selectOnOperator(operator: WorkFlowOperators) {
        await this.operator1.click();
        await this.operatorOptions.filter({ hasText: operator }).first().click();
      }
    
      async selectOnOperator_2(operator: WorkFlowOperators) {
        await this.operator2.click();
        await this.operatorOptions.filter({ hasText: operator }).first().click();
      }
    
      async selectValue(value: string) {
        await this.value1.click();
        await this.valueInput.fill(value);
        await this.valueList.filter({ hasText: value }).first().click();
      }
    
      async selectValue_2(value: string) {
        await this.value2.click();
        await this.valueInput.fill(value);
        await this.valueList.filter({ hasText: value }).first().click();
      }
    
      async selectAction(action: WorkFlowActions) {
        await this.selectActionDropdown.click();
        for (let i = 0; i < await this.actionList.count(); i++) {
            const actionElement = this.actionList.nth(i);
            if (await actionElement.isVisible() && (await actionElement.textContent()) === action) {
                await actionElement.click();
                break;
            }
        }
      }
    
      async noteAction(content: string) {
        await this.noteInput.fill(content);
      }
    
      async backToAllWorkflows() {
        await this.backToAllWF.click();
      }

      async configureWebhook(url: string) {
        await this.webhookUrl.fill(url);
        await this.webhookRequestType.click();
        await this.webhookRequestTypeOptions.click();
        await this.webhookRequestParams.click();
        await this.webhookRequestParamsOptions.click();
        await this.errorEmail.fill("test@test.com");
        await this.errorEmail.press("Enter");
      }

      async clickOnCustomPayloadCheckbox() {
        await this.customPayloadCheckbox.click();
      }

      async enterCustomPayload(payload: string) {
        await this.customPayloadInput.fill(payload);
      }

}

export enum WorkFlowOperators {
    Equals = 'Equals',
    Does_not_equal = 'Does not equal',
    Exists = 'Exists',
    Does_not_exist = 'Does not exist',
    Did_not_exist = 'Did not exist',
    Changed = 'Changed',
    Changed_to = 'Changed to',
    Changed_from = 'Changed from',
  }

export enum WorkFlowActions {
    Send_Transactional_SMS = 'Send Transactional SMS',
    Send_Promotional_SMS = 'Send Promotional SMS',
    Send_Email = 'Send Email',
    Send_Whatsapp = 'Send Whatsapp',
    Touched = 'Touched',
    Add_City = 'Add City',
    Add_Country = 'Add Country',
    Add_BHK = 'Add BHK',
    Add_Property_Type = 'Add Property Type',
    Add_property_purpose = 'Add property purpose',
    Add_Bathrooms = 'Add Bathrooms',
    Add_Furnishing = 'Add Furnishing',
    Add_Facing = 'Add Facing',
    Mark_as_NRI = 'Mark as NRI',
    Set_Sales = 'Set Sales',
    Add_Secondary_Sales = 'Add Secondary Sales',
    Set_Tags = 'Set Tags',
    Remove_Tags = 'Remove Tags',
    Increment_Lead_Hotness_by = 'Increment Lead Hotness by',
    Decrement_Lead_Hotness_by = 'Decrement Lead Hotness by',
    Set_Lead_Hotness = 'Set Lead Hotness',
    Custom_field_Qualified_Lead = 'Custom field - Qualified Lead',
    Custom_field_Creation_Source = 'Custom field - Creation Source',
    Schedule_sitevisit = 'Schedule sitevisit',
    MarkSiteVisit_DidNotVisit = 'MarkSiteVisit DidNotVisit',
    Conduct_sitevisit = 'Conduct sitevisit',
    Schedule_Followup = 'Schedule Followup',
    Conduct_Followup = 'Conduct Followup',
    Cancel_Followup = 'Cancel Followup',
    Send_Brochure = 'Send Brochure',
    SendPrice_Quote = 'SendPrice Quote',
    Reassign_Lead = 'Reassign Lead',
    Add_project = 'Add project',
    PushTo_Sales = 'PushTo Sales',
    Add_Note = 'Add Note',
    Add_Task = 'Add Task',
    ChangeStageIfIn_PreSales = 'ChangeStageIfIn Pre-Sales',
    ChangeStageIfIn_Sales = 'ChangeStageIfIn Sales',
    Sync_Lead_with_Facebook = 'Sync Lead with Facebook',
    Webhook = 'Webhook'
  }

export enum WorkFlowConditions {
    Lead = 'Lead',
    New_lead = 'New lead',
    Touched = 'Touched',
    Last_followup_status = 'Last followup status',
    Last_followup_date = 'Last followup date',
    Site_visit_status = 'Site visit status',
    Followup_status = 'Followup status',
    Last_incoming_call_status = 'Last incoming call status',
    Last_outgoing_call_status = 'Last outgoing call status',
    Latest_Activity_Scheduled_On = 'Latest Activity Scheduled On',
    No_Future_Activity_On_Lead = 'No Future Activity On Lead',
    Latest_Followup_Scheduled_On = 'Latest Followup Scheduled On',
    Latest_Site_visit_Scheduled_On = 'Latest Site visit Scheduled On',
    Last_contacted_by_Lead = 'Last contacted by Lead',
    Last_Contact_attempted_by_Lead = 'Last Contact attempted by Lead',
    Last_Contact_by_Sales = 'Last Contact by Sales',
    Last_Contact_attempted_by_Sales = 'Last Contact attempted by Sales',
    Last_Stage_Changed_On = 'Last Stage Changed On',
    Last_Contact = 'Last Contact',
    Last_acted_on = 'Last acted on',
    Incoming_calls_Total = 'Incoming calls (Total)',
    Outgoing_calls_Total = 'Outgoing calls (Total)',
    Total_Answered_calls = 'Total Answered calls',
    Total_Not_Answered_calls = 'Total Not-Answered calls',
    Incoming_calls_Answered = 'Incoming calls (Answered)',
    Incoming_calls_Not_Answered = 'Incoming calls (Not-Answered)',
    Outgoing_calls_Answered = 'Outgoing calls (Answered)',
    Outgoing_calls_Not_Answered = 'Outgoing calls (Not-Answered)',
    Incoming_calls_Duration = 'Incoming calls (Duration)',
    Outgoing_calls_Duration = 'Outgoing calls (Duration)',
    Total_calls_Duration = 'Total calls (Duration)',
    Quality = 'Quality',
    Brochure_sent = 'Brochure sent',
    Price_quote_sent = 'Price quote sent',
    Currently_in = 'Currently in',
    Min_budget = 'Min budget',
    Max_budget = 'Max budget',
    Min_possession = 'Min possession',
    Max_possession = 'Max possession',
    Location_preference = 'Location preference',
    Property_type_preference = 'Property type preference',
    BHK = 'BHK',
    Transaction_type = 'Transaction type',
    Interested_in_resale = 'Interested in resale',
    Property_Purpose = 'Property Purpose',
    Furnishing = 'Furnishing',
    Facing = 'Facing',
    Bathrooms = 'Bathrooms',
    Funding_source = 'Funding source',
    Developer = 'Developer',
    Lead_Phone_Number_Verified = 'Lead Phone Number Verified',
    Pending_incoming_mail = 'Pending incoming mail',
    Pending_Incoming_Whatsapp_Messages_since_24_hrs = 'Pending Incoming Whatsapp Messages since 24 hrs',
    Purpose = 'Purpose',
    Reassigned_by = 'Reassigned by',
    Reassigned_on = 'Reassigned on',
    Reassigned_by_pre_sales = 'Reassigned by pre sales',
    Transferred_from = 'Transferred from',
    Country = 'Country',
    Channel_Partner_ID = 'Channel Partner ID',
    State = 'State',
    City = 'City',
    Nri = 'Nri',
    Dropped_from_stage = 'Dropped from stage',
    Drop_reason = 'Drop reason',
    Stage_change_reason = 'Stage change reason',
    Lead_Hotness = 'Lead Hotness',
    Active = 'Active',
    Lead_Primary_phone = 'Lead . Primary phone',
    Lead_Primary_email = 'Lead . Primary email',
    Sales = 'Sales',
    Team = 'Team',
    Presales_Pipeline_Stage = 'Presales - Pipeline Stage',
    Sales_Pipeline_Stage = 'Sales - Pipeline Stage',
    Presales_Sub_Status = 'Presales - Sub Status',
    Sales_Sub_Status = 'Sales - Sub Status',
    Validated_from_UI = 'Validated from UI',
    Projects = 'Projects',
    Campaigns = 'Campaigns',
    Publisher = 'Publisher',
    Sub_campaign = 'Sub campaign',
    Medium_type = 'Medium type',
    Medium_value = 'Medium value',
    Form_Id = 'Form Id',
    Lead_received_on = 'Lead received on',
    Total_Site_visit_Scheduled = 'Total Site visit Scheduled',
    Total_Site_visit_Conducted = 'Total Site visit Conducted',
    Total_Site_visit_Missed = 'Total Site visit Missed',
    Lead_Pipeline_Velocity = 'Lead Pipeline Velocity',
    First_Project_Added = 'First Project Added',
    Last_Project_Added = 'Last Project Added',
    First_Campaign_Added = 'First Campaign Added',
    Last_Campaign_Added = 'Last Campaign Added',
    First_Source_Added = 'First Source Added',
    Last_Source_Added = 'Last Source Added',
    First_Sub_Source_Added = 'First Sub Source Added',
    Last_Sub_Source_Added = 'Last Sub Source Added',
    Last_note_added_on = 'Last note added on',
    Second_Last_Reengaged_On = 'Second Last Reengaged On',
    Last_Reengaged_On = 'Last Reengaged On',
    Custom_field_Qualified_Lead = 'Custom field - Qualified Lead',
    Custom_field_Creation_Source = 'Custom field - Creation Source',
  }
  
  