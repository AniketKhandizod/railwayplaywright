import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils.ts";

export class CreateTowerPage {
    private readonly page: Page;
    private readonly utils: Utils;
    private readonly newTowerButton: Locator;
    private readonly towerNameInput: Locator;
    private readonly projectNameLink: Locator;
    private readonly projectSearchInput: Locator;
    private readonly projectSelectOption: Locator;
    private readonly totalFloorsInput: Locator;
    private readonly saveButton: Locator;
    private readonly towerNameElement : Locator;
    private readonly projectTowerStagesLink: Locator;
    private readonly paymentSchedulesLink: Locator;
    private readonly schemesLink: Locator;
    private readonly backToProjectTowerLink: Locator;
    private readonly allTowersLink : Locator;

    constructor(page: Page) {
        this.page = page;
        this.utils = new Utils();
        this.newTowerButton = page.locator('.btn-group').getByText('New Tower');
        this.towerNameInput = page.locator('#project_tower_name');
        this.projectNameLink = page.getByRole('link', { name: 'Project Name' });
        this.projectSearchInput = page.locator('#select2-drop').getByRole('textbox');
        this.projectSelectOption = page.getByText('smoke', { exact: true });
        this.totalFloorsInput = page.getByRole('textbox', { name: 'Total floors *' });
        this.saveButton = page.getByRole('button', { name: 'Save' });
        this.projectTowerStagesLink = page.getByRole('link', { name: 'Project Tower Stages' });
        this.paymentSchedulesLink = page.getByRole('link', { name: 'Payment Schedules' });
        this.schemesLink = page.getByRole('link', { name: 'Schemes' });
        this.backToProjectTowerLink = page.getByRole('link', { name: 'Back to project tower' });
        this.towerNameElement = page.locator('.lead');
        this.allTowersLink = page.getByRole('link', {name: 'All Project Towers', exact: true});
    }

    async clickNewTower(): Promise<void> {
        await this.newTowerButton.click();
        await this.utils.waitTillFullPageLoad(this.page);
    }

    async enterTowerName(towerName: string): Promise<void> {
        await this.towerNameInput.fill(towerName);
    }

    async selectProject(projectName: string): Promise<void> {
        await this.projectNameLink.click();
        await this.projectSearchInput.fill(projectName);
        await this.projectSelectOption.click();
    }

    async enterTotalFloors(floors: string): Promise<void> {
        await this.totalFloorsInput.click();
        await this.totalFloorsInput.fill(floors);
    }

    async clickSave(): Promise<void> {
        await this.saveButton.click();
        await this.utils.waitTillFullPageLoad(this.page);
    }

    async getTowerNameFromPage(): Promise<string> {
        return await this.towerNameElement.innerText();
    }

    async clickProjectTowerStages(): Promise<void> {
        await this.projectTowerStagesLink.click();
        await this.utils.waitTillFullPageLoad(this.page);
    }

    async clickPaymentSchedules(): Promise<void> {
        await this.paymentSchedulesLink.click();
        await this.utils.waitTillFullPageLoad(this.page);
    }

    async clickSchemes(): Promise<void> {
        await this.schemesLink.click();
        await this.utils.waitTillFullPageLoad(this.page);
    }

    async clickBackToProjectTower(): Promise<void> {
        await this.backToProjectTowerLink.click();
        await this.utils.waitTillFullPageLoad(this.page);
    }
    async clickAllProjectTower() {
        await this.allTowersLink.click();
        await this.utils.waitTillFullPageLoad(this.page);
    }

}
