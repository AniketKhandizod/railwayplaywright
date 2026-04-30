import { Locator, Page } from "@playwright/test";
import { Utils } from '../../../utils/PlaywrightTestUtils.ts';

export class SearchListListingPage {

    private page: Page;
    private utils:Utils; 
    private newList: Locator;
    private funnel: Locator;
    private searchListName: Locator;
    private searchListNameInput: Locator;
    private apply: Locator;
    private actionThreeDots: Locator;
    private getCount: Locator;
    private getCountElement: Locator;
    private EditSearchList: Locator;
    private waitUntilHighlighted: Locator;
    private closeTotalCountPopup: Locator;
    private firstSearchListName: Locator;
    private firstSearchListCreationDate: Locator;
    private firstSearchListType: Locator;
    private firstSearchListAvailableFor: Locator;

    constructor(page: Page) {
        this.page = page;
        this.utils = new Utils();
        this.newList = page.getByRole('link', { name: 'New List' });
        this.funnel = page.locator("button[class='btn btn-light btn-icon toggle-filters']");
        this.searchListName = page.getByRole('link', { name: 'Search by Name',exact :true});
        this.searchListNameInput = page.locator('#select2-drop').getByRole('textbox');
        this.apply = page.getByRole('button', { name: 'Apply' });
        this.waitUntilHighlighted = page.locator("li[class='select2-results-dept-0 select2-result select2-result-selectable select2-highlighted']");

        this.actionThreeDots = page.locator("#btn-list-actions i");
        this.getCount = page.locator(".get_search_criteria_count.dropdown-item");
        this.EditSearchList = page.locator("(//a[@title='Edit'])[1]");
        this.getCountElement = page.getByText('The count of leads in');

        this.closeTotalCountPopup = page.locator("button[class='btn btn-outline-primary']");

        this.firstSearchListName = page.locator("//table[@class='table table-responsive']//tr[1]/td[1]/span[1]");
        this.firstSearchListCreationDate = page.locator("//table[@class='table table-responsive']//tr[1]/td[1]/span[2]");
        this.firstSearchListType = page.locator("//table[@class='table table-responsive']//tr[1]/td[2]/span[1]");
        this.firstSearchListAvailableFor = page.locator("//table[@class='table table-responsive']//tr[1]/td[3]");

    }

    async navigateToSearchListListing() {
        await this.newList.click();
    }

    async searchListSearchByName(searchListName: string) {
        await this.funnel.click();
        await this.searchListName.click();
        await this.searchListNameInput.fill(searchListName);
        await this.waitUntilHighlighted.waitFor({ state: 'visible' });
        await this.searchListNameInput.press('Enter');
        await this.apply.click();
    }

    async getCountOfLeads() : Promise<string | null> {
        await this.actionThreeDots.nth(0).click();
        await this.getCount.nth(0).click();
        await this.getCountElement.waitFor({ state: 'visible' });
        const count = await this.getCountElement.textContent();
        await this.closeTotalCountPopup.click();
        await this.utils.loopWait(this.page,false);
        return count;
    }

    async clickOnEditSearchList(): Promise<string | null>{
        await this.actionThreeDots.nth(0).click();
        await this.EditSearchList.nth(0).click();
        const url = await this.page.url();
        const id = url.match(/\/client\/search_criteria\/([a-z0-9]+)\/edit/)?.[1] ?? null;
        return id;
    }

    async getFirstSearchListName() : Promise<string | null> {
        return (await this.firstSearchListName.textContent())?.toLowerCase().trim() || null;
    }

    async getFirstSearchListCreationDate() : Promise<string | null> {
        return (await this.firstSearchListCreationDate.textContent())?.trim() || null;
    }

    async getFirstSearchListType() : Promise<string | null> {
        return (await this.firstSearchListType.textContent())?.toLowerCase().trim() || null;
    }

    async getFirstSearchListAvailableFor() : Promise<string | null> {
        return (await this.firstSearchListAvailableFor.textContent())?.toLowerCase().trim() || null;
    }
}


