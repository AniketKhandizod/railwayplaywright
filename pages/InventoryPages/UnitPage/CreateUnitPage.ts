import { Page, Locator, } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils.ts";

export enum propertyPurpose {
    sale = 'Sale',
    resale = 'Resale',
    rental = 'Rental'
}
export enum bedroom{
    one_bedroom = '1',
    two_bedroom = '2',
    three_bedroom = '3',
    four_bedroom = '4'
}
export enum bathroom{
    one_bathroom = '1',
    two_bathroom = '2',
    three_bathroom = '3'
}
export class CreateUnitPage{
    private readonly page: Page;
    private readonly utils: Utils;
    private readonly newUnitLink: Locator;
    private readonly selectDeveloperLink: Locator;
    private readonly devNameInput: Locator;
    private readonly devNameChoose: Locator;
    private readonly selectProject: Locator;
    private readonly projectInput: Locator;
    private readonly selectTower: Locator;
    private readonly towerInput: Locator;
    private readonly selectUnitConfiguration: Locator;
    private readonly unitConfigurationInput: Locator;    
    private readonly unitName: Locator;
    private readonly propertyPurposeInput: Locator;
    private readonly propertyPurposeChoose: Locator;
    private readonly floornum: Locator;
    private readonly bedroomsDropdown: Locator;
    private readonly chooseBedroom: Locator;
    private readonly bathroomsDropdown: Locator;    
    private readonly chooseBathroom: Locator;
    private readonly save: Locator;
    private readonly unitNameElement: Locator;
    private readonly allUnitsLink: Locator;

 constructor(page: Page) {
        this.page = page;
        this.utils = new Utils();
        this.newUnitLink = page.getByRole('link', { name: 'New Unit' });
        this.selectDeveloperLink = page.getByRole('link', { name: 'Select a Developer' });
        this.devNameInput = page.locator('#select2-drop').getByRole('textbox');
        this.devNameChoose = page.locator('.select2-results li');
        this.selectProject = page.getByRole('link', { name: 'Select a Project', exact: true });
        this.projectInput = page.locator('#select2-drop').getByRole('textbox');        
        this.selectTower = page.getByRole('link', { name: 'Select a Project Tower' });
        this.towerInput = page.locator('#select2-drop').getByRole('textbox');        
        this.selectUnitConfiguration = page.getByRole('link', { name: 'Select a Floor Plan' }); 
        this.unitConfigurationInput = page.locator('#select2-drop').getByRole('textbox');        
        this.unitName = page.locator('#project_unit_name');
        this.propertyPurposeInput = page.locator('#s2id_project_unit_property_purpose');
        this.propertyPurposeChoose = page.locator('#select2-drop');
        this.floornum = page.getByRole('spinbutton', { name: 'Floor *' });
        this.bedroomsDropdown = page.locator('#s2id_project_unit_bedrooms');
        this.chooseBedroom = page.locator('.select2-results li');       
        this.bathroomsDropdown = page.locator('#s2id_project_unit_bathrooms');
        this.chooseBathroom = page.locator('.select2-results li');
        this.save = page.getByRole('button', { name: 'Save' });
        this.unitNameElement = page.locator('.lead');   
        this.allUnitsLink = page.getByRole('navigation', { name: 'breadcrumb' }).getByRole('link', { name: 'All Units' });
 }

    async clickOnNewUnit() {
        await this.newUnitLink.click();
        await this.utils.waitTillFullPageLoad(this.page);
    }
    async selectDeveloperForUnitCreation(developerName: string) {
        await this.selectDeveloperLink.click();
        await this.devNameInput.fill(developerName);
        await this.devNameChoose.waitFor({state:'visible'});
        await this.devNameChoose.filter({ hasText: developerName }).click();
    } 
    async selectProjectForUnitCreation(projectName: string){
        await this.selectProject.click();
        await this.projectInput.fill(projectName);
        await this.page.getByText(projectName).click();
    }
    async selectTowerForUnitCreation(towerName: string){
        await this.selectTower.click();
        await this.towerInput.fill(towerName);
        await this.page.getByText(towerName).click();
    }
    async selectUnitConfigurationForUnitCreation(floorPlanName:string){
        await this.selectUnitConfiguration.click();
        await this.unitConfigurationInput.fill(floorPlanName);
        await this.page.getByText(floorPlanName).click();        
    }
    async enterUnitName(unitname:string){
        await this.unitName.fill(unitname);
    }
      async enterFloorNumber(floornumber:string){
        await this.floornum.click();
        await this.floornum.evaluate((element: HTMLInputElement) => {element.value = '';});
        await this.floornum.fill(floornumber);
    }
    async selectPropertyPurpose(type: propertyPurpose):Promise<void>{
        await this.propertyPurposeInput.click();
        await this.propertyPurposeChoose.getByText(type, { exact: true }).click();
    }
    async selectBedrooms(type: bedroom):Promise<void> {
        await this.bedroomsDropdown.click();
        await this.chooseBedroom.filter({ hasText: type }).click();
    }    
    async selectBathrooms(type: bathroom):Promise<void> {
        await this.bathroomsDropdown.click();
        await this.chooseBathroom.filter({ hasText: type }).click();
    }
    async clickSave(){
        await this.save.click();
        await this.utils.waitTillFullPageLoad(this.page);        
    }
    async getUnitNameFromPage(): Promise<string> {
        return await this.unitNameElement.innerText();
    }
    async clickAllUnits() {
        await this.allUnitsLink.click();
        await this.utils.waitTillFullPageLoad(this.page);
    }    
}