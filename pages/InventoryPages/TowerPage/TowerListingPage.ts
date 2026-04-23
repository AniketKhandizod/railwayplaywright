import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils.ts";

export class TowerListingPage {
private readonly page:Page;
private readonly utils: Utils;
private readonly filterLink : Locator;
private readonly filterTowerDropdown : Locator;
private readonly filterTowerInput : Locator;
private readonly selectFilterInput : Locator;
private readonly applyFilter : Locator;

constructor (page:Page){
    this.page= page;
    this.utils = new Utils();
    this.filterLink = page.locator('.ion-funnel');
    this.filterTowerDropdown = page.locator('#s2id_autogen3');
    this.filterTowerInput = page.locator('#select2-drop').getByRole('textbox');
    this.selectFilterInput = page.locator('.select2-results li.select2-highlighted');
    this.applyFilter = page.getByRole('link', {name:'Apply'});    
}
async clickFilter(){
    await this.filterLink.click();
}
async filterSelectedTower(tName:string){
    await this.filterTowerDropdown.click();
    await this.filterTowerInput.fill(tName);
    await this.utils.sleep(2000);
    await this.selectFilterInput.click();    
    await this.utils.sleep(2000);    
}
async clickApplyFilter(){
    await this.applyFilter.click();
    await this.utils.waitTillFullPageLoad(this.page);
}
}
