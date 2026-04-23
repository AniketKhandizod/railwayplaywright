// dataProvider/TestDataForQuickAddUnitByPurpose.ts
import { test as base } from "@playwright/test";
import { properties } from "../properties/v2";
import { Utils } from "../utils/PlaywrightTestUtils.ts";
import { UnitType, UnitCategory, FurnishingType, BHKType, PropertyPurpose, Salutation } from "../pages/InventoryPages/UnitPage/QuickAddUnitPage";

 export type QuickAddUnitByPurposeData = {
  TestFor: string;
  TestData: {
    purpose: PropertyPurpose;
    unitName: string;
    projectName: string;
    towerName: string;
    floorNumber: string;
    unitType: UnitType;
    unitCategory: UnitCategory;
    furnishingType: FurnishingType;
    bhkType: BHKType;
    carpetArea: string;
    saleableArea: string;
    baseRate?: string;
    monthlyRent?: string; 
    securityAmount?: string; 
    maintenanceAmount?: string; 
    agreementValue?: string; 
    allInclusivePrice?: string; 
    expectedSuccessMessage: string;
    salutation?:string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
};

const createPurposeBasedDatasets = async (): Promise<QuickAddUnitByPurposeData[]> => {
  const utils = new Utils();
  
  return [
    {
      TestFor: "Sale Purpose",
      TestData: {
        purpose: PropertyPurpose.sale,
        unitName: "Sale " + await utils.generateRandomNumber(5),
        projectName: properties.UN_ProjectName,
        towerName: properties.UN_TowerName,
        floorNumber: properties.UN_FloorNumber,
        unitType: UnitType.residential,
        unitCategory: UnitCategory.apartment,
        furnishingType: FurnishingType.unfurnished,
        bhkType: BHKType.one_bhk,
        carpetArea: properties.FP_Carpet,
        saleableArea: properties.FP_Saleable,
        baseRate: properties.FP_BaseRate,
        expectedSuccessMessage: "Unit is successfully updated."
      }
    },
    {
      TestFor: "Resale Purpose",
      TestData: {
        purpose: PropertyPurpose.resale,
        unitName: "Resale " + await utils.generateRandomNumber(5),
        projectName: properties.UN_ProjectName,
        towerName: properties.UN_TowerName,
        floorNumber: properties.UN_FloorNumber,
        unitType: UnitType.residential,
        unitCategory: UnitCategory.villa,
        furnishingType: FurnishingType.semi_furnished,
        bhkType: BHKType.two_bhk,
        carpetArea: properties.FP_Carpet,
        saleableArea: properties.FP_Saleable,
        agreementValue: properties.UN_AgreementValue,
        allInclusivePrice: properties.UN_AllInclusivePrice,
        salutation: Salutation.mr,
        firstName: await utils.generateRandomString(6,{casing:'lower',includeNumbers:false,includeSpecialChars:false}),
        lastName: await utils.generateRandomString(6,{casing:'lower',includeNumbers:false,includeSpecialChars:false}),
        phone: await utils.generateRandomPhoneNumber(),
        email: await utils.generateRandomEmail(),
        expectedSuccessMessage: "Unit is successfully updated."
      }
    },
    {
      TestFor: "Rental Purpose",
      TestData: {
        purpose: PropertyPurpose.rental,
        unitName: "Rental " + await utils.generateRandomNumber(5),
        projectName: properties.UN_ProjectName,
        towerName: properties.UN_TowerName,
        floorNumber: properties.UN_FloorNumber,
        unitType: UnitType.residential,
        unitCategory: UnitCategory.apartment,
        furnishingType: FurnishingType.furnished,
        bhkType: BHKType.one_bhk,
        carpetArea: properties.FP_Carpet,
        saleableArea: properties.FP_Saleable,
        monthlyRent: properties.UN_MonthlyRent,
        maintenanceAmount: properties.UN_MaintenanceAmount,
        securityAmount: properties.UN_SecurityAmount,
        salutation: Salutation.mrs,
        firstName: await utils.generateRandomString(6,{casing:'lower',includeNumbers:false,includeSpecialChars:false}),
        lastName: await utils.generateRandomString(6,{casing:'lower',includeNumbers:false,includeSpecialChars:false}),
        phone: await utils.generateRandomPhoneNumber(),
        email: await utils.generateRandomEmail(),
        expectedSuccessMessage: "Unit is successfully updated."
      }
    },
  ];
};
const test = base.extend<{ testDataForQuickAddUnitByPurpose: QuickAddUnitByPurposeData[] }>({
  testDataForQuickAddUnitByPurpose: async ({}, use) => {
    const datasets = await createPurposeBasedDatasets();
    await use(datasets);
  },
});
export const expect = test.expect;
export { test };