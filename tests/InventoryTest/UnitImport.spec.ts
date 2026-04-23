import * as fs from "fs";
import * as path from "path";
import { test, expect } from "@playwright/test";
import { properties } from "../../properties/v2";
import { AheadOf, Utils } from "../../utils/PlaywrightTestUtils";
import { InventoryCreator, type ProjectUnitShowV2Json } from "../../utils/APIUtils/InventoryAPIUtils/InventoryCreator";
import { CSVUtils, writeCsvFile } from "../../utils/CSVGenerator/CSVUtils";
import { convertCsvToXls } from "../../utils/converter";
import { CRMAPIUtils, UserRoleFilter } from "../../utils/APIUtils/CRMAPIUtils";
import { BulkActionAPIUtils } from "../../utils/APIUtils/BulkActionAPIUtils";
import {
  assertSaleImportedUnitShowV2MatchesCsvRow,
  parseUnitImportCsvDataRows,
} from "./unitImportSaleShowV2Asserts";

const clientId = properties.Client_id;
const fullAccessAPI = properties.FullAccess_API;

export const unitImportHeaders: string[] = [
  "created_by_id",
  "developer_name",
  "project_name",
  "project_tower_name",
  "unit_configuration_name",
  "name",
  "floor",
  "unit_index",
  "base_rate",
  "base_price",
  "bedrooms",
  "bathrooms",
  "category",
  "type",
  "saleable",
  "carpet",
  "loading",
  "property_purpose",
  "calculated_agreement_value",
  "calculated_total_price",
  "security_amount",
  "maintenance_amount",
  "salutation",
  "first_name",
  "last_name",
  "phone",
  "email",
  "alternate_phone",
  "alternate_email",
  "band",
  "status",
  "measure",
  "images",
  "facing",
  "sub_types",
  "amenities",
  "publish_unit",
  "published_by",
  "brokerage_type",
  "brokerage_value",
  "custom_text",
  "custom_text_aread",
  "custom_date",
  "custom_date_and_time",
  "custom_checkbox",
  "custom_select",
  "custom_radio",
  "custom_number",
  "custom_select_multiple_hide_on_form",
];

export const unitModifyImportHeaders: string[] = [
  "project_unit_id",
  "status",
  "name",
  "registration_date",
  "date_of_possession",
  "verification_date",
  "bedrooms",
  "bathrooms",
  "salutation",
  "first_name",
  "last_name",
  "phone",
  "email",
  "alternate_phone",
  "alternate_email",
  "seller_type",
  "band",
  "posted_by",
  "suitable_for",
  "facing",
  "furnishing",
  "ownership",
  "flooring",
  "floor",
  "unit_index",
  "entrance",
  "unit_facing_direction",
  "parking",
  "document_verification",
  "property_inspected",
  "negotiable",
  "saleable",
  "carpet",
  "covered_area",
  "terrace_area",
  "base_rate",
  "base_price",
  "calculated_agreement_value",
  "calculated_total_price",
  "security_amount",
  "maintenance_amount",
  "brokerage_type",
  "brokerage_value",
  "category",
  "sub_type",
  "type",
  "interest_percentage",
  "grace_period",
  "published",
  "published_by",
  "ac_additional_cost_1",
  "ac_additional_cost_2",
  "ec_extra_cost_1",
  "ec_extra_cost_2",
  "custom_text",
  "custom_text_aread",
  "custom_date",
  "custom_date_and_time",
  "custom_checkbox",
  "custom_select",
  "custom_radio",
  "custom_number",
  "custom_select_multiple_hide_on_form",
];

/**
 * Creates developer → project → tower → unit configuration via APIs, then writes a simple **unit-import CSV**.
 *
 * - Headers are defined as a plain array of strings.
 * - Each row is a simple array of values in the same order as headers.
 * - Number of rows is driven by `properties.ImportCount`.
 *
 * Output: `store/project_unit_import_ready.csv`
 */
test("genrate unit import file for sale type", async () => {
  const utils = new Utils();
  const inventoryCreator = new InventoryCreator(clientId, fullAccessAPI);
  const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);

  const firstUserId = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
  const firstPreSalesUser = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.PreSales,{index:0});

  const DateInImport = await utils.calculateFutureDate(AheadOf.Day, -1, "dd/MM/yyyy");
  const DateInImportWithTime = await utils.calculateFutureDate(AheadOf.Day, 0, "dd/MM/yyyy-HH:mm a");

  fs.mkdirSync(path.join(process.cwd(), "store"), { recursive: true });

  const developerName = `Developer ${await utils.generateRandomString(8, { casing: "lower", includeNumbers: true, includeSpecialChars: false })}`;
  const developerId = await inventoryCreator.createDeveloper(developerName);

  const projectName = `Project ${await utils.generateRandomString(8, { casing: "lower", includeNumbers: true, includeSpecialChars: false })}`;
  const createdProject = await inventoryCreator.createProject(
    projectName,
    developerId,
    firstUserId.id,
    firstPreSalesUser.id,
    true,
  );
  const projectId = createdProject.id;

  const towerName = `Tower ${await utils.generateRandomString(8, { casing: "lower", includeNumbers: true, includeSpecialChars: false })}`;
  const towerId = await inventoryCreator.createTower(towerName, projectId, 50);

  const carpet = 100;
  const saleable = 120;
  const loading = String(Math.round(((saleable - carpet) / carpet) * 100));

  const floorPlanName = `Floor Plan ${await utils.generateRandomString(8, { casing: "lower", includeNumbers: true, includeSpecialChars: false })}`;
  const floorPlanId = await inventoryCreator.createFloorPlan({
    developerId,
    projectId,
    projectTowerId: towerId,
    name: floorPlanName,
    type: "apartment",
    category: "premium",
    bedrooms: 1,
    bathrooms: 1,
    measure: "sq_ft",
    carpet,
    saleable,
    baseRate: 1000,
  });

  const unitNamePrefix = `Import-Unit-${await utils.generateRandomString(6, {
    casing: "lower",
    includeNumbers: true,
    includeSpecialChars: false,
  })}`;

  const rowCount = Number(properties.ImportCount || 10);

  const makeRow = (i: number): Record<string, string | number> => ({
    created_by_id: String(firstUserId.id),
    developer_name: developerName,
    project_name: projectName,
    project_tower_name: towerName,
    unit_configuration_name: floorPlanName,

    name: `${unitNamePrefix}-${i + 1}`,
    floor: 2 + i,
    unit_index: 1 + i,

    base_rate: 1000,
    base_price: 0,
    bedrooms: 1,
    bathrooms: 1,
    category: "premium",
    type: "apartment",
    measure: "sq_ft",
    saleable,
    carpet,
    loading,
    status: "available",
    band: "higher",

    // Seller + purpose fields (kept minimal / empty for sale)
    property_purpose: "sale",
    calculated_agreement_value: 0,
    calculated_total_price: 0,
    security_amount: 0,
    maintenance_amount: 0,
    salutation: "",
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    alternate_phone: "",
    alternate_email: "",

    // Optional fields
    images: "",
    facing: "",
    sub_types: "",
    amenities: "",
    publish_unit: "no",
    published_by: "",
    brokerage_type: "",
    brokerage_value: "",
    custom_text: "Custom Text",
    custom_text_aread: "Custom Text Area",
    custom_date: DateInImport,
    custom_date_and_time: DateInImportWithTime,
    custom_checkbox: "Checkbox3,Checkbox1",
    custom_select: "One,Two,Three",
    custom_radio: "Radio3",
    custom_number: 100.1,
    custom_select_multiple_hide_on_form: "1,2",

  });

  const rows: (string | number | boolean | null | undefined)[][] = Array.from({ length: rowCount }, (_, i) => {
    const rowObj = makeRow(i);
    return unitImportHeaders.map(h => rowObj[h] ?? "");
  });

  const fileName = `project_unit_import_ready_${Date.now()}.csv`;
  const filePath = writeCsvFile({
    headers: unitImportHeaders,
    rows,
    fileName,
    importFolder: properties.ImportLocation || "./store",
  });

  await utils.print(`FilePath: ${filePath} | ${developerName} | ${projectName} | ${towerName} | ${floorPlanName} | ${(await crmAPIUtils.getSellDoClientDetails()).name} | ${rowCount}`);
  expect(fs.existsSync(filePath)).toBeTruthy();
  const writtenHeaders = new CSVUtils(filePath).getHeaders();
  expect(writtenHeaders).toEqual(unitImportHeaders);
  expect(floorPlanId).toMatch(/^[a-f0-9]{24}$/i);

  const importResult = await crmAPIUtils.importProjectUnitsCsv(filePath);
  expect(importResult).toBe(`Units import started in background. You'll get email soon on ${properties.Admin_email}`);

  const bulkActionAPIUtils = new BulkActionAPIUtils(clientId, fullAccessAPI);
  await bulkActionAPIUtils.waitTillUnitImportDone();

  const csvDataRows = parseUnitImportCsvDataRows(filePath);
  expect(csvDataRows.length, "CSV data rows must equal ImportCount-driven rowCount").toBe(rowCount);

  const createdByDisplay = `${String(firstUserId.name)
    .replace(/\s+\.\s*$/, "")
    .trim()} .`;
  for (let i = 0; i < rowCount; i++) {
    const row = csvDataRows[i];
    expect(row.name, `row ${i} must include unit name`).toBeTruthy();
    const unit = await inventoryCreator.getProjectUnitShowV2ByUnitName(row.name);
    assertSaleImportedUnitShowV2MatchesCsvRow({
      csvRow: row,
      unit,
      developerId,
      developerName,
      createdProject,
      projectName,
      projectTowerId: towerId,
      projectTowerName: towerName,
      floorPlanName,
      totalFloors: 50,
      createdByDisplay,
      pricingMode: "sale",
    });
  }

  await utils.safeDeleteFiles([filePath]);

});

test("genrate unit import file for resale type", async () => {
  const utils = new Utils();
  const inventoryCreator = new InventoryCreator(clientId, fullAccessAPI);
  const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);

  const firstUserId = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
  const firstPreSalesUser = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.PreSales,{index:0});

  fs.mkdirSync(path.join(process.cwd(), "store"), { recursive: true });

  const developerName = `Developer ${await utils.generateRandomString(8, { casing: "lower", includeNumbers: true, includeSpecialChars: false })}`;
  const developerId = await inventoryCreator.createDeveloper(developerName);

  const projectName = `Project ${await utils.generateRandomString(8, { casing: "lower", includeNumbers: true, includeSpecialChars: false })}`;
  const createdProject = await inventoryCreator.createProject(
    projectName,
    developerId,
    firstUserId.id,
    firstPreSalesUser.id,
    true,
  );
  const projectId = createdProject.id;

  const towerName = `Tower ${await utils.generateRandomString(8, { casing: "lower", includeNumbers: true, includeSpecialChars: false })}`;
  const towerId = await inventoryCreator.createTower(towerName, projectId, 50);

  const carpet = 100;
  const saleable = 120;
  const loading = String(Math.round(((saleable - carpet) / carpet) * 100));

  const floorPlanName = `Floor Plan ${await utils.generateRandomString(8, { casing: "lower", includeNumbers: true, includeSpecialChars: false })}`;
  const floorPlanId = await inventoryCreator.createFloorPlan({
    developerId,
    projectId,
    projectTowerId: towerId,
    name: floorPlanName,
    type: "apartment",
    category: "premium",
    bedrooms: 1,
    bathrooms: 1,
    measure: "sq_ft",
    carpet,
    saleable,
    baseRate: 1000,
  });

  const unitNamePrefix = `Import-Unit-${await utils.generateRandomString(6, {
    casing: "lower",
    includeNumbers: true,
    includeSpecialChars: false,
  })}`;

  const rowCount = Number(properties.ImportCount || 10);
  const rows: (string | number | boolean | null | undefined)[][] = [];

  for (let i = 0; i < rowCount; i++) {
    const phoneTen = await utils.generateRandomPhoneNumber();
    const altPhoneTen = await utils.generateRandomPhoneNumber();
    const email = await utils.generateRandomEmail();
    const altEmail = await utils.generateRandomEmail();

    const rowObj: Record<string, string | number> = {
      created_by_id: String(firstUserId.id),
      developer_name: developerName,
      project_name: projectName,
      project_tower_name: towerName,
      unit_configuration_name: floorPlanName,

      name: `${unitNamePrefix}-${i + 1}`,
      floor: 2 + i,
      unit_index: 1 + i,

      base_rate: 1000,
      base_price: 0,
      bedrooms: 1,
      bathrooms: 1,
      category: "premium",
      type: "apartment",
      measure: "sq_ft",
      saleable,
      carpet,
      loading,
      status: "available",
      band: "higher",

      // Seller + purpose fields
      property_purpose: "resale",
      calculated_agreement_value: 0,
      calculated_total_price: 0,
      security_amount: 0,
      maintenance_amount: 0,
      salutation: "Mr.",
      first_name: "UNit",
      last_name: "Import",
      phone: `+91${phoneTen}`,
      email,
      alternate_phone: `+91${altPhoneTen}`,
      alternate_email: altEmail,

      // Optional fields
      images: "",
      facing: "",
      sub_types: "",
      amenities: "",
      publish_unit: "no",
      published_by: "",
      brokerage_type: "",
      brokerage_value: "",
      custom_text: "Roman",
      custom_text_aread: "Canary",
      custom_date: await utils.calculateFutureDate(AheadOf.Day,0,"dd/MM/yyyy"),
      custom_date_and_time: await utils.calculateFutureDate(AheadOf.Day,0,"dd/MM/yyyy-HH:mm a"),
      custom_checkbox: "Checkbox3,Checkbox1",
      custom_select: "One,Two,Three",
      custom_radio: "Radio2",
      custom_number: 100.1,
    };

    rows.push(unitImportHeaders.map(h => rowObj[h] ?? ""));
  }

  const fileName = `project_unit_import_ready_${Date.now()}.csv`;
  const filePath = writeCsvFile({
    headers: unitImportHeaders,
    rows,
    fileName,
    importFolder: properties.ImportLocation || "./store",
  });

  await utils.print(`FilePath: ${filePath} | ${developerName} | ${projectName} | ${towerName} | ${floorPlanName} | ${(await crmAPIUtils.getSellDoClientDetails()).name} | ${rowCount}`);

  expect(fs.existsSync(filePath)).toBeTruthy();
  const writtenHeaders = new CSVUtils(filePath).getHeaders();
  expect(writtenHeaders).toEqual(unitImportHeaders);
  expect(floorPlanId).toMatch(/^[a-f0-9]{24}$/i);

  const importResult = await crmAPIUtils.importProjectUnitsCsv(filePath);
  expect(importResult).toBe(`Units import started in background. You'll get email soon on ${properties.Admin_email}`);

  const bulkActionAPIUtils = new BulkActionAPIUtils(clientId, fullAccessAPI);
  await bulkActionAPIUtils.waitTillUnitImportDone();

  const csvDataRows = parseUnitImportCsvDataRows(filePath);
  expect(csvDataRows.length, "CSV data rows must equal ImportCount-driven rowCount").toBe(rowCount);

  const createdByDisplay = `${String(firstUserId.name)
    .replace(/\s+\.\s*$/, "")
    .trim()} .`;
  for (let i = 0; i < rowCount; i++) {
    const row = csvDataRows[i];
    expect(row.name, `row ${i} must include unit name`).toBeTruthy();
    const unit = await inventoryCreator.getProjectUnitShowV2ByUnitName(row.name);
    assertSaleImportedUnitShowV2MatchesCsvRow({
      csvRow: row,
      unit,
      developerId,
      developerName,
      createdProject,
      projectName,
      projectTowerId: towerId,
      projectTowerName: towerName,
      floorPlanName,
      totalFloors: 50,
      createdByDisplay,
      pricingMode: "resale",
    });
  }

  await utils.safeDeleteFiles([filePath]);

});

test("genrate unit import file for rental type", async () => {
  const utils = new Utils();
  const inventoryCreator = new InventoryCreator(clientId, fullAccessAPI);
  const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);

  const firstUserId = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
  const firstPreSalesUser = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.PreSales,{index:0});

  await utils.calculateFutureDate(AheadOf.Day,0,"MMM d, yyyy")

  fs.mkdirSync(path.join(process.cwd(), "store"), { recursive: true });

  const developerName = `Developer ${await utils.generateRandomString(8, { casing: "lower", includeNumbers: true, includeSpecialChars: false })}`;
  const developerId = await inventoryCreator.createDeveloper(developerName);

  const projectName = `Project ${await utils.generateRandomString(8, { casing: "lower", includeNumbers: true, includeSpecialChars: false })}`;
  const createdProject = await inventoryCreator.createProject(
    projectName,
    developerId,
    firstUserId.id,
    firstPreSalesUser.id,
    true,
  );
  const projectId = createdProject.id;

  const towerName = `Tower ${await utils.generateRandomString(8, { casing: "lower", includeNumbers: true, includeSpecialChars: false })}`;
  const towerId = await inventoryCreator.createTower(towerName, projectId, 50);

  const carpet = 100;
  const saleable = 120;
  const loading = String(Math.round(((saleable - carpet) / carpet) * 100));

  const floorPlanName = `Floor Plan ${await utils.generateRandomString(8, { casing: "lower", includeNumbers: true, includeSpecialChars: false })}`;
  const floorPlanId = await inventoryCreator.createFloorPlan({
    developerId,
    projectId,
    projectTowerId: towerId,
    name: floorPlanName,
    type: "apartment",
    category: "premium",
    bedrooms: 1,
    bathrooms: 1,
    measure: "sq_ft",
    carpet,
    saleable,
    baseRate: 1000,
  });

  const unitNamePrefix = `Import-Unit-${await utils.generateRandomString(6, {
    casing: "lower",
    includeNumbers: true,
    includeSpecialChars: false,
  })}`;

  const rowCount = Number(properties.ImportCount || 10);
  const rows: (string | number | boolean | null | undefined)[][] = [];

  for (let i = 0; i < rowCount; i++) {
    const phoneTen = await utils.generateRandomPhoneNumber();
    const altPhoneTen = await utils.generateRandomPhoneNumber();
    const email = await utils.generateRandomEmail();
    const altEmail = await utils.generateRandomEmail();

    const rowObj: Record<string, string | number> = {
      created_by_id: String(firstUserId.id),
      developer_name: developerName,
      project_name: projectName,
      project_tower_name: towerName,
      unit_configuration_name: floorPlanName,

      name: `${unitNamePrefix}-${i + 1}`,
      floor: 2 + i,
      unit_index: 1 + i,

      base_rate: 1000,
      base_price: 0,
      bedrooms: 1,
      bathrooms: 1,
      category: "premium",
      type: "apartment",
      measure: "sq_ft",
      saleable,
      carpet,
      loading,
      status: "available",
      band: "higher",

      // Purpose fields
      property_purpose: "rental",
      calculated_agreement_value: 0,
      calculated_total_price: 0,
      security_amount: 0,
      maintenance_amount: 0,
      salutation: "Mrs.",
      first_name: "UNit",
      last_name: "Import",
      phone: `+91${phoneTen}`,
      email,
      alternate_phone: `+91${altPhoneTen}`,
      alternate_email: altEmail,

      // Optional fields
      images: "",
      facing: "",
      sub_types: "",
      amenities: "",
      publish_unit: "no",
      published_by: "",
      brokerage_type: "",
      brokerage_value: "",
      custom_text: "Roman",
      custom_text_aread: "Canary",
      custom_date: await utils.calculateFutureDate(AheadOf.Day,0,"dd/MM/yyyy"),
      custom_date_and_time: await utils.calculateFutureDate(AheadOf.Day,0,"dd/MM/yyyy-HH:mm a"),
      custom_checkbox: "Checkbox3,Checkbox1",
      custom_select: "One,Two,Three",
      custom_radio: "Radio2",
      custom_number: 100.1,
    };

    rows.push(unitImportHeaders.map(h => rowObj[h] ?? ""));
  }

  const fileName = `project_unit_import_ready_${Date.now()}.csv`;
  const filePath = writeCsvFile({
    headers: unitImportHeaders,
    rows,
    fileName,
    importFolder: properties.ImportLocation || "./store",
  });

  await utils.print(`FilePath: ${filePath} | ${developerName} | ${projectName} | ${towerName} | ${floorPlanName} | ${(await crmAPIUtils.getSellDoClientDetails()).name} | ${rowCount}`);

  expect(fs.existsSync(filePath)).toBeTruthy();
  const writtenHeaders = new CSVUtils(filePath).getHeaders();
  expect(writtenHeaders).toEqual(unitImportHeaders);
  expect(floorPlanId).toMatch(/^[a-f0-9]{24}$/i);

  const importResult = await crmAPIUtils.importProjectUnitsCsv(filePath);
  expect(importResult).toBe(`Units import started in background. You'll get email soon on ${properties.Admin_email}`);

  const bulkActionAPIUtils = new BulkActionAPIUtils(clientId, fullAccessAPI);
  await bulkActionAPIUtils.waitTillUnitImportDone();

  const csvDataRows = parseUnitImportCsvDataRows(filePath);
  expect(csvDataRows.length, "CSV data rows must equal ImportCount-driven rowCount").toBe(rowCount);

  const createdByDisplay = `${String(firstUserId.name)
    .replace(/\s+\.\s*$/, "")
    .trim()} .`;
  for (let i = 0; i < rowCount; i++) {
    const row = csvDataRows[i];
    expect(row.name, `row ${i} must include unit name`).toBeTruthy();
    const unit = await inventoryCreator.getProjectUnitShowV2ByUnitName(row.name);
    assertSaleImportedUnitShowV2MatchesCsvRow({
      csvRow: row,
      unit,
      developerId,
      developerName,
      createdProject,
      projectName,
      projectTowerId: towerId,
      projectTowerName: towerName,
      floorPlanName,
      totalFloors: 50,
      createdByDisplay,
      pricingMode: "rental",
    });
  }

  await utils.safeDeleteFiles([filePath]);

});

test("Create multiple Project Units via API and modify them via import file", async () => {
  const utils = new Utils();
  const inventoryCreator = new InventoryCreator(clientId, fullAccessAPI);
  const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
  const bulkActionAPIUtils = new BulkActionAPIUtils(clientId, fullAccessAPI);

  const firstUserId = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
  const firstPreSalesUser = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.PreSales,{index:0});

  const developerName = `Developer ${await utils.generateRandomString(8, { casing: "lower", includeNumbers: true, includeSpecialChars: false })}`;
  const developerId = await inventoryCreator.createDeveloper(developerName);

  const projectName = `Project ${await utils.generateRandomString(8, { casing: "lower", includeNumbers: true, includeSpecialChars: false })}`;
  const createdProject = await inventoryCreator.createProject(
    projectName,
    developerId,
    firstUserId.id,
    firstPreSalesUser.id,
    false,
  );
  const projectId = createdProject.id;

  const towerName = `Tower ${await utils.generateRandomString(8, { casing: "lower", includeNumbers: true, includeSpecialChars: false })}`;
  const towerId = await inventoryCreator.createTower(towerName, projectId, 10);

  const floorPlanName = `Floor Plan ${await utils.generateRandomString(8, { casing: "lower", includeNumbers: true, includeSpecialChars: false })}`;
  const type = "apartment";
  const category = "premium";
  const carpet = 100;
  const saleable = 120;
  const baseRate = 1000;
  const basePrice = saleable * baseRate;

  const floorPlanId = await inventoryCreator.createFloorPlan({
    developerId,
    projectId,
    projectTowerId: towerId,
    name: floorPlanName,
    type,
    category,
    bedrooms: 1,
    bathrooms: 1,
    measure: "sq_ft",
    carpet,
    saleable,
    baseRate,
  });

  const batchName = `ProjectUnitBatch-${await utils.generateRandomString(4, { casing: "lower", includeNumbers: true, includeSpecialChars: false })}`;
  const unitIds = await inventoryCreator.createProjectUnits({
    count: Number(properties.ImportCount || 10),
    developerId,
    projectId,
    projectTowerId: towerId,
    unitConfigurationId: floorPlanId,
    name: batchName,
    floor: 3,
    unitIndex: 10,
    baseRate,
    basePrice,
    propertyPurpose: "sale",
    type,
    category,
  });

  expect(unitIds.length).toBe(Number(properties.ImportCount || 10));
  for (const id of unitIds) {
    expect(id).toMatch(/^[a-f0-9]{24}$/i);
  }

  const rowCount = Number(properties.ImportCount || 10);
  const registrationDate = await utils.calculateFutureDate(AheadOf.Day,10,"dd/MM/yyyy");
  const dateOfPossession = await utils.calculateFutureDate(AheadOf.Day,10,"dd/MM/yyyy");
  const verificationDate = await utils.calculateFutureDate(AheadOf.Day,10,"dd/MM/yyyy");
  const inventoryConstants = await inventoryCreator.getInventoryConstants();
  const parkingOptions = await utils.getValueByIndex(inventoryConstants.parking,1);
  const facingOptions = await utils.getValueByIndex(inventoryConstants.unit_facing,1);
  const unitBandOptions = await utils.getValueByIndex(inventoryConstants.unit_band,1);
  const suitableForOptions = await utils.getValueByIndex(inventoryConstants.suitable_for,1);

  // Constants
  const bedrooms_bulk_modify = 1;
  const bathrooms_bulk_modify = 1;
  const floor_bulk_modify = 1;
  const unit_index_bulk_modify = 1;
  const saleable_bulk_modify = 700;
  const carpet_bulk_modify = 650;
  const loading_bulk_modify = String(Math.round(((Number(saleable_bulk_modify) - Number(carpet_bulk_modify)) / Number(carpet_bulk_modify)) * 100));
  const covered_area_bulk_modify = 1000;
  const terrace_area_bulk_modify = 1000;
  const baseRate_bulk_modify = 1000;
  const basePrice_bulk_modify = saleable_bulk_modify * baseRate_bulk_modify;
  const calculated_agreement_value_bulk_modify = basePrice_bulk_modify * 0.9;
  const calculated_total_price_bulk_modify = basePrice_bulk_modify * 1.1;
  const security_amount_bulk_modify = 5000;
  const maintenance_amount_bulk_modify = 1000;
  const ac_additional_cost_1_bulk_modify = 100;
  const ac_additional_cost_2_bulk_modify = 200;
  const ec_extra_cost_1_bulk_modify = 300;
  const ec_extra_cost_2_bulk_modify = 400;

  // Custom constants
  const custom_text_bulk_modify = "Custom Text";
  const custom_text_aread_bulk_modify = "Custom Text Area";
  const custom_date_bulk_modify = await utils.calculateFutureDate(AheadOf.Day,0,"dd/MM/yyyy");
  const custom_date_and_time_bulk_modify = await utils.calculateFutureDate(AheadOf.Day,0,"dd/MM/yyyy-HH:mm a");
  const custom_checkbox_bulk_modify = "Checkbox3,Checkbox1";
  const custom_select_bulk_modify = "One";
  const custom_radio_bulk_modify = "Radio3";
  const custom_number_bulk_modify = 100.1;
  const custom_select_multiple_hide_on_form_bulk_modify = "1";

  const makeRow = (i: number): Record<string, string | number> => ({
    project_unit_id: unitIds[i],
    status: "available",
    name: `${batchName}-bulk modify-${i + 1}`,
  
    registration_date: registrationDate,
    date_of_possession: dateOfPossession,
    verification_date: verificationDate,
  
    bedrooms: bedrooms_bulk_modify,
    bathrooms: bathrooms_bulk_modify,
  
    salutation: "",
    first_name: "",
    last_name: "",
  
    phone: "",
    email: "",
    alternate_phone: "",
    alternate_email: "",
  
    seller_type: "",
    band: unitBandOptions || "",
    posted_by: "",
  
    suitable_for: suitableForOptions || "",
    facing: facingOptions || "",
    furnishing: "",
    ownership: "",
    flooring: "",
  
    floor: floor_bulk_modify,
    unit_index: unit_index_bulk_modify,
    entrance: "",
    unit_facing_direction: "",
  
    parking: parkingOptions || "",
    document_verification: "",
    property_inspected: "",
    negotiable: "",
  
    saleable: saleable_bulk_modify,
    carpet: carpet_bulk_modify,
  
    loading: loading_bulk_modify,
  
    covered_area: covered_area_bulk_modify,
    terrace_area: terrace_area_bulk_modify,
  
    base_rate: baseRate_bulk_modify,
    base_price: basePrice_bulk_modify,
  
    calculated_agreement_value: calculated_agreement_value_bulk_modify,
    calculated_total_price: calculated_total_price_bulk_modify,
  
    security_amount: security_amount_bulk_modify,
    maintenance_amount: maintenance_amount_bulk_modify,
  
    brokerage_type: "",
    brokerage_value: "",
  
    category: "premium",
    sub_type: "",
    type: "apartment",
  
    interest_percentage: 0,
    grace_period: 0,
  
    published: "",
    published_by: "",
  
    ac_additional_cost_1: ac_additional_cost_1_bulk_modify,
    ac_additional_cost_2: ac_additional_cost_2_bulk_modify,
  
    ec_extra_cost_1: ec_extra_cost_1_bulk_modify,
    ec_extra_cost_2: ec_extra_cost_2_bulk_modify,
  
    custom_text: custom_text_bulk_modify,
    custom_text_aread: custom_text_aread_bulk_modify,
    custom_date: custom_date_bulk_modify,
    custom_date_and_time: custom_date_and_time_bulk_modify,
    custom_checkbox: custom_checkbox_bulk_modify,
    custom_select: custom_select_bulk_modify,
    custom_radio: custom_radio_bulk_modify,
    custom_number: custom_number_bulk_modify,
    custom_select_multiple_hide_on_form: custom_select_multiple_hide_on_form_bulk_modify,

  });

  const rows: (string | number | boolean | null | undefined)[][] = Array.from({ length: rowCount }, (_, i) => {
    const rowObj = makeRow(i);
    return unitModifyImportHeaders.map(h => rowObj[h] ?? "");
  });

  const fileName = `project_unit_modify_import_ready_${Date.now()}.csv`;
  const filePath = writeCsvFile({
    headers: unitModifyImportHeaders,
    rows,
    fileName,
    importFolder: properties.ImportLocation || "./store",
  });

  await utils.print(`FilePath: ${filePath} | ${developerName} | ${projectName} | ${towerName} | ${floorPlanName} | ${(await crmAPIUtils.getSellDoClientDetails()).name} | ${rowCount}`);

  const modifyResult = await crmAPIUtils.importProjectUnitsModifyCsv(filePath);
  expect(modifyResult).toBe(`Units modifications started in background. You'll get email soon on ${properties.Admin_email}`);

  await bulkActionAPIUtils.waitTillUnitModifyImportDone();

  const csvDataRows = parseUnitImportCsvDataRows(filePath);
  const r0 = csvDataRows[0];
  expect(Number(r0.calculated_agreement_value)).toBe(calculated_agreement_value_bulk_modify);
  expect(Number(r0.calculated_total_price)).toBe(calculated_total_price_bulk_modify);
  expect(Number(r0.security_amount)).toBe(security_amount_bulk_modify);
  expect(Number(r0.maintenance_amount)).toBe(maintenance_amount_bulk_modify);
  expect(r0.registration_date).toBe(registrationDate);
  expect(r0.verification_date).toBe(verificationDate);
  expect(r0.date_of_possession).toBe(dateOfPossession);
  expect(r0.band).toBe(unitBandOptions);
  expect(r0.facing).toBe(facingOptions);
  expect(r0.suitable_for).toBe(suitableForOptions);
  expect(r0.parking).toBe(parkingOptions);
  expect(Number(r0.bedrooms)).toBe(bedrooms_bulk_modify);
  expect(Number(r0.bathrooms)).toBe(bathrooms_bulk_modify);
  expect(Number(r0.floor)).toBe(floor_bulk_modify);
  expect(Number(r0.unit_index)).toBe(unit_index_bulk_modify);
  expect(Number(r0.saleable)).toBe(saleable_bulk_modify);
  expect(Number(r0.carpet)).toBe(carpet_bulk_modify);
  expect(Number(r0.covered_area)).toBe(covered_area_bulk_modify);
  expect(Number(r0.terrace_area)).toBe(terrace_area_bulk_modify);
  expect(Number(r0.base_rate)).toBe(baseRate_bulk_modify);
  expect(Number(r0.base_price)).toBe(basePrice_bulk_modify);

  const unit = await inventoryCreator.getProjectUnitShowV2ById(unitIds[0]);

  const parseShowAmount = (v: unknown): number => {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    return Number(String(v ?? "").replace(/,/g, ""));
  };
  const readCf = (u: ProjectUnitShowV2Json, fieldName: string): unknown => {
    const cfs = u["custom_fields"];
    expect(Array.isArray(cfs), "custom_fields must be an array").toBe(true);
    const row = (cfs as { name?: string; value?: unknown }[]).find(c => c.name === fieldName);
    expect(row, `custom_fields must include ${fieldName}`).toBeTruthy();
    return row!.value;
  };
  const splitCsvMultiValue = (raw: string): string[] =>
    raw
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

  expect(unit["name"]).toBe(`${batchName}-bulk modify-1`);
  expect(unit["status_category"]).toBe("available");
  expect(unit["property_purpose"]).toBe("sale");
  expect(unit["unit_configuration_name"]).toBe(floorPlanName);
  expect(unit["bedrooms"]).toBe(bedrooms_bulk_modify);
  expect(unit["band"]).toBe(unitBandOptions);
  expect(unit["facing"]).toBe(facingOptions);
  expect(unit["floor"]).toBe(floor_bulk_modify);
  expect(unit["unit_index"]).toBe(unit_index_bulk_modify);
  expect(unit["possession_date"]).toBe(dateOfPossession);

  const area = unit["area_details"] as Record<string, unknown>;
  expect(area["carpet"]).toBe(carpet_bulk_modify);
  expect(area["saleable"]).toBe(saleable_bulk_modify);
  expect(area["covered_area"]).toBe(covered_area_bulk_modify);
  expect(area["terrace_area"]).toBe(terrace_area_bulk_modify);

  const costing = unit["costing"] as Record<string, unknown>;
  expect(parseShowAmount(costing["base_rate"])).toBe(baseRate_bulk_modify);
  expect(parseShowAmount(costing["base_price"])).toBe(basePrice_bulk_modify);
  // show_v2 agreement / all-inclusive follow Sell.do cost templates, not raw CSV calculated_* columns.
  expect(typeof costing["agreement_value"]).toBe("string");
  expect(typeof costing["all_inclusive_price"]).toBe("string");
  expect(parseShowAmount(costing["agreement_value"])).toBeGreaterThan(0);
  expect(parseShowAmount(costing["all_inclusive_price"])).toBeGreaterThan(0);

  const rooms = unit["room_configurations"] as Record<string, unknown>;
  expect(rooms["toilets"]).toBe(bathrooms_bulk_modify);

  const addCosts = unit["additional_costs"] as { name?: string; value?: string }[];
  expect(Array.isArray(addCosts)).toBe(true);
  const add1 = addCosts.find(c => String(c.name ?? "").includes("1"));
  const add2 = addCosts.find(c => String(c.name ?? "").includes("2"));
  expect(add1?.value).toBe(String(ac_additional_cost_1_bulk_modify));
  expect(add2?.value).toBe(String(ac_additional_cost_2_bulk_modify));

  const extraCosts = unit["extra_costs"] as { name?: string; value?: string }[];
  expect(Array.isArray(extraCosts)).toBe(true);
  const ec1 = extraCosts.find(c => String(c.name ?? "").includes("1"));
  const ec2 = extraCosts.find(c => String(c.name ?? "").includes("2"));
  expect(ec1?.value).toBe(String(ec_extra_cost_1_bulk_modify));
  expect(ec2?.value).toBe(String(ec_extra_cost_2_bulk_modify));

  expect(readCf(unit, "custom_text")).toBe(custom_text_bulk_modify);
  expect(readCf(unit, "custom_text_aread")).toBe(custom_text_aread_bulk_modify);
  expect(readCf(unit, "custom_date")).toBe(custom_date_bulk_modify);
  expect(readCf(unit, "custom_date_and_time")).toBe(custom_date_and_time_bulk_modify);
  expect(readCf(unit, "custom_checkbox")).toEqual(splitCsvMultiValue(custom_checkbox_bulk_modify));
  expect(readCf(unit, "custom_select")).toBe(custom_select_bulk_modify);
  expect(readCf(unit, "custom_radio")).toBe(custom_radio_bulk_modify);
  expect(Number(readCf(unit, "custom_number"))).toBe(Number(custom_number_bulk_modify));

  await utils.safeDeleteFiles([filePath]);
});

