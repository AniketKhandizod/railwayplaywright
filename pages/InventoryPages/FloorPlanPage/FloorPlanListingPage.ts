import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils.ts";

export class FloorPlanListingPage {
    private readonly page: Page;
    private readonly utils: Utils;
    private readonly filterLink: Locator;
    private readonly filterFPDropdown: Locator;
    private readonly filterFPInput: Locator;
    private readonly selectFilterInput: Locator;
    private readonly applyFilter: Locator;
    
constructor (page:Page){
    this.page= page;
    this.utils = new Utils();
    this.filterLink = page.locator('.ion-funnel');
    this.filterFPDropdown = page.getByRole('link', { name: 'Select a Floor Plan' });
    this.filterFPInput = page.locator('#select2-drop').getByRole('textbox');
    this.selectFilterInput = page.locator('.select2-results li.select2-highlighted');
    this.applyFilter = page.getByRole('link', {name:'Filter'}); 
}
async clickFilter(){
    await this.filterLink.click();
}
async filterSelectedFP(fpName:string){
    await this.filterFPDropdown.click();
    await this.filterFPInput.fill(fpName);
    await this.selectFilterInput.filter({hasText:fpName});   
    await this.selectFilterInput.waitFor({ state: 'visible' });
    await this.selectFilterInput.click();         
}
async clickApplyFilter(){
    await this.applyFilter.click();
    await this.utils.waitTillFullPageLoad(this.page);
}
}