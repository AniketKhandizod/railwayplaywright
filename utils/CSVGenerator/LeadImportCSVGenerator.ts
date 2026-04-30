import * as path from "path";
import { faker } from "@faker-js/faker";
import { CSVUtils } from "./CSVUtils";
import { Utils, AheadOf } from "../PlaywrightTestUtils";
import { properties } from "../../Environment/v2";
import {
  Salutation,
  BHK,
  PropertyType,
  educationDetails,
  ProfessionalDetails,
  INCOMEDetails,
  LoanDetails,
  URLType,
  Industry,
  Source,
  Stages,
  Status,
  UnqualifiedReasons,
  Purpose,
  Furnishing,
  Facing,
  Nri,
  TransactionType,
  FundingSource,
  BathroomPreferences,
  Gender,
  IntrestedIn,
  CreateHeaderForLeadImport_allFields,
  CreateHeaderForLeadImportReengage_allFields,
  CreateHeaderForLeadImportDummyStrategy,
  CreateHeaderForLeadImportReengage_allFields_withPhoneOnly,
  CreateHeaderForLeadImport_allFields_withPhoneOnly,
} from "../XLGenerator/Constants/Lead.Constants";
import { LeadAPIUtils } from "../APIUtils/LeadAPIUtils";
import { CRMAPIUtils, UserRoleFilter } from "../APIUtils/CRMAPIUtils";


export class LeadImportCSVGenerator {
  private readonly utils: Utils;
  private readonly leadApi: LeadAPIUtils;
  private readonly crmAPIUtils: CRMAPIUtils;


  constructor(clientId: string, FullAccess_API: string, RestrictedAccess_API: string) {
    this.utils = new Utils();
    this.leadApi = new LeadAPIUtils(clientId, FullAccess_API, RestrictedAccess_API);
    this.crmAPIUtils = new CRMAPIUtils(clientId, FullAccess_API);
  }

  /**
   * Port of Java `LeadXLfileGenerator.leadImportForDummyUser`: CSV with Primary Phone (+91 + 10-digit national) and Primary Email.
   * Row count defaults to `properties.ImportCount` (Java `ImportCount` / `fileCount`).
   */
  async leadImportForDummyUserCSV(fileCount?: number, importFolder?: string): Promise<string> {
    const rawCount = fileCount !== undefined ? fileCount : properties.ImportCount;
    const parsed = Number(rawCount);
    const count = Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 1;
    const importDir = importFolder || properties.ImportLocation || "store/imports";
    const fileName = `LeadImportForDummy ${await this.utils.generateRandomString(10)}.csv`;
    const filePath = path.join(process.cwd(), importDir, fileName);

    const csv = new CSVUtils(filePath);
    csv.createFileWithHeader([...CreateHeaderForLeadImportDummyStrategy]);

    const rows: string[][] = [];
    for (let i = 0; i < count; i++) {
      const national = await this.utils.generateRandomPhoneNumber();
      rows.push([`+91 ${national}`, await this.utils.generateRandomEmail()]);
    }
    csv.appendRows(rows);
    await this.utils.print(`Lead import for dummy user file created at: ${filePath} for client "${(await this.crmAPIUtils.getSellDoClientDetails()).name}" with count: ${count}`);
    return filePath;
  }

  async importWithALlColumn_CSV(
    val: number,
    project: string,
    sales: string,
    campeing: string,
    cp: string,
    importFolder?: string,
  ): Promise<string> {
    const importDir = importFolder || properties.ImportLocation || "store/imports";
    const fileName = `LeadImport ${await this.utils.generateRandomString(10)}.csv`;
    const filePath = path.join(process.cwd(), importDir, fileName);

    const csv = new CSVUtils(filePath);
    csv.createFileWithHeader(CreateHeaderForLeadImport_allFields);

    const rows: string[][] = [];
    for (let i = 1; i <= val; i++) {
      const createdAtDate = await this.utils.calculateFutureDate(AheadOf.Day, 0, "dd/MM/yyyy hh:mm a");
      const emails = await this.utils.generateRandomEmail();
      const { countryCode: countryCode, phoneNumber: phone, countryName: country } = await this.utils.generateRandomPhoneNumberWithCountry();
      const { countryCode: countryCodeSecondary, phoneNumber: phoneSecondary, countryName: countrySecondary } =await this.utils.generateRandomPhoneNumberWithCountry();

      const selectedStage = await this.utils.pickRandomElementFromArray(Stages);
      const reason =
        selectedStage.toLowerCase() === "unqualified" || selectedStage.toLowerCase() === "lost"
          ? await this.utils.pickRandomElementFromArray(UnqualifiedReasons)
          : "";

      const statusInStage =
        selectedStage.toLowerCase() === "opportunity" ? await this.utils.pickRandomElementFromArray(Status) : "";

      const droppedBy =
        selectedStage.toLowerCase() === "lost" || selectedStage.toLowerCase() === "unqualified" ? (await this.crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales)).id : "";

      rows.push([
        createdAtDate,
        await this.utils.pickRandomElementFromArray(Salutation),
        country,
        countrySecondary,
        "",
        `+${countryCode} ${phone}`,
        `+${countryCodeSecondary} ${phoneSecondary}`,
        emails,
        await this.utils.generateRandomEmail(),
        "1",
        "12",
        await this.utils.generateRandomNumber(5),
        await this.utils.generateRandomNumber(10),
        await this.utils.getRandomSubsetFromArray(PropertyType),
        await this.utils.generateRandomString(10, { casing: "mixed", includeNumbers: false , includeSpecialChars: false }),
        await this.utils.getRandomSubsetFromArray(BHK),
        await this.utils.generateRandomString(20),
        await this.utils.calculateFutureDate(AheadOf.Day, 1, "dd/MM/yyyy hh:mm:ss"),
        await this.utils.calculateFutureDate(AheadOf.Day, 1, "dd/MM/yyyy hh:mm:ss"),
        String(await this.utils.generateRandomInteger(25, 100)),
        await this.utils.calculateFutureDate(AheadOf.Day, -(await this.utils.generateRandomInteger(1, 1000)), "dd/MM/yyyy"),
        await this.utils.calculateFutureDate(AheadOf.Day, -(await this.utils.generateRandomInteger(1, 1000)), "dd/MM/yyyy"),
        await this.utils.pickRandomElementFromArray(Industry),
        `${faker.person.firstName()},${faker.person.firstName()},${await this.utils.pickRandomElementFromArray(educationDetails)}`,
        `${await this.utils.pickRandomElementFromArray(ProfessionalDetails)},${faker.person.firstName()},${faker.person.firstName()}`,
        `${await this.utils.generateRandomNumber(10)},${await this.utils.pickRandomElementFromArray(INCOMEDetails)}`,
        `${await this.utils.generateRandomNumber(10)},${faker.person.firstName()},${await this.utils.pickRandomElementFromArray(LoanDetails)}`,
        `https://v2.sell.do/${await this.utils.generateRandomString(20, { casing: "mixed", includeNumbers: false , includeSpecialChars: false })},${await this.utils.pickRandomElementFromArray(URLType)}`,
        faker.location.streetAddress(),
        "Maharashtra",
        "Import",
        "India",
        project,
        sales,
        campeing,
        await this.utils.pickRandomElementFromArray(Source),
        faker.person.firstName(),
        selectedStage,
        statusInStage,
        reason,
        await this.utils.pickRandomElementFromArray(Purpose),
        await this.utils.getRandomSubsetFromArray(Furnishing),
        await this.utils.getRandomSubsetFromArray(Facing),
        await this.utils.pickRandomElementFromArray(Nri),
        await this.utils.pickRandomElementFromArray(TransactionType),
        await this.utils.pickRandomElementFromArray(FundingSource),
        await this.utils.getRandomSubsetFromArray(BathroomPreferences),
        await this.utils.pickRandomElementFromArray(Nri),
        faker.person.firstName(),
        await this.utils.pickRandomElementFromArray(Gender),
        cp,
        "414003",
        faker.person.lastName(),
        "12",
        await this.utils.getRandomSubsetFromArray(IntrestedIn),
        droppedBy,
      ]);
    }

    csv.appendRows(rows);
    await this.utils.print(`Lead import for all column file created at: ${filePath} for client "${(await this.crmAPIUtils.getSellDoClientDetails()).name}" with count: ${val}`);
    return filePath;
  }

  async importWithALlColumn_CSV_withPhoneOnly(
    val: number,
    project: string,
    sales: string,
    campeing: string,
    cp: string,
    importFolder?: string,
  ): Promise<string> {
    const importDir = importFolder || properties.ImportLocation || "store/imports";
    const fileName = `LeadImport_withPhoneOnly ${await this.utils.generateRandomString(10)}.csv`;
    const filePath = path.join(process.cwd(), importDir, fileName);

    const csv = new CSVUtils(filePath);
    csv.createFileWithHeader(CreateHeaderForLeadImport_allFields_withPhoneOnly);

    const rows: string[][] = [];
    for (let i = 1; i <= val; i++) {
      const createdAtDate = await this.utils.calculateFutureDate(AheadOf.Day, 0, "dd/MM/yyyy hh:mm a");
      const emails = await this.utils.generateRandomEmail();
      const { countryCode: countryCode, phoneNumber: phone, countryName: country } = await this.utils.generateRandomPhoneNumberWithCountry();
      const { countryCode: countryCodeSecondary, phoneNumber: phoneSecondary, countryName: countrySecondary } =await this.utils.generateRandomPhoneNumberWithCountry();

      const selectedStage = await this.utils.pickRandomElementFromArray(Stages);
      const reason =
        selectedStage.toLowerCase() === "unqualified" || selectedStage.toLowerCase() === "lost"
          ? await this.utils.pickRandomElementFromArray(UnqualifiedReasons)
          : "";

      const statusInStage =
        selectedStage.toLowerCase() === "opportunity" ? await this.utils.pickRandomElementFromArray(Status) : "";

      const droppedBy =
        selectedStage.toLowerCase() === "lost" || selectedStage.toLowerCase() === "unqualified" ? (await this.crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales)).id : "";

      rows.push([
        createdAtDate,
        await this.utils.pickRandomElementFromArray(Salutation),
        country,
        countrySecondary,
        "",
        `+${countryCode} ${phone}`,
        `+${countryCodeSecondary} ${phoneSecondary}`,
        emails,
        await this.utils.generateRandomEmail(),
        "1",
        "12",
        await this.utils.generateRandomNumber(5),
        await this.utils.generateRandomNumber(10),
        await this.utils.getRandomSubsetFromArray(PropertyType),
        await this.utils.generateRandomString(10, { casing: "mixed", includeNumbers: false , includeSpecialChars: false }),
        await this.utils.getRandomSubsetFromArray(BHK),
        await this.utils.generateRandomString(20),
        await this.utils.calculateFutureDate(AheadOf.Day, 1, "dd/MM/yyyy hh:mm:ss"),
        await this.utils.calculateFutureDate(AheadOf.Day, 1, "dd/MM/yyyy hh:mm:ss"),
        String(await this.utils.generateRandomInteger(25, 100)),
        await this.utils.calculateFutureDate(AheadOf.Day, -(await this.utils.generateRandomInteger(1, 1000)), "dd/MM/yyyy"),
        await this.utils.calculateFutureDate(AheadOf.Day, -(await this.utils.generateRandomInteger(1, 1000)), "dd/MM/yyyy"),
        await this.utils.pickRandomElementFromArray(Industry),
        `${faker.person.firstName()},${faker.person.firstName()},${await this.utils.pickRandomElementFromArray(educationDetails)}`,
        `${await this.utils.pickRandomElementFromArray(ProfessionalDetails)},${faker.person.firstName()},${faker.person.firstName()}`,
        `${await this.utils.generateRandomNumber(10)},${await this.utils.pickRandomElementFromArray(INCOMEDetails)}`,
        `${await this.utils.generateRandomNumber(10)},${faker.person.firstName()},${await this.utils.pickRandomElementFromArray(LoanDetails)}`,
        `https://v2.sell.do/${await this.utils.generateRandomString(20, { casing: "mixed", includeNumbers: false , includeSpecialChars: false })},${await this.utils.pickRandomElementFromArray(URLType)}`,
        faker.location.streetAddress(),
        "Import",
        project,
        sales,
        campeing,
        await this.utils.pickRandomElementFromArray(Source),
        faker.person.firstName(),
        selectedStage,
        statusInStage,
        reason,
        await this.utils.pickRandomElementFromArray(Purpose),
        await this.utils.getRandomSubsetFromArray(Furnishing),
        await this.utils.getRandomSubsetFromArray(Facing),
        await this.utils.pickRandomElementFromArray(Nri),
        await this.utils.pickRandomElementFromArray(TransactionType),
        await this.utils.pickRandomElementFromArray(FundingSource),
        await this.utils.getRandomSubsetFromArray(BathroomPreferences),
        await this.utils.pickRandomElementFromArray(Nri),
        faker.person.firstName(),
        await this.utils.pickRandomElementFromArray(Gender),
        cp,
        "414003",
        faker.person.lastName(),
        "12",
        await this.utils.getRandomSubsetFromArray(IntrestedIn),
        droppedBy,
      ]);
    }

    csv.appendRows(rows);
    await this.utils.print(`Lead import for all column file created at: ${filePath} for client "${(await this.crmAPIUtils.getSellDoClientDetails()).name}" with count: ${val}`);
    return filePath;
  }
  

  async importWithALlColumnAndReengage_CSV(
    val: number,
    project: string,
    sales: string,
    campeing: string,
    cp: string,
    importFolder?: string,
  ): Promise<string> {
    const importDir = importFolder || properties.ImportLocation || "store/imports";
    const fileName = `LeadReengageImport ${await this.utils.generateRandomString(10)}.csv`;
    const filePath = path.join(process.cwd(), importDir, fileName);

    const csv = new CSVUtils(filePath);
    csv.createFileWithHeader(CreateHeaderForLeadImportReengage_allFields);

    const rows: string[][] = [];
    for (let i = 1; i <= val; i++) {
      const email = "";
      const { countryCode: countryCode, phoneNumber: phone, countryName: country } = await this.utils.generateRandomPhoneNumberWithCountry();
      const { countryCode: countryCodeSecondary, phoneNumber: phoneSecondary, countryName: countrySecondary } =await this.utils.generateRandomPhoneNumberWithCountry();

      const createdLead = await this.leadApi.createLeadWithDetails(`+${countryCode} ${phone}`, "", `${country} ${countrySecondary}`, undefined, undefined, project, sales, country.toLowerCase());
      const leadId = String(createdLead?.sell_do_lead_id || "");

      const selectedStage = await this.utils.pickRandomElementFromArray(Stages);
      const reason =
        selectedStage.toLowerCase() === "unqualified" || selectedStage.toLowerCase() === "lost"
          ? await this.utils.pickRandomElementFromArray(UnqualifiedReasons)
          : "";
      const statusInStage =
        selectedStage.toLowerCase() === "opportunity" ? await this.utils.pickRandomElementFromArray(Status) : "";
      const droppedBy =
        selectedStage.toLowerCase() === "lost" || selectedStage.toLowerCase() === "unqualified" ? (await this.crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.PreSales)).id : "";

      rows.push([
        await this.utils.pickRandomElementFromArray(Salutation),
        country,
        countrySecondary,
        leadId,
        `+${countryCode} ${phone}`,
        `+${countryCodeSecondary} ${phoneSecondary}`,
        email,
        await this.utils.generateRandomEmail(),
        "1",
        "12",
        await this.utils.generateRandomNumber(5),
        await this.utils.generateRandomNumber(10),
        await this.utils.getRandomSubsetFromArray(PropertyType),
        await this.utils.generateRandomString(10, { casing: "mixed", includeNumbers: false , includeSpecialChars: false }),
        await this.utils.getRandomSubsetFromArray(BHK),
        await this.utils.generateRandomString(50),
        await this.utils.calculateFutureDate(AheadOf.Day, await this.utils.generateRandomInteger(1, 10), "dd/MM/yyyy hh:mm:ss"),
        await this.utils.calculateFutureDate(AheadOf.Day, await this.utils.generateRandomInteger(1, 10), "dd/MM/yyyy hh:mm:ss"),
        String(await this.utils.generateRandomInteger(25, 100)),
        await this.utils.calculateFutureDate(AheadOf.Day, -(await this.utils.generateRandomInteger(1, 1000)), "dd/MM/yyyy"),
        await this.utils.calculateFutureDate(AheadOf.Day, -(await this.utils.generateRandomInteger(1, 1000)), "dd/MM/yyyy"),
        await this.utils.pickRandomElementFromArray(Industry),
        `${faker.person.firstName()},${faker.person.firstName()},${await this.utils.pickRandomElementFromArray(educationDetails)}`,
        `${await this.utils.pickRandomElementFromArray(ProfessionalDetails)},${faker.person.firstName()},${faker.person.firstName()}`,
        `${await this.utils.generateRandomNumber(10)},${await this.utils.pickRandomElementFromArray(INCOMEDetails)}`,
        `${await this.utils.generateRandomNumber(10)},${faker.person.firstName()},${await this.utils.pickRandomElementFromArray(LoanDetails)}`,
        `https://v2.sell.do/${await this.utils.generateRandomString(20, { casing: "mixed", includeNumbers: false , includeSpecialChars: false })},${await this.utils.pickRandomElementFromArray(URLType)}`,
        faker.location.streetAddress(),
        await this.utils.pickRandomElementFromArray(["Maharashtra"]),
        "Import",
        "India",
        project,
        sales,
        campeing,
        await this.utils.pickRandomElementFromArray(Source),
        faker.person.firstName(),
        selectedStage,
        statusInStage,
        reason,
        await this.utils.pickRandomElementFromArray(Purpose),
        await this.utils.getRandomSubsetFromArray(Furnishing),
        await this.utils.getRandomSubsetFromArray(Facing),
        await this.utils.pickRandomElementFromArray(Nri),
        await this.utils.pickRandomElementFromArray(TransactionType),
        await this.utils.pickRandomElementFromArray(FundingSource),
        await this.utils.getRandomSubsetFromArray(BathroomPreferences),
        await this.utils.pickRandomElementFromArray(Nri),
        faker.person.firstName(),
        await this.utils.pickRandomElementFromArray(Gender),
        cp,
        "414003",
        faker.person.firstName(),
        "12",
        await this.utils.getRandomSubsetFromArray(IntrestedIn),
        droppedBy,
      ]);
    }

    csv.appendRows(rows);
    await this.utils.print(`Lead import for all column and reengage file created at: ${filePath} for client "${(await this.crmAPIUtils.getSellDoClientDetails()).name}" with count: ${val}`);
    return filePath;
  }

  async importWithALlColumnAndReengage_CSV_withPhoneOnly(
    val: number,
    project: string,
    sales: string,
    campeing: string,
    cp: string,
    importFolder?: string,
  ): Promise<string> {
    const importDir = importFolder || properties.ImportLocation || "store/imports";
    const fileName = `LeadReengageImport_withPhoneOnly ${await this.utils.generateRandomString(10)}.csv`;
    const filePath = path.join(process.cwd(), importDir, fileName);

    const csv = new CSVUtils(filePath);
    csv.createFileWithHeader(CreateHeaderForLeadImportReengage_allFields_withPhoneOnly);

    const rows: string[][] = [];
    for (let i = 1; i <= val; i++) {
      const { countryCode: countryCode, phoneNumber: phone, countryName: country } = await this.utils.generateRandomPhoneNumberWithCountry();
      const { countryCode: countryCodeSecondary, phoneNumber: phoneSecondary, countryName: countrySecondary } =await this.utils.generateRandomPhoneNumberWithCountry();

      const createdLead = await this.leadApi.createLeadWithDetails(`+${countryCode} ${phone}`, "", `${country} ${countrySecondary}`, undefined, undefined, project, sales, country.toLowerCase());
      const leadId = String(createdLead?.sell_do_lead_id || "");

      const selectedStage = await this.utils.pickRandomElementFromArray(Stages);
      const reason =
        selectedStage.toLowerCase() === "unqualified" || selectedStage.toLowerCase() === "lost"
          ? await this.utils.pickRandomElementFromArray(UnqualifiedReasons)
          : "";
      const statusInStage =
        selectedStage.toLowerCase() === "opportunity" ? await this.utils.pickRandomElementFromArray(Status) : "";
      const droppedBy =
        selectedStage.toLowerCase() === "lost" || selectedStage.toLowerCase() === "unqualified" ? (await this.crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.PreSales)).id : "";

      rows.push([
        await this.utils.pickRandomElementFromArray(Salutation),
        country,
        countrySecondary,
        leadId,
        `+${countryCode} ${phone}`,
        `+${countryCodeSecondary} ${phoneSecondary}`,
        await this.utils.generateRandomEmail(),
        await this.utils.generateRandomEmail(),
        "1",
        "12",
        await this.utils.generateRandomNumber(5),
        await this.utils.generateRandomNumber(10),
        await this.utils.getRandomSubsetFromArray(PropertyType),
        await this.utils.generateRandomString(10, { casing: "mixed", includeNumbers: false , includeSpecialChars: false }),
        await this.utils.getRandomSubsetFromArray(BHK),
        await this.utils.generateRandomString(50),
        await this.utils.calculateFutureDate(AheadOf.Day, await this.utils.generateRandomInteger(1, 10), "dd/MM/yyyy hh:mm:ss"),
        await this.utils.calculateFutureDate(AheadOf.Day, await this.utils.generateRandomInteger(1, 10), "dd/MM/yyyy hh:mm:ss"),
        String(await this.utils.generateRandomInteger(25, 100)),
        await this.utils.calculateFutureDate(AheadOf.Day, -(await this.utils.generateRandomInteger(1, 1000)), "dd/MM/yyyy"),
        await this.utils.calculateFutureDate(AheadOf.Day, -(await this.utils.generateRandomInteger(1, 1000)), "dd/MM/yyyy"),
        await this.utils.pickRandomElementFromArray(Industry),
        `${faker.person.firstName()},${faker.person.firstName()},${await this.utils.pickRandomElementFromArray(educationDetails)}`,
        `${await this.utils.pickRandomElementFromArray(ProfessionalDetails)},${faker.person.firstName()},${faker.person.firstName()}`,
        `${await this.utils.generateRandomNumber(10)},${await this.utils.pickRandomElementFromArray(INCOMEDetails)}`,
        `${await this.utils.generateRandomNumber(10)},${faker.person.firstName()},${await this.utils.pickRandomElementFromArray(LoanDetails)}`,
        `https://v2.sell.do/${await this.utils.generateRandomString(20, { casing: "mixed", includeNumbers: false , includeSpecialChars: false })},${await this.utils.pickRandomElementFromArray(URLType)}`,
        faker.location.streetAddress(),
        "Import",
        project,
        sales,
        campeing,
        await this.utils.pickRandomElementFromArray(Source),
        faker.person.firstName(),
        selectedStage,
        statusInStage,
        reason,
        await this.utils.pickRandomElementFromArray(Purpose),
        await this.utils.getRandomSubsetFromArray(Furnishing),
        await this.utils.getRandomSubsetFromArray(Facing),
        await this.utils.pickRandomElementFromArray(Nri),
        await this.utils.pickRandomElementFromArray(TransactionType),
        await this.utils.pickRandomElementFromArray(FundingSource),
        await this.utils.getRandomSubsetFromArray(BathroomPreferences),
        await this.utils.pickRandomElementFromArray(Nri),
        faker.person.firstName(),
        await this.utils.pickRandomElementFromArray(Gender),
        cp,
        "414003",
        faker.person.firstName(),
        "12",
        await this.utils.getRandomSubsetFromArray(IntrestedIn),
        droppedBy,
      ]);
    }

    csv.appendRows(rows);
    await this.utils.print(`Lead import for all column and reengage file created at: ${filePath} for client "${(await this.crmAPIUtils.getSellDoClientDetails()).name}" with count: ${val}`);
    return filePath;
  }
}

