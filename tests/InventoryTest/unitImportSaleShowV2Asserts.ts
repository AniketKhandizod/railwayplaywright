import { expect } from "@playwright/test";
import { DateTime } from "luxon";
import type { CreatedProjectSummary, ProjectUnitShowV2Json } from "../../utils/APIUtils/InventoryAPIUtils/InventoryCreator";
import { CSVUtils } from "../../utils/CSVGenerator/CSVUtils";

/** Data rows only (excludes header), each keyed by CSV header name. */
export function parseUnitImportCsvDataRows(filePath: string): Record<string, string>[] {
  const csv = new CSVUtils(filePath);
  const all = csv.readAll();
  if (all.length < 2) return [];
  const headers = all[0];
  return all.slice(1).map(cells => {
    const row: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = cells[i] ?? "";
    }
    return row;
  });
}

function floorDisplayName(floorNum: number): string {
  const n = Math.trunc(floorNum);
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${n}th Floor`;
  switch (n % 10) {
    case 1:
      return `${n}st Floor`;
    case 2:
      return `${n}nd Floor`;
    case 3:
      return `${n}rd Floor`;
    default:
      return `${n}th Floor`;
  }
}

function formatAmountOneDecimal(n: number): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);
}

/** Matches Sell.do show_v2 formatting for date-only custom fields (UTC midnight). */
export function expectedCustomDateApiValue(csvDateDdMmYyyy: string): string {
  const dt = DateTime.fromFormat(csvDateDdMmYyyy.trim(), "dd/MM/yyyy", { zone: "utc" });
  if (!dt.isValid) {
    throw new Error(`Invalid custom_date CSV value: ${csvDateDdMmYyyy} (${dt.invalidExplanation ?? "unknown"})`);
  }
  return dt.toFormat("yyyy/MM/dd") + " 00:00:00 +0000";
}

/** Import timestamps are authored in Asia/Kolkata (see Utils.calculateFutureDate). */
export function expectedCustomDateTimeApiValue(csvDateTime: string): string {
  // `calculateFutureDate` uses `HH:mm` together with `a`, so values look like "14/04/2026-17:50 PM".
  // Strip the redundant meridiem and parse as a 24-hour wall clock in IST.
  const trimmed = csvDateTime.trim().replace(/\s*(AM|PM)\s*$/i, "");
  const dt = DateTime.fromFormat(trimmed, "dd/MM/yyyy-HH:mm", { zone: "Asia/Kolkata" });
  if (!dt.isValid) {
    throw new Error(
      `Invalid custom_date_and_time CSV value: ${csvDateTime} (${dt.invalidExplanation ?? "unknown"})`,
    );
  }
  return dt.toUTC().toFormat("yyyy/MM/dd HH:mm:ss") + " +0000";
}

function readCf(unit: ProjectUnitShowV2Json, fieldName: string): { label: string; value: unknown } {
  const cfs = unit["custom_fields"];
  expect(Array.isArray(cfs), "custom_fields must be an array").toBe(true);
  const row = (cfs as { name?: string; label?: string; value?: unknown }[]).find(c => c.name === fieldName);
  expect(row, `custom_fields must include ${fieldName}`).toBeTruthy();
  return { label: String(row!.label ?? ""), value: row!.value };
}

function splitCsvMultiValue(raw: string): string[] {
  return raw
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

/** Sale import fills agreement/base from carpet config; resale/rental show_v2 uses zeroed sale columns + different maintenance. */
export type UnitImportPricingMode = "sale" | "resale" | "rental";

function expectedCostingForMode(
  r: Record<string, string>,
  mode: UnitImportPricingMode,
): Record<string, string> {
  const zero = formatAmountOneDecimal(0);
  const baseRateNum = Number(r.base_rate);
  const basePriceCsv = Number(r.base_price);
  const saleableNum = Number(r.saleable);
  const computedAgreement = saleableNum * baseRateNum;

  if (mode === "sale") {
    const agreementLike = basePriceCsv > 0 ? basePriceCsv : computedAgreement;
    return {
      base_rate: formatAmountOneDecimal(baseRateNum),
      base_price: formatAmountOneDecimal(agreementLike),
      agreement_value: formatAmountOneDecimal(agreementLike),
      all_inclusive_price: formatAmountOneDecimal(agreementLike),
      maintenance: "N/A",
    };
  }

  if (mode === "resale") {
    return {
      base_rate: zero,
      base_price: zero,
      agreement_value: zero,
      all_inclusive_price: zero,
      maintenance: "N/A",
    };
  }

  // rental
  const maintenanceNum = Number(r.maintenance_amount ?? 0);
  return {
    base_rate: zero,
    base_price: zero,
    agreement_value: zero,
    all_inclusive_price: zero,
    maintenance: formatAmountOneDecimal(maintenanceNum),
  };
}

export function assertSaleImportedUnitShowV2MatchesCsvRow(options: {
  csvRow: Record<string, string>;
  unit: ProjectUnitShowV2Json;
  developerId: string;
  developerName: string;
  createdProject: CreatedProjectSummary;
  projectName: string;
  projectTowerId: string;
  projectTowerName: string;
  floorPlanName: string;
  totalFloors: number;
  createdByDisplay: string;
  /** Defaults to sale (computed agreement from carpet/saleable when base_price is 0). */
  pricingMode?: UnitImportPricingMode;
}): void {
  const r = options.csvRow;
  const u = options.unit;

  const floorNum = Number(r.floor);
  const unitIndexNum = Number(r.unit_index);
  const mode = options.pricingMode ?? "sale";
  const baseRateNum = Number(r.base_rate);
  const saleableNum = Number(r.saleable);
  const carpetNum = Number(r.carpet);
  const loadingNum = Number(r.loading);
  const bedroomsNum = Number(r.bedrooms);
  const bathroomsNum = Number(r.bathrooms);

  expect(u.name).toBe(r.name);
  expect(u.score).toBe(0);
  expect(u.status_category).toBe(r.status);
  expect(u.status_display).toBe(r.status);
  expect(u.property_purpose).toBe(r.property_purpose);
  expect(u.unit_configuration_name).toBe(r.unit_configuration_name);
  expect(u.unit_index).toBe(unitIndexNum);
  expect(u.floor).toBe(floorNum);
  expect(u.facing).toBe(r.facing ?? "");
  expect(u.title_motto).toBeNull();
  expect(u.marketing_description).toBeNull();
  expect(u.possession_status).toBe("");
  expect(u.sub_type).toBe(r.sub_types ?? "");
  expect(u.band).toBe(r.band);
  expect(u.contract_type).toBeNull();
  expect(u.land_gradient).toBeNull();
  expect(u.ownership).toBeNull();
  expect(u.bedrooms).toBe(bedroomsNum);
  expect(u.furnishing).toBe("");
  expect(u.loading).toBe(loadingNum);
  expect(u.category).toBe(r.category);
  expect(u.construction_status).toBe("");
  expect(u.transaction_type).toBe("");
  expect(u.flooring).toBe("");
  expect(u.entrance).toBe("");
  expect(String(u.id)).toMatch(/^[a-f0-9]{24}$/i);
  expect(u.property_type).toBe("");
  expect(u.total_floors).toBe(options.totalFloors);
  expect(u.floor_name).toBe(floorDisplayName(floorNum));
  expect(u.possession_date).toBe(options.createdProject.possession);
  expect(u.bedrooms_display).toBe(`${bedroomsNum}.0 BHK`);
  expect(u.created_by).toBe(options.createdByDisplay);
  expect(u.published_by).toBeNull();
  expect(u.currency_symbol).toBe("₹");
  expect(u.measure_label).toBe("Sq. Ft.");
  expect(u.can_edit).toBe(true);
  expect(u.approval_configuration_exists).toBe(false);

  expect(u.developer).toEqual({
    id: options.developerId,
    name: options.developerName,
  });

  const p = options.createdProject;
  const fullAddress = `${p.address1}, ${p.address2}, ${p.city}, ${p.state}, ${p.country}, ${p.zip}`;
  expect(u.project).toEqual({
    id: p.id,
    name: options.projectName,
    address: fullAddress,
    street: p.address1,
    state: p.state,
    city: p.city,
    zip: p.zip,
  });

  expect(u.project_tower).toEqual({
    id: options.projectTowerId,
    name: options.projectTowerName,
  });

  expect(u.area_details).toEqual({
    carpet: carpetNum,
    saleable: saleableNum,
    built_up_area: 0,
    project_area: 0,
    covered_area: 0,
    terrace_area: 0,
  });

  expect(u.costing).toEqual(expectedCostingForMode(r, mode));

  expect(u.room_configurations).toEqual({
    total_rooms: 0,
    living_rooms: 0,
    balconies: 0,
    kitchens: 0,
    dining_rooms: 0,
    studies: 0,
    guest_houses: 0,
    storage_rooms: 0,
    parking_spaces: 0,
    garages: 0,
    toilets: bathroomsNum,
    staff_accommodation: 0,
  });

  expect(readCf(u, "custom_text").value).toBe(r.custom_text);
  expect(readCf(u, "custom_text_aread").value).toBe(r.custom_text_aread);
  expect(readCf(u, "custom_date").value).toBe(expectedCustomDateApiValue(r.custom_date));
  expect(readCf(u, "custom_date_and_time").value).toBe(expectedCustomDateTimeApiValue(r.custom_date_and_time));
  expect(readCf(u, "custom_checkbox").value).toEqual(splitCsvMultiValue(r.custom_checkbox));
  expect(readCf(u, "custom_select").value).toEqual(splitCsvMultiValue(r.custom_select));
  expect(readCf(u, "custom_radio").value).toBe(r.custom_radio);
  expect(Number(readCf(u, "custom_number").value)).toBe(Number(r.custom_number));

  if (r.custom_select_multiple_hide_on_form?.length) {
    expect(readCf(u, "custom_select_multiple_hide_on_form").value).toEqual(
      splitCsvMultiValue(r.custom_select_multiple_hide_on_form),
    );
  }

  const longText = readCf(u, "custom_text_field_long_text_as_expected_more_than_values_are_so_long");
  expect(longText.value).toBe("N/A");

  const disabledTa = readCf(u, "custom_disabled_text_area");
  expect(disabledTa.value).toBe("N/A");

  expect(u.amenities).toEqual({
    basic: [],
    featured: [],
    nearby: [],
    other: [],
  });

  expect(u.gallery).toEqual({
    images: [],
    urls: [],
    documents: [],
  });
}
