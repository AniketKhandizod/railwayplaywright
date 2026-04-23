import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils.ts";

export class CreateFloorPlanPage {
    private readonly page: Page;
    private readonly utils: Utils;
    private readonly newFloorPlanLink: Locator;
    private readonly saveButton: Locator;    
    private readonly selectDeveloperLink: Locator;
    private readonly developerSearchInput: Locator;  
    private readonly chooseDeveloper: Locator;  
    private readonly selectProjectLink: Locator;
    private readonly projectSearchInput: Locator;   
    private readonly selectProjectTowerLink: Locator;
    private readonly projectTowerSearchInput: Locator;    
    private readonly floorPlanNameInput: Locator;
    private readonly unitTypeDropdown: Locator;
    private readonly unitCategoryDropdown: Locator;
    private readonly bedroomsDropdown: Locator;
    private readonly chooseBedroom: Locator;
    private readonly bathroomsDropdown: Locator;    
    private readonly chooseBathroom: Locator;
    private readonly carpetAreaInput: Locator;
    private readonly saleableAreaInput: Locator;
    private readonly loadingInput: Locator;
    private readonly coveredAreaInput: Locator;
    private readonly terraceAreaInput: Locator;        
    private readonly baseRateInput: Locator;
    private readonly fpNameElement: Locator;
    private readonly allFPLink: Locator;
    
    constructor(page: Page) {
        this.page = page;
        this.utils = new Utils();
        
        this.newFloorPlanLink = page.getByRole('link', { name: 'New Floor Plan' });
        this.saveButton = page.getByRole('button', { name: 'Save' });        
        this.selectDeveloperLink = page.getByRole('link', { name: 'Select a Developer' });
        this.developerSearchInput = page.locator('#select2-drop').getByRole('textbox');   
        this.chooseDeveloper = page.locator('.select2-results li');
        this.selectProjectLink = page.getByRole('link', { name: 'Select a Project', exact: true });
        this.projectSearchInput = page.locator('#select2-drop').getByRole('textbox');                
        this.selectProjectTowerLink = page.getByRole('link', { name: 'Select a Project Tower' });
        this.projectTowerSearchInput = page.locator('#select2-drop').getByRole('textbox');    
        this.floorPlanNameInput = page.locator('#unit_configuration_name');
        this.unitTypeDropdown = page.locator('#s2id_unit_configuration_type').getByRole('link');
        this.unitCategoryDropdown = page.locator('#s2id_unit_configuration_category').getByRole('link');
        this.bedroomsDropdown = page.locator('#s2id_unit_configuration_bedrooms');
        this.chooseBedroom = page.locator('.select2-results li');
        this.bathroomsDropdown = page.locator('#s2id_unit_configuration_bathrooms');
        this.chooseBathroom = page.locator('.select2-results li');
        this.carpetAreaInput = page.getByRole('textbox', { name: 'Carpet *' });
        this.saleableAreaInput = page.getByRole('textbox', { name: 'Saleable *' });
        this.loadingInput = page.getByRole('textbox', { name: 'Loading *' });
        this.coveredAreaInput = page.locator('#unit_configuration_covered_area');
        this.terraceAreaInput = page.getByRole('textbox', { name: 'Terrace area' });        
        this.baseRateInput = page.getByRole('textbox', { name: 'Base rate *' });
        this.fpNameElement = page.locator('.lead');   
        this.allFPLink = page.getByRole('navigation', { name: 'breadcrumb' }).getByRole('link', { name: 'All Floor Plans' });   
    }
    
    async clickOnNewFloorPlan() {
        await this.newFloorPlanLink.click();
        await this.utils.waitTillFullPageLoad(this.page);
    }
    async selectDeveloper(developerName: string) {
        await this.selectDeveloperLink.click();
        await this.developerSearchInput.fill(developerName);
        await this.chooseDeveloper.waitFor({state:'visible'});
        await this.chooseDeveloper.filter({ hasText: developerName }).click();
    }   
    async selectProject(projectName: string) {
        await this.selectProjectLink.click();
        await this.projectSearchInput.fill(projectName);
        await this.page.getByText(projectName).click();
    }    
    async selectProjectTower(towerName: string) {
        await this.selectProjectTowerLink.click();
        await this.projectTowerSearchInput.fill(towerName);
        await this.page.getByText(towerName).click();
    }    
    async enterFloorPlanName(floorPlanName: string) {
        await this.floorPlanNameInput.click();
        await this.floorPlanNameInput.fill(floorPlanName);
    }
      async selectUnitType(unitType:string) {
        await this.unitTypeDropdown.click();
        await this.page.getByText(unitType).click();
    }
     async selectUnitCategory(unitCategory:string) {
        await this.unitCategoryDropdown.click();
        await this.page.getByText(unitCategory).click();
    }    
    async selectBedrooms(bed:string) {
        await this.bedroomsDropdown.click();
        await this.chooseBedroom.filter({ hasText: bed }).click();
    }    
    async selectBathrooms(bath:string) {
        await this.bathroomsDropdown.click();
        await this.chooseBathroom.filter({ hasText: bath }).click();
    }
    async enterCarpetArea(area: string) {
        await this.carpetAreaInput.click();
        await this.carpetAreaInput.fill(area);
    }    
    async enterSaleableArea(area: string) {
        await this.saleableAreaInput.click();
        await this.saleableAreaInput.fill(area);
        await this.saleableAreaInput.press('Tab');
    }
    async enterLoading(loading: string) {
        await this.loadingInput.click();
        await this.loadingInput.fill(loading);
        await this.loadingInput.press('Tab');
    }    
    async enterCoveredArea(area: string) {
        await this.coveredAreaInput.fill(area);
    }
    async enterTerraceArea(area: string) {
        await this.terraceAreaInput.click();
        await this.terraceAreaInput.fill(area);
    }    
    async enterBaseRate(rate: string) {
        await this.baseRateInput.fill(rate);
        await this.baseRateInput.press('Tab');
    }       
    async clickSave() {
        await this.saveButton.click();
        await this.utils.waitTillFullPageLoad(this.page);
    }
    async getFloorPlanNameFromPage(): Promise<string> {
        return await this.fpNameElement.innerText();
    }
    async clickAllFloorPlans() {
        await this.allFPLink.click();
        await this.utils.waitTillFullPageLoad(this.page);
    }
} 
    
