import { config as loadDotenv } from "dotenv";

loadDotenv();

/**
 * Configuration from process.env only. Names derive from CRM properties/v2.ts keys via envKey().
 *
 * Each variable is resolved in order (first non-empty wins):
 * 1. envKey(propKey) — e.g. Admin_email -> ADMIN_EMAIL
 * 2. SELLD_${envKey(propKey)} — legacy Railway/.env names
 * 3. propKey verbatim — e.g. Client_id
 *
 * Regenerate the full key list from CRM via `node scripts/gen-env-from-v2.cjs`.
 */

/** Canonical env name for a v2.ts property key. */
export function envKey(propKey: string): string {
  return propKey.replace(/([a-z\d])([A-Z])/g, "$1_$2").toUpperCase();
}

/** Ordered candidate env names tried by readEnvRaw (exported for debugging). */
export function envCandidates(propKey: string): readonly string[] {
  const primary = envKey(propKey);
  return [primary, `SELLD_${primary}`, propKey];
}

function readEnvRaw(propKey: string): string | undefined {
  for (const name of envCandidates(propKey)) {
    const v = process.env[name];
    if (v !== undefined && v !== "") return v;
  }
  return undefined;
}

/** Optional string from env (empty string treated as unset). */
function envString(propKey: string): string | undefined {
  return readEnvRaw(propKey);
}

function envBool(propKey: string): boolean | undefined {
  const v = readEnvRaw(propKey);
  if (v === undefined) return undefined;
  const lower = v.toLowerCase();
  if (lower === "true" || lower === "1" || lower === "yes") return true;
  if (lower === "false" || lower === "0" || lower === "no") return false;
  return undefined;
}

function envNum(propKey: string): number | undefined {
  const v = readEnvRaw(propKey);
  if (v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export const properties = {
  APIforVirtualWalkthrough: envString("APIforVirtualWalkthrough"),
  CampeignEmail: envString("CampeignEmail"),
  Campeign_id: envString("Campeign_id"),
  CampaignNameForImportSRD: envString("CampaignNameForImportSRD"),
  Channel_partner_id: envString("Channel_partner_id"),
  Client_id: envString("Client_id"),
  Domain: envString("Domain"),
  Facebook_API_Key: envString("Facebook_API_Key"),
  FullAccess_API: envString("FullAccess_API"),
  GrowAasan: envString("GrowAasan"),
  ImportCount: envNum("ImportCount"),
  ImportLocation: envString("ImportLocation"),
  PASSWORD: envString("PASSWORD"),
  Phonelib_Random_Phone_Api_Key: envString("Phonelib_Random_Phone_Api_Key"),
  PreSales_id: envString("PreSales_id"),
  Project_id: envString("Project_id"),
  RestrictedAccess_API: envString("RestrictedAccess_API"),
  SID: envString("SID"),
  SMS_Template_ID: envString("SMS_Template_ID"),
  SM_00: envString("SM_00"),
  SVPickupLocation_1: envString("SVPickupLocation_1"),
  SVPickupLocation_2: envString("SVPickupLocation_2"),
  SV_Invitee_team: envString("SV_Invitee_team"),
  Sales_id: envString("Sales_id"),
  delete_files: envBool("delete_files"),
  getNumberFromServer: envBool("getNumberFromServer"),
  persistPrintLogsToFile: envBool("persistPrintLogsToFile"),
  printLogFileName: envString("printLogFileName"),
  printLogsStorePath: envString("printLogsStorePath"),
  printLogsToConsole: envBool("printLogsToConsole"),
  salesPhone: envString("salesPhone"),
  teamHierarchyID: envString("teamHierarchyID"),
};
