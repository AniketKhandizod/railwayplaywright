import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils";

export class ReassignLeadForm {

    private readonly page: Page;
    private readonly utils: Utils;
    private readonly selectReassingToTeam: Locator;
    private readonly selectReassingToProject: Locator;
    private readonly enterReassingToTeamName: Locator;
    private readonly dropDownTeamList: Locator;
    private readonly selectSalesForReassingElement: Locator;
    private readonly reassingButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.utils = new Utils();

        // Choose team
        this.selectReassingToTeam = page.locator("#reassignLead .select2-container.form-control.reassign_lead_team a");
        this.enterReassingToTeamName = page.locator("#select2-drop  .select2-search input.select2-input");
        this.dropDownTeamList = page.locator(".select2-result-label");

        // Choose Team
        this.selectSalesForReassingElement = page.locator(".select2-container.all_active_users.form-control a");

        // Choose Project
        this.selectReassingToProject = page.locator("div.modal-body.mt-2 div.select2-container.form-control.reassign_lead_project a");

        // Reassing Button
        this.reassingButton = page.locator("button.reassign_lead ");

    }
   
    async selectTeam(teamName: string) {
        await this.selectReassingToTeam.click();
        await this.enterReassingToTeamName.fill(teamName);
        await this.dropDownTeamList.filter({ hasText: teamName }).first().click();
    }

    async selectProject(projectName: string) {
        await this.selectReassingToProject.click();
        await this.enterReassingToTeamName.fill(projectName);
        await this.dropDownTeamList.filter({ hasText: projectName }).first().click();
    }
    
    async selectSalesForReassing(salesName: string) {
        await this.selectSalesForReassingElement.click();
        await this.enterReassingToTeamName.fill(salesName);
        await this.dropDownTeamList.filter({ hasText: salesName }).first().click();
    }

    async getSalesCountInDropdown() {
        await this.selectSalesForReassingElement.click();
        return await this.dropDownTeamList.count();
    }

    async clickOnReassingButton() {
        await this.reassingButton.click();
    }

}