import { Page, Locator } from "@playwright/test";
import { QuickAddUnitByPurposeData } from "../../../dataProvider/TestDataForQuickAddUnitByPurpose.ts";

export enum UnitType {
    residential = 'residential',
    commercial = 'commercial'
}
export enum UnitCategory {
    apartment = 'apartment',
    villa = 'villa',
    penthouse = 'penthouse'
}
export enum FurnishingType {
    furnished = 'furnished',
    semi_furnished = 'semi_furnished',
    unfurnished = 'unfurnished'
}
export enum PropertyPurpose {
    sale = 'sale',
    resale = 'resale',
    rental = 'rental'
}
export enum BHKType {
    one_bhk = '1 BHK',
    two_bhk = '2 BHK',
    three_bhk = '3 BHK',
    four_bhk = '4 BHK'
}
export enum Salutation{
    mr = 'Mr.',
    mrs = 'Mrs.',
    ms = 'Ms.',
    Dr = 'Dr.',
}
export class QuickAddUnitPage {
    private readonly page: Page;        
    private readonly saleButton: Locator;
    private readonly projectLink: Locator;
    private readonly projectInput: Locator;
    private readonly enterProjectTowerLink: Locator;
    private readonly towerInput: Locator;
    private readonly unitNameDropdown: Locator;
    private readonly unitNameInput: Locator;
    private readonly floorInput: Locator;
    private readonly carpetAreaInput: Locator;
    private readonly saleableAreaInput: Locator;
    private readonly baseRateInput: Locator;
    private readonly publishDropdown: Locator;
    private readonly publishAndNextButton: Locator;
    private readonly selectAllAmenitiesCheckbox: Locator;
    private readonly otherDetailsLink: Locator;
    private readonly saveButton: Locator;
    private readonly finalSaveLink: Locator;
    private readonly successMessage: Locator;
    private readonly resaleButton: Locator;
    private readonly rentalButton: Locator;
    private readonly monthlyRentInput: Locator;
    private readonly securityAmountInput: Locator;
    private readonly maintenanceAmountInput: Locator;
    private readonly agreementValueInput: Locator;
    private readonly allInclusivePriceInput: Locator;
    private readonly salutationInput: Locator;
    private readonly chooseSalutation: Locator;
    private readonly firstNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly phoneInput: Locator;
    private readonly emailInput: Locator;

    constructor(page: Page) {
        this.page = page;
        this.saleButton = page.getByRole('img', { name: 'sale', exact: true });
        this.projectLink = page.getByRole('link', { name: 'Project', exact: true });
        this.projectInput = page.locator('#select2-drop').getByRole('textbox');
        this.enterProjectTowerLink = page.getByRole('link', { name: 'Enter project tower' });
        this.towerInput = page.locator('#select2-drop').getByRole('textbox');
        this.unitNameDropdown = page.locator('#s2id_unit_name');
        this.unitNameInput = page.locator('#select2-drop').getByRole('textbox');
        this.floorInput = page.locator('#floor');
        this.carpetAreaInput = page.getByPlaceholder('Enter Carpet Area');
        this.saleableAreaInput = page.getByPlaceholder('Enter Saleable Area');
        this.baseRateInput = page.getByPlaceholder('Enter base Rate');
        this.publishDropdown = page.locator('#dropdownMenuButton');
        this.publishAndNextButton = page.locator('.dropdown-item.publish_and_next.publish-unit-button');
        this.selectAllAmenitiesCheckbox = page.locator('#select-all-amenities');
        this.otherDetailsLink = page.getByRole('link', { name: 'Other Details' });
        this.saveButton = page.getByRole('button', { name: 'Save' });
        this.finalSaveLink = page.getByRole('link', { name: 'Save', exact: true });
        this.successMessage = page.getByText("Unit is successfully updated.");
        this.resaleButton = page.getByRole('img', { name: 'resale', exact: true });
        this.rentalButton = page.getByRole('img', { name: 'rental', exact: true });
        this.monthlyRentInput = page.locator('#calculated_agreement_value');
        this.securityAmountInput = page.locator('#security_amount');
        this.maintenanceAmountInput = page.locator('#maintenance_amount');
        this.agreementValueInput = page.locator('#calculated_agreement_value');
        this.allInclusivePriceInput = page.locator('#calculated_total_price');
        this.salutationInput = page.locator('#s2id_project_unit_contact_salutation');
        this.chooseSalutation = page.locator('.select2-results li');  
        this.firstNameInput = page.locator('#project_unit_contact_first_name');
        this.lastNameInput = page.locator('#project_unit_contact_last_name');
        this.phoneInput = page.locator('input[placeholder="Phone"]').first();
        this.emailInput = page.locator('.email.form-control');
    }
    async selectProject(projectName: string): Promise<void> {
        await this.projectLink.click();
        await this.projectInput.fill(projectName);
        await this.page.getByText(projectName).click();
    }       
    async selectUnitType(type: UnitType): Promise<void> {
        await this.page.getByRole('img', { name: type, exact: true }).click();
    }
    async selectUnitCategory(category: UnitCategory): Promise<void> {
        await this.page.getByRole('img', { name: category, exact: true }).click();
    }
    async selectFurnishingType(type: FurnishingType): Promise<void> {
        await this.page.getByRole('img', { name: type, exact: true }).click();
    }
    async selectProjectTower(towerName: string): Promise<void> {
        await this.enterProjectTowerLink.click();
        await this.towerInput.fill(towerName);
        await this.page.getByText(towerName).click();
    }
    async enterUnitName(unitName: string): Promise<void> {
        await this.unitNameDropdown.click();
        await this.unitNameInput.fill(unitName);
        await this.page.getByText(unitName).click();
    }
    async enterFloor(floorNum: string): Promise<void> {
        await this.floorInput.click();
        await this.floorInput.fill(floorNum);
    }
    async selectBHKType(bhkType: BHKType): Promise<void> {
        const bhkLocator = this.page.getByText(bhkType, { exact: true });
        await bhkLocator.click();
    }
    async enterCarpetArea(area: string): Promise<void> {
        await this.carpetAreaInput.fill(area);
    }
    async enterSaleableArea(area: string): Promise<void> {
        await this.saleableAreaInput.fill(area);
    }
    async enterBaseRate(rate: string): Promise<void> {
        await this.baseRateInput.fill(rate);
        await this.baseRateInput.blur();
    }    
    async enterAgreementValue(value: string): Promise<void> {
        await this.agreementValueInput.fill(value);
    }
    async enterAllInclusivePrice(value: string): Promise<void> {
        await this.allInclusivePriceInput.fill(value);
    }
    async publishAndNext(): Promise<void> {
        await this.publishDropdown.click();
        await this.publishAndNextButton.click();
    }
    async selectAllAmenities(): Promise<void> {
        await this.selectAllAmenitiesCheckbox.click();
    }
    async navigateToOtherDetails(): Promise<void> {
        await this.otherDetailsLink.click();
    }
    async saveUnit(): Promise<void> {
        await this.saveButton.click();
    }
    async finalSave(): Promise<void> {
        await this.finalSaveLink.click();
    }
    async waitForSuccessMessage(): Promise<void> {
    await this.page.waitForSelector('text=Unit is successfully updated.', { state: 'visible', timeout: 15000 });
    }
    async isSuccessMessageVisible(): Promise<boolean> {
        return await this.successMessage.isVisible();
    }
    async getSuccessMessageText(): Promise<string> {
        return await this.successMessage.innerText();
    }    
    // Purpose selection methods
    async selectPurpose(purpose: PropertyPurpose): Promise<void> {
    switch (purpose) {
        case PropertyPurpose.sale:
            await this.saleButton.click();
            break;
        case PropertyPurpose.resale:
            await this.resaleButton.click();
            break;
        case PropertyPurpose.rental:
            await this.rentalButton.click();
            break;
    }
}
    // Purpose-specific field methods
    async enterMonthlyRent(rent: string): Promise<void> {
        await this.monthlyRentInput.fill(rent);
    }
    async enterSecurityDeposit(deposit: string): Promise<void> {
        await this.securityAmountInput.fill(deposit);
    }
    async enterMaintenanceCharges(charges: string): Promise<void> {
        await this.maintenanceAmountInput.fill(charges);
    }
    // Purpose-specific form completion
    async fillPurposeSpecificFields(testData: QuickAddUnitByPurposeData['TestData']): Promise<void> {
        switch (testData.purpose) {
            case PropertyPurpose.sale:
                if (testData.baseRate) {await this.enterBaseRate(testData.baseRate);}
            break;
            case PropertyPurpose.resale:
                if (testData.agreementValue) {await this.enterAgreementValue(testData.agreementValue);}
                if (testData.allInclusivePrice) {await this.enterAllInclusivePrice(testData.allInclusivePrice);}
            break;
            case PropertyPurpose.rental:
                if (testData.monthlyRent) {await this.enterMonthlyRent(testData.monthlyRent);}
                if (testData.securityAmount) {await this.enterSecurityDeposit(testData.securityAmount);}
                if (testData.maintenanceAmount) {await this.enterMaintenanceCharges(testData.maintenanceAmount);}
            break;
        }
    }
     // Property Owner Details methods
    async selectSalutation(salutation: string): Promise<void> {
        await this.salutationInput.click();
        await this.chooseSalutation.getByText(salutation, { exact: true }).click();
    }
    async enterFirstName(firstName: string): Promise<void> {
        await this.firstNameInput.fill(firstName);
    }
    async enterLastName(lastName: string): Promise<void> {
        await this.lastNameInput.fill(lastName);
    }
    async enterPhone(phone: string): Promise<void> {
        await this.phoneInput.fill(phone);
    }
    async enterEmail(email: string): Promise<void> {
        await this.emailInput.fill(email);
    }
    async fillPropertyOwnerDetails(testData: QuickAddUnitByPurposeData['TestData']): Promise<void> {
        if (testData.salutation) {
            await this.selectSalutation(testData.salutation);
        }
        if (testData.firstName) {
            await this.enterFirstName(testData.firstName);
        }
        if (testData.lastName) {
            await this.enterLastName(testData.lastName);
        }
        if (testData.phone) {
            await this.enterPhone(testData.phone);
        }
        if (testData.email) {
            await this.enterEmail(testData.email);
        }
    }
} 