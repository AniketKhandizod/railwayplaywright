import { Page, Locator, expect } from "@playwright/test";
import { Utils } from "../../utils/PlaywrightTestUtils";

export enum DateFilter {
  Today = "Today",
  Yesterday = "Yesterday",
  Last7Days = "Last 7 Days",
  Last30Days = "Last 30 Days",
  ThisMonth = "This Month",
  LastMonth = "Last Month",
  LastSixMonth = "Last 6 Months",
  LifeTime = "Lifetime"
}
export class AllLeadsPage {
  private readonly page: Page;
  private readonly utils: Utils;
  private readonly selectSearchList: Locator;
  private readonly enterSearchlistName: Locator;
  private readonly filterButton: Locator;
  private readonly clearAllButton: Locator;
  private readonly primarySalesPerson: Locator;
  private readonly applyButton: Locator;
  private readonly highlatedSales: Locator;
  private readonly HashElement: Locator;
  private readonly HashElementText: Locator;
  private readonly HashElementText_ES: Locator;
  private readonly subsourceFilter: Locator;
  private readonly subsourceFilterInput: Locator;
  private readonly allLeadsRows: Locator;
  private readonly customColumnButton: Locator;
  private readonly customColumnDropdown: Locator;
  private readonly customColumnBHK: Locator;
  private readonly customColumnBathrooms: Locator;
  private readonly customColumnCall_Lead: Locator;
  private readonly customColumnCity: Locator;
  private readonly customColumnCountry: Locator;
  private readonly customColumnCurrently_In: Locator;
  private readonly customColumnDepartment: Locator;
  private readonly customColumnDropped_By: Locator;
  private readonly customColumnFacing: Locator;
  private readonly customColumnFirst_Campaign_Name: Locator;
  private readonly customColumnFirst_Medium_Type: Locator;
  private readonly customColumnFirst_Medium_Value: Locator;
  private readonly customColumnFirst_Source: Locator;
  private readonly customColumnFirst_Sub_Source: Locator;
  private readonly customColumnFollowup_Status: Locator;
  private readonly customColumnFollowup_Today: Locator;
  private readonly customColumnFunding_Source: Locator;
  private readonly customColumnInterested_Project_Names: Locator;
  private readonly customColumnInterested_in_resale: Locator;
  private readonly customColumnLast_Acted_On: Locator;
  private readonly customColumnLast_Answered_Call_At: Locator;
  private readonly customColumnLast_Call_Note: Locator;
  private readonly customColumnLast_Campaign_Name: Locator;
  private readonly customColumnLast_Contact: Locator;
  private readonly customColumnLast_Contact_Attempted_By_Lead: Locator;
  private readonly customColumnLast_Contact_Attempted_By_Sales: Locator;
  private readonly customColumnLast_Contact_By_Lead: Locator;
  private readonly customColumnLast_Contact_By_Sales: Locator;
  private readonly customColumnLast_Followup_Date: Locator;
  private readonly customColumnLast_Followup_Status: Locator;
  private readonly customColumnLast_Incoming_Call_Status: Locator;
  private readonly customColumnLast_Medium_Type: Locator;
  private readonly customColumnLast_Medium_Value: Locator;
  private readonly customColumnLast_Missed_Call_On: Locator;
  private readonly customColumnLast_Note: Locator;
  private readonly customColumnLast_Note_By: Locator;
  private readonly customColumnLast_Outgoing_Call_Status: Locator;
  private readonly customColumnLast_Reengaged_On: Locator;
  private readonly customColumnLast_Site_Visit_Conducted_On: Locator;
  private readonly customColumnLast_Source: Locator;
  private readonly customColumnLast_Stage_Changed_On: Locator;
  private readonly customColumnLast_Sub_Source: Locator;
  private readonly customColumnLead_Age: Locator;
  private readonly customColumnLead_Score: Locator;
  private readonly customColumnLocality: Locator;
  private readonly customColumnLocations: Locator;
  private readonly customColumnMax_budget: Locator;
  private readonly customColumnMax_possession: Locator;
  private readonly customColumnMin_budget: Locator;
  private readonly customColumnMin_possession: Locator;
  private readonly customColumnName: Locator;
  private readonly customColumnNext_Activity_Scheduled: Locator;
  private readonly customColumnNext_Activity_Scheduled_On: Locator;
  private readonly customColumnNext_Followup_Scheduled_On: Locator;
  private readonly customColumnNext_Site_Visit_Scheduled_On: Locator;
  private readonly customColumnNri: Locator;
  private readonly customColumnPending_Tasks: Locator;
  private readonly customColumnPhone_Verified: Locator;
  private readonly customColumnPipeline_Stage: Locator;
  private readonly customColumnPipeline_Stage_Lost_Reason: Locator;
  private readonly customColumnPipeline_Stage_Unqualified_Reason: Locator;
  private readonly customColumnPipeline_Status: Locator;
  private readonly customColumnPrimary_Phone_Number: Locator;
  private readonly customColumnProperty_purpose: Locator;
  private readonly customColumnProperty_types: Locator;
  private readonly customColumnPurpose: Locator;
  private readonly customColumnPushed_By: Locator;
  private readonly customColumnPushed_On: Locator;
  private readonly customColumnQuick_Actions: Locator;
  private readonly customColumnRe_Engaged: Locator;
  private readonly customColumnRe_Engaged_Count: Locator;
  private readonly customColumnReassigned_By: Locator;
  private readonly customColumnReassigned_By_Pre_Sales: Locator;
  private readonly customColumnReassigned_On: Locator;
  private readonly customColumnReceived_on: Locator;
  private readonly customColumnRequirement: Locator;
  private readonly customColumnSales_Name: Locator;
  private readonly customColumnSalutation: Locator;
  private readonly customColumnScheduled_Activities: Locator;
  private readonly customColumnSitevisit_Today: Locator;
  private readonly customColumnState: Locator;
  private readonly customColumnTags: Locator;
  private readonly customColumnTeam_Name: Locator;
  private readonly customColumnTime_to_First_Attempt_Contact: Locator;
  private readonly customColumnTime_to_First_Contact: Locator;
  private readonly customColumnTotal_Answered_Calls: Locator;
  private readonly customColumnTotal_Calls_Duration: Locator;
  private readonly customColumnTotal_Incoming_Answered_Calls: Locator;
  private readonly customColumnTotal_Incoming_Calls: Locator;
  private readonly customColumnTotal_Incoming_Calls_Duration: Locator;
  private readonly customColumnTotal_Incoming_Not_Answered_Calls: Locator;
  private readonly customColumnTotal_Not_Answered_Calls: Locator;
  private readonly customColumnTotal_Outgoing_Answered_Calls: Locator;
  private readonly customColumnTotal_Outgoing_Calls: Locator;
  private readonly customColumnTotal_Outgoing_Calls_Duration: Locator;
  private readonly customColumnTotal_Outgoing_Not_Answered_Calls: Locator;
  private readonly customColumnTotal_Site_Visit_Conducted: Locator;
  private readonly customColumnTotal_Site_Visit_Missed: Locator;
  private readonly customColumnTotal_Site_Visit_Scheduled: Locator;
  private readonly customColumnTouched_Untouched: Locator;

  private readonly resetCustomColumnButton: Locator;
  private readonly applyCustomColumnButton: Locator;
  private readonly getCustomColumnList: Locator;
  private readonly funnelButton: Locator;
  private readonly buttonClearAll: Locator;
  private readonly buttonApply: Locator;
  private readonly dateFilter: Locator;
  private readonly dateFilterDropdown: Locator;

  // Per page count element
  private readonly perPageCountElement: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();

    this.selectSearchList = page.locator("div[class='select2-container form-control select2 clean-select2 lead-list']");
    this.enterSearchlistName = page.locator("input[class='select2-input select2-focused']");

    this.filterButton = page.locator("#ion_funnel_lead_profile");
    this.clearAllButton = page.locator(".clear-all-filters.btn.btn-link.small");
    this.primarySalesPerson = page.locator("//label[text()='Primary Sales Person']/following-sibling::div//input");
    this.highlatedSales = page.locator("li[class='select2-results-dept-0 select2-result select2-result-selectable select2-highlighted']");
    this.applyButton = page.getByText('Apply').first();
    this.subsourceFilter = page.locator("//label[text()='Sub source']/following-sibling::div//a /span[@class='select2-chosen']");
    this.subsourceFilterInput = page.locator("div[class='select2-drop select2-display-none select2-with-searchbox select2-drop-active'] input");

    // Get Count
    this.HashElement = page.locator("#get_leads_count");
    this.HashElementText = page.locator("span[class='leads-count-note']");
    this.HashElementText_ES = page.locator(".leads-count-note");
    // Custom column elements
    this.customColumnButton = page.locator("button.btn.btn-light.btn-icon.toggle-columns");
    this.customColumnDropdown = page.locator("div.dropdown-menu.show");

    // All leads rows
    this.allLeadsRows = page.locator(".crm-leads .leads-small");

    this.customColumnBHK = page.locator("//input[@id='col_bhk']/parent::label");
    this.customColumnBathrooms = page.locator("//input[@id='col_bathrooms']/parent::label");
    this.customColumnCall_Lead = page.locator("//input[@id='col_call_lead']/parent::label");
    this.customColumnCity = page.locator("//input[@id='col_city']/parent::label");
    this.customColumnCountry = page.locator("//input[@id='col_country']/parent::label");
    this.customColumnCurrently_In = page.locator("//input[@id='col_currently_in']/parent::label");
    this.customColumnDepartment = page.locator("//input[@id='col_department']/parent::label");
    this.customColumnDropped_By = page.locator("//input[@id='col_dropped_by']/parent::label");
    this.customColumnFacing = page.locator("//input[@id='col_facing']/parent::label");
    this.customColumnFirst_Campaign_Name = page.locator("//input[@id='col_first_campaign_name']/parent::label");
    this.customColumnFirst_Medium_Type = page.locator("//input[@id='col_first_medium_type']/parent::label");
    this.customColumnFirst_Medium_Value = page.locator("//input[@id='col_first_medium_value']/parent::label");
    this.customColumnFirst_Source = page.locator("//input[@id='col_first_source']/parent::label");
    this.customColumnFirst_Sub_Source = page.locator("//input[@id='col_first_sub_source']/parent::label");
    this.customColumnFollowup_Status = page.locator("//input[@id='col_followup_status']/parent::label");
    this.customColumnFollowup_Today = page.locator("//input[@id='col_followup_today']/parent::label");
    this.customColumnFunding_Source = page.locator("//input[@id='col_funding_source']/parent::label");
    this.customColumnInterested_Project_Names = page.locator("//input[@id='col_interested_project_names']/parent::label");
    this.customColumnInterested_in_resale = page.locator("//input[@id='col_interested_in_resale']/parent::label");
    this.customColumnLast_Acted_On = page.locator("//input[@id='col_last_acted_on']/parent::label");
    this.customColumnLast_Answered_Call_At = page.locator("//input[@id='col_last_answered_call_at']/parent::label");
    this.customColumnLast_Call_Note = page.locator("//input[@id='col_last_call_note']/parent::label");
    this.customColumnLast_Campaign_Name = page.locator("//input[@id='col_last_campaign_name']/parent::label");
    this.customColumnLast_Contact = page.locator("//input[@id='col_last_contact']/parent::label");
    this.customColumnLast_Contact_Attempted_By_Lead = page.locator("//input[@id='col_last_contact_attempted_at']/parent::label");
    this.customColumnLast_Contact_Attempted_By_Sales = page.locator("//input[@id='col_last_sales_attempted_at']/parent::label");
    this.customColumnLast_Contact_By_Lead = page.locator("//input[@id='col_last_contacted_at']/parent::label");
    this.customColumnLast_Contact_By_Sales = page.locator("//input[@id='col_last_sales_contacted_at']/parent::label");
    this.customColumnLast_Followup_Date = page.locator("//input[@id='col_last_followup_date']/parent::label");
    this.customColumnLast_Followup_Status = page.locator("//input[@id='col_last_followup_status']/parent::label");
    this.customColumnLast_Incoming_Call_Status = page.locator("//input[@id='col_last_incoming_call_status']/parent::label");
    this.customColumnLast_Medium_Type = page.locator("//input[@id='col_last_medium_type']/parent::label");
    this.customColumnLast_Medium_Value = page.locator("//input[@id='col_last_medium_value']/parent::label");
    this.customColumnLast_Missed_Call_On = page.locator("//input[@id='col_last_missed_call_on']/parent::label");
    this.customColumnLast_Note = page.locator("//input[@id='col_last_note']/parent::label");
    this.customColumnLast_Note_By = page.locator("//input[@id='col_last_note_by']/parent::label");
    this.customColumnLast_Outgoing_Call_Status = page.locator("//input[@id='col_last_outgoing_call_status']/parent::label");
    this.customColumnLast_Reengaged_On = page.locator("//input[@id='col_last_reengaged_on']/parent::label");
    this.customColumnLast_Site_Visit_Conducted_On = page.locator("//input[@id='col_last_site_visit_conducted_on']/parent::label");
    this.customColumnLast_Source = page.locator("//input[@id='col_last_source']/parent::label");
    this.customColumnLast_Stage_Changed_On = page.locator("//input[@id='col_last_stage_changed_on']/parent::label");
    this.customColumnLast_Sub_Source = page.locator("//input[@id='col_last_sub_source']/parent::label");
    this.customColumnLead_Age = page.locator("//input[@id='col_lead_age']/parent::label");
    this.customColumnLead_Score = page.locator("//input[@id='col_score']/parent::label");
    this.customColumnLocality = page.locator("//input[@id='col_locality']/parent::label");
    this.customColumnLocations = page.locator("//input[@id='col_locations']/parent::label");
    this.customColumnMax_budget = page.locator("//input[@id='col_max_budget']/parent::label");
    this.customColumnMax_possession = page.locator("//input[@id='col_max_possession']/parent::label");
    this.customColumnMin_budget = page.locator("//input[@id='col_min_budget']/parent::label");
    this.customColumnMin_possession = page.locator("//input[@id='col_min_possession']/parent::label");
    this.customColumnName = page.locator("//input[@id='col_name']/parent::label");
    this.customColumnNext_Activity_Scheduled = page.locator("//input[@id='col_next_activity_scheduled']/parent::label");
    this.customColumnNext_Activity_Scheduled_On = page.locator("//input[@id='col_next_activity_scheduled_on']/parent::label");
    this.customColumnNext_Followup_Scheduled_On = page.locator("//input[@id='col_next_followup_scheduled_on']/parent::label");
    this.customColumnNext_Site_Visit_Scheduled_On = page.locator("//input[@id='col_next_site_visit_scheduled_on']/parent::label");
    this.customColumnNri = page.locator("//input[@id='col_nri']/parent::label");
    this.customColumnPending_Tasks = page.locator("//input[@id='col_pending_tasks']/parent::label");
    this.customColumnPhone_Verified = page.locator("//input[@id='col_phone_verified']/parent::label");
    this.customColumnPipeline_Stage = page.locator("//input[@id='col_stage']/parent::label");
    this.customColumnPipeline_Stage_Lost_Reason = page.locator("//input[@id='col_pipeline_stage_lost_reason']/parent::label");
    this.customColumnPipeline_Stage_Unqualified_Reason = page.locator("//input[@id='col_pipeline_stage_unqualified_reason']/parent::label");
    this.customColumnPipeline_Status = page.locator("//input[@id='col_status']/parent::label");
    this.customColumnPrimary_Phone_Number = page.locator("//input[@id='col_primary_phone']/parent::label");
    this.customColumnProperty_purpose = page.locator("//input[@id='col_property_purpose']/parent::label");
    this.customColumnProperty_types = page.locator("//input[@id='col_property_types']/parent::label");
    this.customColumnPurpose = page.locator("//input[@id='col_purpose']/parent::label");
    this.customColumnPushed_By = page.locator("//input[@id='col_pushed_by']/parent::label");
    this.customColumnPushed_On = page.locator("//input[@id='col_pushed_on']/parent::label");
    this.customColumnQuick_Actions = page.locator("//input[@id='col_quick_actions']/parent::label");
    this.customColumnRe_Engaged = page.locator("//input[@id='col_re_engaged']/parent::label");
    this.customColumnRe_Engaged_Count = page.locator("//input[@id='col_re_engaged_count']/parent::label");
    this.customColumnReassigned_By = page.locator("//input[@id='col_reassigned_by']/parent::label");
    this.customColumnReassigned_By_Pre_Sales = page.locator("//input[@id='col_reassigned_by_pre_sales']/parent::label");
    this.customColumnReassigned_On = page.locator("//input[@id='col_reassigned_on']/parent::label");
    this.customColumnReceived_on = page.locator("//input[@id='col_created_at']/parent::label");
    this.customColumnRequirement = page.locator("//input[@id='col_requirement']/parent::label");
    this.customColumnSales_Name = page.locator("//input[@id='col_sales_name']/parent::label");
    this.customColumnSalutation = page.locator("//input[@id='col_salutation']/parent::label");
    this.customColumnScheduled_Activities = page.locator("//input[@id='col_scheduled_activities']/parent::label");
    this.customColumnSitevisit_Today = page.locator("//input[@id='col_sitevisit_today']/parent::label");
    this.customColumnState = page.locator("//input[@id='col_state']/parent::label");
    this.customColumnTags = page.locator("//input[@id='col_tags']/parent::label");
    this.customColumnTeam_Name = page.locator("//input[@id='col_team_name']/parent::label");
    this.customColumnTime_to_First_Attempt_Contact = page.locator("//input[@id='col_ttfac']/parent::label");
    this.customColumnTime_to_First_Contact = page.locator("//input[@id='col_ttfc']/parent::label");
    this.customColumnTotal_Answered_Calls = page.locator("//input[@id='col_total_answered_calls']/parent::label");
    this.customColumnTotal_Calls_Duration = page.locator("//input[@id='col_total_calls_duration']/parent::label");
    this.customColumnTotal_Incoming_Answered_Calls = page.locator("//input[@id='col_total_incoming_answered_calls']/parent::label");
    this.customColumnTotal_Incoming_Calls = page.locator("//input[@id='col_total_incoming_calls']/parent::label");
    this.customColumnTotal_Incoming_Calls_Duration = page.locator("//input[@id='col_total_incoming_calls_duration']/parent::label");
    this.customColumnTotal_Incoming_Not_Answered_Calls = page.locator("//input[@id='col_total_incoming_not_answered_calls']/parent::label");
    this.customColumnTotal_Not_Answered_Calls = page.locator("//input[@id='col_total_not_answered_calls']/parent::label");
    this.customColumnTotal_Outgoing_Answered_Calls = page.locator("//input[@id='col_total_outgoing_answered_calls']/parent::label");
    this.customColumnTotal_Outgoing_Calls = page.locator("//input[@id='col_total_outgoing_calls']/parent::label");
    this.customColumnTotal_Outgoing_Calls_Duration = page.locator("//input[@id='col_total_outgoing_calls_duration']/parent::label");
    this.customColumnTotal_Outgoing_Not_Answered_Calls = page.locator("//input[@id='col_total_outgoing_not_answered_calls']/parent::label");
    this.customColumnTotal_Site_Visit_Conducted = page.locator("//input[@id='col_total_site_visit_conducted']/parent::label");
    this.customColumnTotal_Site_Visit_Missed = page.locator("//input[@id='col_total_site_visit_missed']/parent::label");
    this.customColumnTotal_Site_Visit_Scheduled = page.locator("//input[@id='col_total_site_visit_scheduled']/parent::label");
    this.customColumnTouched_Untouched = page.locator("//input[@id='col_touched']/parent::label");

    this.resetCustomColumnButton = page.locator("#reset-columns");
    this.applyCustomColumnButton = page.locator("#apply-columns");

    this.getCustomColumnList = page.locator("#leads-container th[scope='col']");

    // Filter for all leads page
    this.funnelButton = page.locator("#ion_funnel_lead_profile");
    this.buttonClearAll = page.locator(".clear-all-filters.btn.btn-link.small");
    this.buttonApply = page.locator("button.apply-filter");

    // date filter
    this.dateFilter = page.locator("input.date_range");
    this.dateFilterDropdown = page.locator("div[style*='display'] .ranges li");

    // Per page count element
    this.perPageCountElement = page.locator(".page-link.form-select.page-select.float-right");


  }

  async selectPerPageCount(perPageCount: number){
    await this.utils.waitTillFullPageLoad(this.page);
    await this.perPageCountElement.scrollIntoViewIfNeeded();
    await this.perPageCountElement.selectOption(perPageCount.toString());
    await this.utils.loopWait(this.page,false);
  }

  async returnAllLeadsColumnNames(){
    await this.utils.waitTillFullPageLoad(this.page);
    const columnNames: string[] = [];
    for(let i = 0; i < (await this.getCustomColumnList.count()); i++){
      const text = await this.getCustomColumnList.nth(i).textContent();
      if(text){
        columnNames.push(text);
      }
    }
    return columnNames;
  }
  async getCountOfAllLeadsRows(){
    await this.utils.waitTillFullPageLoad(this.page);
    const count = await this.allLeadsRows.count();
    return count;
  }

  async clickOnFunnelButton(){
    await this.utils.waitTillFullPageLoad(this.page);
    await this.funnelButton.waitFor({ state: "visible" });
    await this.funnelButton.click();
  }

  async clearAllFilterButton(){
    await this.buttonClearAll.click();
    await this.utils.waitTillFullPageLoad(this.page);
  }

  async applyFilterButton(){
    await this.buttonApply.click();
    await this.utils.waitTillFullPageLoad(this.page);
  }

  async selectDateFilter(dateFilter: DateFilter){
    await this.dateFilter.waitFor({ state: "visible" });
    await this.dateFilter.click();
    await this.dateFilterDropdown.filter({hasText: dateFilter}).click();
    await this.applyFilterButton();
  }

  async selectSearchListByName(searchListName: string){
    await this.selectSearchList.waitFor({ state: "visible" });
    await this.selectSearchList.click();
    await this.enterSearchlistName.fill(searchListName);
    await this.page.keyboard.press("Enter");
    await this.utils.waitTillFullPageLoad(this.page);
  }

  async getCustomColumnListAllLeadsPage(): Promise<string[]>{
    await this.utils.waitTillFullPageLoad(this.page);
    const customColumnList = await this.getCustomColumnList.allTextContents();
    return customColumnList;
  }

  async openFilter(){
    await this.filterButton.waitFor({ state: "visible" });
    await this.filterButton.click();
  }

  async applyPrimarySalesPersonFilter(primarySalesPerson: string){
    await this.primarySalesPerson.scrollIntoViewIfNeeded();
    await this.primarySalesPerson.fill(primarySalesPerson);
    await this.highlatedSales.waitFor({ state: "visible" });
    await this.primarySalesPerson.press("Enter");
  }

  async applySubSourceFilter(subSource: string){
    await this.subsourceFilter.scrollIntoViewIfNeeded();
    await this.subsourceFilter.click();
    await this.subsourceFilterInput.fill(subSource);
    await this.highlatedSales.waitFor({ state: "visible" });
    await this.subsourceFilterInput.press("Enter");
  }

  async clickOnApplyFilterButton(){
    await this.applyButton.click();
    await this.utils.waitTillFullPageLoad(this.page);
  }

  async getCountOfSearchList(){
    const utils = new Utils();
    await this.HashElement.click();
    await utils.waitTillFullPageLoad(this.page);
    const count = (await this.HashElementText.textContent())?.replace(/[^0-9]/g, '');
    return count;
  }

  async getCountOfSearchList_ES(){
    const utils = new Utils();
    await utils.waitTillFullPageLoad(this.page);
    const count = (await this.HashElementText_ES.textContent())?.replace(/[^0-9]/g, '');
    return count;
  }

  async clearAllFilters(){
    await this.clearAllButton.waitFor({ state: "visible" });
    await this.clearAllButton.click();
  }

  async clickOnCustomColumnButton(){
    await this.customColumnButton.waitFor({ state: "visible" });
    await this.customColumnButton.click();
  }

  async clickOnResetCustomColumnButton(){
    await this.resetCustomColumnButton.waitFor({ state: "visible" });
    await this.resetCustomColumnButton.click();
  }

  async clickOnApplyCustomColumnButton(){
    await this.applyCustomColumnButton.waitFor({ state: "visible" });
    await this.applyCustomColumnButton.click();
  }

  async checkBHKCustomColumn(checkOrNot: boolean){
    if(checkOrNot){
      if(!await this.customColumnBHK.isChecked()){
        await this.customColumnBHK.check();
      }
    }else{
      if(await this.customColumnBHK.isChecked()){
        await this.customColumnBHK.uncheck();
      }
    }
  }

  async checkBathroomsCustomColumn(checkOrNot: boolean){
    if(checkOrNot){
      if(!await this.customColumnBathrooms.isChecked()){
        await this.customColumnBathrooms.check();
      }
    }else{
      if(await this.customColumnBathrooms.isChecked()){
        await this.customColumnBathrooms.uncheck();
      }
    }
  }

  async checkCall_LeadCustomColumn(checkOrNot: boolean){
    if(checkOrNot){
      if(!await this.customColumnCall_Lead.isChecked()){
        await this.customColumnCall_Lead.check();
      }
    }else{
      if(await this.customColumnCall_Lead.isChecked()){
        await this.customColumnCall_Lead.uncheck();
      }
    }
  }

  async checkCityCustomColumn(checkOrNot: boolean){
    if(checkOrNot){
      if(!await this.customColumnCity.isChecked()){
        await this.customColumnCity.check();
      }
    }else{
      if(await this.customColumnCity.isChecked()){
        await this.customColumnCity.uncheck();
      }
    }
  }

  async checkCountryCustomColumn(checkOrNot: boolean){
    if(checkOrNot){
      if(!await this.customColumnCountry.isChecked()){
        await this.customColumnCountry.check();
      }
    }else{
      if(await this.customColumnCountry.isChecked()){
        await this.customColumnCountry.uncheck();
      }
    }
  }
}