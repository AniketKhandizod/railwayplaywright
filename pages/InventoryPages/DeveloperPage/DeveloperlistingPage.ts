import { Page, Locator, expect } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils.ts";

export class DeveloperListingPage{
    private readonly page: Page;
    private readonly utils: Utils;
    private readonly Filter : Locator;
    private readonly FilterDeveloperDropdown : Locator;
    private readonly FilterDeveloperInput : Locator;
    private readonly ApplyFilter : Locator;

    constructor(page:Page){
      this.page = page;
      this.utils = new Utils();
      this.Filter = page.locator('.ion-funnel');
      this.FilterDeveloperDropdown = page.getByRole('link', { name: 'Select a Developer' });
      this.FilterDeveloperInput = page.locator('#select2-drop').getByRole('textbox');
      this.ApplyFilter = page.getByRole('link', { name: 'Apply' });
    }

    async clickFilter(){
       await this.Filter.click();
    }
    async filterSelectDeveloper(developerName:string){
       await this.FilterDeveloperDropdown.click();
       await this.FilterDeveloperInput.fill(developerName);
       await this.page.getByText(developerName).click();
       await this.page.waitForSelector('#select2-drop-mask', { state: 'hidden' });
    }
    async applyFilter(){
       await this.ApplyFilter.click();
       await this.utils.waitTillFullPageLoad(this.page);
    }
}