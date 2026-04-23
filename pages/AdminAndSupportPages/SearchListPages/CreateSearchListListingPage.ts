import { Locator, Page } from "@playwright/test";

export enum Purpose {
    Marketing = 'Marketing',
    Export = 'Export',
    Sales = 'Sales',
    PreSales = 'Pre Sales',
}
export class CreateSearchListPage {

    private page: Page;
    private searchListName: Locator;
    private scheduleActivity: Locator;
    private selectTheOrder: Locator;
    private scheduleActivityDropdown: Locator;
    private selectTheOrderDropdown: Locator;
    private searchListPrimarySalesPerson: Locator;
    private purpose: Locator;
    private purposeDropdown: Locator;
    private displayOnUsersDashboard: Locator;
    private interestedProjects: Locator;
    private projects: Locator;
    private projectDrodown: Locator;
    private save: Locator;
    private saveSuccessBar: Locator;

    constructor(page: Page) {
        this.page = page;
        this.searchListName = page.getByRole('textbox', { name: 'Name *' });

        this.scheduleActivity = page.getByRole('link', { name: 'Future Activity' });
        this.scheduleActivityDropdown = page.locator('#select2-drop').getByText('Lead received on');

        this.selectTheOrder = page.getByRole('link', { name: 'Select the order' });
        this.selectTheOrderDropdown = page.getByText('Descending');

        this.searchListPrimarySalesPerson = page.getByRole('textbox', { name: 'Primary sales person ids' });

        this.purpose = page.locator('#s2id_search_criterium_available_for input');
        this.purposeDropdown = page.locator('#select2-drop');

        this.displayOnUsersDashboard = page.getByText('Display on User\'s Dashboard');

        this.interestedProjects = page.getByRole('tab', { name: 'Interested projects' });
        this.projects = page.getByRole('link', { name: 'Projects' });
        this.projectDrodown = page.locator("div[class='select2-result-label']");
        this.save = page.getByRole('button', { name: 'Save' });

        this.saveSuccessBar = page.locator("div[class='noty_message']");
    }

    async createSearchListListing(searchListName: string) {
        await this.searchListName.fill(searchListName);
    }

    async selectScheduleActivity() {
        await this.scheduleActivity.click();
        await this.scheduleActivityDropdown.click();
    }

    async selectSelectTheOrder() {
        await this.selectTheOrder.click();
        await this.selectTheOrderDropdown.click();
    }

    async selectRange(startDate: string, endDate: string) {
        await this.range.click();
        await this.rangeDropdown.click();
    }

    async selectSearchListPrimarySalesPerson(primarySalesPerson: string) {
        await this.searchListPrimarySalesPerson.fill(primarySalesPerson);
        await this.searchListPrimarySalesPerson.press('Enter');
    }

    async selectPurpose(purposeEnum: Purpose) {
        await this.purpose.click();
        await this.purposeDropdown.getByText(purposeEnum).first().click();
    }

    async selectDisplayOnUsersDashboard(isChecked: boolean) {
        if (isChecked) {
            await this.displayOnUsersDashboard.check();
        } else {
            await this.displayOnUsersDashboard.uncheck();
        }
    }

    async navigateToInterestedProjectPanal() {
        await this.interestedProjects.click();
    }

    async selectProject(projectName: string) {
        await this.projects.click();
        await this.projectDrodown.filter({ hasText: projectName }).click();
    }

    async saveSearchList() : Promise<string | null> {
        await this.save.click();
        await this.save.waitFor({ state: 'hidden' });
        await this.saveSuccessBar.waitFor({ state: 'visible' });
        const status = await this.saveSuccessBar.textContent();
        await this.saveSuccessBar.waitFor({ state: 'hidden' });
        return status;
    }

}


