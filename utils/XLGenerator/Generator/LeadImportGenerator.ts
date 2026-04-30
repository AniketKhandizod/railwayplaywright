import { XLUtils } from "../XLUtils";
import { Utils, AheadOf } from "../../PlaywrightTestUtils";
import {faker} from "@faker-js/faker";
import { properties } from "../../env";
import {Salutation,BHK,PropertyType,educationDetails,ProfessionalDetails,INCOMEDetails,LoanDetails,URLType,Industry,States,Source,Stages,Status,UnqualifiedReasons,LostReasons,Purpose,Furnishing,Facing,
  Nri,
  TransactionType,
  FundingSource,
  BathroomPreferences,
  Gender,
  ChannelPartnerID,
  projectIds,
  SalesIds,
  CampaignIds,
  IntrestedIn,
  CreateHeaderForLeadImport_allFields,
} from "../Constants/Lead.Constants";

const sheetName = "Sheet1";
const fileCount = parseInt(String(properties.ImportCount ?? 1), 10);

export async function importLeadWithAllColumns(importFolder: string): Promise<string> {
  const utils = new Utils();
  const filePath = await utils.generateExcelFile("LeadImport", importFolder);
  const xl = new XLUtils(filePath);

  xl.createFileWithHeader(sheetName, CreateHeaderForLeadImport_allFields);

  for (let i = 1; i <= fileCount; i++) {
    let col = 0;

    const createdAt = utils.calculateFutureDate(AheadOf.Day, -20000, "dd/MM/yyyy hh:mm a");
    // Created At
    xl.setCellData(sheetName, i, col++, createdAt);
    // salutation
    xl.setCellData(sheetName, i, col++, utils.pickRandomElementFromArray(Salutation));
    // Lead first name
    xl.setCellData(sheetName, i, col++, faker.person.firstName());
    // lead last name
    xl.setCellData(sheetName, i, col++, faker.person.lastName());
    // Lead Id
    xl.setCellData(sheetName, i, col++, "");
    // Primary Phone
    xl.setCellData(sheetName, i, col++, "+91" + utils.generateRandomPhoneNumber());
    // Secondary Phone
    xl.setCellData(sheetName, i, col++, "+91" + utils.generateRandomPhoneNumber());
    // Primary Email
    const email = utils.generateRandomEmail();
    xl.setCellData(sheetName, i, col++, email);
    // Secondary Email
    xl.setCellData(sheetName, i, col++, utils.generateRandomEmail());
    // Minimum possesion
    xl.setCellData(sheetName, i, col++, "1");
    // Maximum possesion
    xl.setCellData(sheetName, i, col++, "12");
    // Minimum budget
    xl.setCellData(sheetName, i, col++, utils.generateRandomNumber(5));
    // Maximum budget
    xl.setCellData(sheetName, i, col++, utils.generateRandomNumber(10));
    // Property types
    xl.setCellData(sheetName, i, col++, utils.getRandomSubsetFromArray(PropertyType));
    // Locations
    xl.setCellData(sheetName, i, col++, utils.generateRandomString(10, { casing: "mixed" }));
    // BHK
    xl.setCellData(sheetName, i, col++, utils.getRandomSubsetFromArray(BHK));
    // Note
    xl.setCellData(sheetName, i, col++, utils.generateRandomString(20));
    // Followup date
    xl.setCellData(sheetName, i, col++, utils.calculateFutureDate(AheadOf.Day, 1, "dd/MM/yyyy hh:mm:ss"));
    // Site visit date
    xl.setCellData(sheetName, i, col++, utils.calculateFutureDate(AheadOf.Day, 1, "dd/MM/yyyy hh:mm:ss"));
    // Age
    xl.setCellData(sheetName, i, col++, utils.generateRandomInteger(25, 100).toString());
    // Birthday
    xl.setCellData(sheetName, i, col++, utils.calculateFutureDate(AheadOf.Day, -utils.generateRandomInteger(1, 1000), "dd/MM/yyyy"));
    // Anniversary
    xl.setCellData(sheetName, i, col++, utils.calculateFutureDate(AheadOf.Day, -utils.generateRandomInteger(1, 1000), "dd/MM/yyyy"));
    // Industry
    xl.setCellData(sheetName, i, col++, utils.pickRandomElementFromArray(Industry));
    // Educational Details
    xl.setCellData(sheetName, i, col++, `${faker.person.firstName()},${faker.person.firstName()},${utils.pickRandomElementFromArray(educationDetails)}`);
    // Professional Details
    xl.setCellData(sheetName, i, col++, `${utils.pickRandomElementFromArray(ProfessionalDetails)},${faker.person.firstName()},${faker.person.firstName()}`);
    // Income
    xl.setCellData(sheetName, i, col++, `${utils.generateRandomString(10, { includeNumbers: true })},${utils.pickRandomElementFromArray(INCOMEDetails)}`);
    // Loan Details
    xl.setCellData(sheetName, i, col++, `${utils.generateRandomString(9, { includeNumbers: true })},${faker.person.firstName()},${utils.pickRandomElementFromArray(LoanDetails)}`);
    // Url
    xl.setCellData(sheetName, i, col++, `https://v2.sell.do/${utils.generateRandomString(20, { casing: "mixed" })},${utils.pickRandomElementFromArray(URLType)}`);
    // Address
    xl.setCellData(sheetName, i, col++, faker.location.streetAddress());
    // State
    xl.setCellData(sheetName, i, col++, utils.pickRandomElementFromArray(States));
    // City
    xl.setCellData(sheetName, i, col++, "Pune");
    // Country
    xl.setCellData(sheetName, i, col++, "India");
    // Project Ids
    xl.setCellData(sheetName, i, col++, utils.getRandomSubsetFromArray(projectIds));
    // Sales Ids
    xl.setCellData(sheetName, i, col++, utils.pickRandomElementFromArray(SalesIds));
    // Campaign Ids
    xl.setCellData(sheetName, i, col++, utils.pickRandomElementFromArray(CampaignIds));
    // Sources
    xl.setCellData(sheetName, i, col++, utils.pickRandomElementFromArray(Source));
    // Sub-Sources / Sub-Campaigns
    xl.setCellData(sheetName, i, col++, faker.person.firstName());
    // Lead Stages

    const stage = utils.pickRandomElementFromArray(Stages);
    xl.setCellData(sheetName, i, col++, stage);

    if (stage === "Opportunity") {
      xl.setCellData(sheetName, i, col++, utils.pickRandomElementFromArray(Status));
    } else {
      xl.setCellData(sheetName, i, col++, "");
    }

    if (stage === "Unqualified") {
      xl.setCellData(sheetName, i, col++, utils.pickRandomElementFromArray(UnqualifiedReasons));
    } else if (stage === "Lost") {
      xl.setCellData(sheetName, i, col++, utils.pickRandomElementFromArray(LostReasons));
    } else {
      xl.setCellData(sheetName, i, col++, faker.person.firstName());
    }

    // Purpose
    xl.setCellData(sheetName, i, col++, utils.getRandomSubsetFromArray(Purpose));
    // Furnishing
    xl.setCellData(sheetName, i, col++, utils.getRandomSubsetFromArray(Furnishing));
    // Facing
    xl.setCellData(sheetName, i, col++, utils.getRandomSubsetFromArray(Facing));
    // Nri
    xl.setCellData(sheetName, i, col++, utils.pickRandomElementFromArray(Nri));
    // Transaction Type
    xl.setCellData(sheetName, i, col++, utils.pickRandomElementFromArray(TransactionType));
    // Funding Source
    xl.setCellData(sheetName, i, col++, utils.getRandomSubsetFromArray(FundingSource));
    // Bathroom Preferences
    xl.setCellData(sheetName, i, col++, utils.getRandomSubsetFromArray(BathroomPreferences));
    // Married
    xl.setCellData(sheetName, i, col++, utils.pickRandomElementFromArray(Nri));
    // Manual Tags
    xl.setCellData(sheetName, i, col++, faker.person.firstName());
    // Gender
    xl.setCellData(sheetName, i, col++, utils.pickRandomElementFromArray(Gender));
    // Channel Partner ID
    xl.setCellData(sheetName, i, col++, utils.pickRandomElementFromArray(ChannelPartnerID));
    // Zip
    xl.setCellData(sheetName, i, col++, utils.generateRandomString(6, { includeNumbers: true }));
    // Street   
    xl.setCellData(sheetName, i, col++, faker.person.lastName());
    // Area
    xl.setCellData(sheetName, i, col++, "12");
    // Interested In
    xl.setCellData(sheetName, i, col++, utils.getRandomSubsetFromArray(IntrestedIn));
    // Dropped By
    if (stage === "Unqualified" || stage === "Lost") {
      xl.setCellData(sheetName, i, col++, properties.Sales_id ?? "");
    } else {
      xl.setCellData(sheetName, i, col++, "");
    }
  }

  return filePath;
}
