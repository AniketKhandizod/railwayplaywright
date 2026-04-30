import { Page, Locator } from "@playwright/test";

export class ImportConfigurationPage {
  private readonly page: Page;
  private readonly AdminEmail: Locator;
  private readonly Continue: Locator;
  private readonly Continue2: Locator;
  private readonly ProjectElement: Locator;
  private readonly chooseProjectElement: Locator;
  private readonly CampaignElement: Locator;
  private readonly CampaignElementDropdownValue: Locator;
  private readonly SourceElement: Locator;
  private readonly SubSourceElement: Locator;
  private readonly DepartmentElement: Locator;
  private readonly DepartmentElementEnterValue: Locator;
  private readonly DepartmentElementHighlighted: Locator;
  private readonly TeamElement: Locator;
  private readonly TeamElementEnterValue: Locator;
  private readonly MediumElement: Locator;
  private readonly TeamElementHighlighted: Locator;
  private readonly SalesElement: Locator;
  private readonly LeadStageElement: Locator;
  private readonly ProjectElementForLeadImport: Locator;

  constructor(page: Page) {
    this.page = page;
    this.AdminEmail = page.locator('#s2id_autogen1');
    this.Continue = page.getByRole('link', { name: 'Continue' });
    this.Continue2 = page.getByRole('button', { name: 'Continue' });
    this.chooseProjectElement = page.locator("#s2id_bulk_upload_sv_project .select2-chosen");
    this.ProjectElement = page.locator("#select2-drop input");
    this.ProjectElementForLeadImport = page.locator("#s2id_bulk_upload_sv_project .select2-chosen");

    // Campaign
    this.CampaignElement = page.locator("#s2id_bulk_upload_campaign .select2-chosen");
    this.CampaignElementDropdownValue = page.locator("li.select2-result-selectable");

    // Source
    this.SourceElement = page.locator("#s2id_bulk_upload_source .select2-chosen");

    // Sub-source
    this.SubSourceElement = page.locator("#s2id_bulk_upload_sub_source .select2-chosen");

    // Medium
    this.MediumElement = page.locator("#s2id_bulk_upload_medium_type .select2-chosen");

    // Department
    this.DepartmentElement = page.locator(".select2-container.department.form-control .select2-chosen");

    // Team
    this.TeamElement = page.locator("div[class$='team form-control required'] .select2-input.select2-default");

    // Sales
    this.SalesElement = page.locator("#s2id_bulk_upload_sales_ids .select2-input.select2-default");

    // Project
    this.ProjectElement = page.locator("#s2id_bulk_upload_projects .select2-chosen");

    // lead Stage
    this.LeadStageElement = page.locator("#s2id_bulk_upload_stage .select2-chosen");

  }

  async addAdminEmail(adminEmail: string) {
    await this.AdminEmail.fill(adminEmail);
    await this.AdminEmail.press('Enter');
    await this.Continue.click();
    this.page.once('dialog', dialog => {
     // console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept().catch(() => {});
    });
    await this.Continue2.click();
    await this.Continue2.waitFor({ state: 'hidden' });
  }

  async chooseProjectForLeadImport(projectName: string) {
      await this.ProjectElementForLeadImport.click();
      await this.CampaignElementDropdownValue.filter({ hasText: projectName }).first().click();
  }

  async selectCampaign(campaignName: string) {
    await this.CampaignElement.click();
    await this.CampaignElementDropdownValue.filter({ hasText: campaignName }).first().click();
  }

  async selectSource(sourceName: string) {
    await this.SourceElement.click();
    await this.CampaignElementDropdownValue.filter({ hasText: sourceName }).first().click();
  }

  async selectSubSource(subSourceName: string) {
    await this.SubSourceElement.click();
    await this.CampaignElementDropdownValue.filter({ hasText: subSourceName }).first().click();
  }

  async selectDepartment(departmentName: string) {
    await this.DepartmentElement.click();
    await this.CampaignElementDropdownValue.filter({ hasText: departmentName }).first().click();
  }

  async selectMedium(mediumName: string) {
    await this.MediumElement.click();
    await this.CampaignElementDropdownValue.filter({ hasText: mediumName }).first().click();
  }

  async selectTeam(teamName: string) {
    await this.TeamElement.click();
    await this.CampaignElementDropdownValue.filter({ hasText: teamName }).first().click();
  }

  async selectSales(salesName: string) {
    await this.SalesElement.click();
    await this.CampaignElementDropdownValue.filter({ hasText: salesName }).first().click();
  }

  async selectProject(projectName: string) {
    await this.ProjectElement.click();
    await this.CampaignElementDropdownValue.filter({ hasText: projectName }).first().click();
  }

  async selectLeadStage(leadStageName: string) {
    await this.LeadStageElement.click();
    await this.CampaignElementDropdownValue.filter({ hasText: leadStageName }).first().click();
  }


}