import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils.ts";

export class UnitListingPage{
    private readonly page: Page;
    private readonly utils: Utils;
    private readonly filterIcon: Locator;
    private readonly filterUnitDropdown: Locator;
    private readonly filterUnitInput: Locator;
    private readonly applyFilter : Locator;
    private readonly unitNameInTable: Locator;

    constructor(page: Page) {
        this.page = page;
        this.utils = new Utils();
        this.filterIcon = page.locator('.ion-funnel');
        this.filterUnitDropdown = page.getByRole('link',{name:'Select Unit'});
        this.filterUnitInput = page.locator('#select2-drop').getByRole('textbox');
        this.applyFilter = page.getByRole('link', {name:'Apply'});
        this.unitNameInTable = page.locator('table tbody tr td.text-truncate span.td-bold a');
     }
     async clickFilterIcon(){
        await this.filterIcon.click();
     }
     async filterSelectUnit(unitName:string){
        await this.filterUnitDropdown.click();
        await this.filterUnitInput.fill(unitName);
        await this.page.getByText(unitName).click();
     }
     async applyUnitFilter(){
       await this.applyFilter.click();
       await this.utils.waitTillFullPageLoad(this.page);
     }
     async getFilteredUnitName(): Promise<string> {
        await this.unitNameInTable.first().waitFor({ state: 'visible' });
        return await this.unitNameInTable.first().innerText();
     }
}