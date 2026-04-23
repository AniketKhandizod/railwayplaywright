import { Page, Locator, expect } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils.ts";

export class ProjectListingPage {
    private readonly page:Page;
    private readonly utils:Utils;
    private readonly Filter : Locator;
    private readonly FilterProjectDropdown : Locator;
    private readonly FilterProjectInput : Locator;
    private readonly ApplyFilter : Locator;

    constructor (page:Page){
        this.page = page;
        this.utils = new Utils();
        this.Filter = page.locator('.ion-funnel');
        this.FilterProjectDropdown = page.getByRole('link',{name:'Select a Project'});
        this.FilterProjectInput = page.locator('#select2-drop').getByRole('textbox');
        this.ApplyFilter = page.getByRole('link', {name:'Filter'});
    }
    async clickFilter(){
        await this.Filter.click();
    }
    async filterSelectProject(pName:string){
        await this.FilterProjectDropdown.click();
        await this.FilterProjectInput.fill(pName);
        await this.page.getByText(pName).click();
    }
    async applyFilter(){
       await this.ApplyFilter.click();
       await this.utils.waitTillFullPageLoad(this.page);
    }
}