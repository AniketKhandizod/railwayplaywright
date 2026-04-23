import path from "path";
import { config as loadEnv } from "dotenv";

const isRailway = !!(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY);

/** Local / Windows: load `.env` from project root. Railway injects vars directly — no file. */
if (!isRailway) {
  loadEnv({ path: path.join(__dirname, "..", ".env") });
}

/**
 * Required env vars (set in Railway → Variables, or in `.env` locally):
 * - SELLD_PASSWORD
 * - SELLD_ADMIN_EMAIL
 * - SELLD_CLIENT_ID
 * - SELLD_FULL_ACCESS_API
 * - SELLD_RESTRICTED_ACCESS_API
 */
function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (v === undefined || v === "") {
    throw new Error(
      `[properties/v2] Missing required environment variable: ${name}. ` +
        `Add it in Railway Variables or create a local .env (see .env.example).`
    );
  }
  return v;
}

export const properties = {
  // File Paths
  filePath: "/SampleFiles/selldo.gif",
  SampleFilePath: "/SampleFiles/selldo.jpg",
  printLogsToConsole: true,
  /** When false, `Utils.safeDeleteFile` / `safeDeleteFiles` skip deletion (e.g. keep generated import files for debugging). */
  delete_files: false,
  ImportCount: 1,

  PASSWORD: requireEnv("SELLDO_PASSWORD"),
  Admin_email: requireEnv("SELLDO_ADMIN_EMAIL"),
  Client_id: requireEnv("SELLDO_CLIENT_ID"),
  FullAccess_API: requireEnv("SELLDO_FULL_ACCESS_API"),
  RestrictedAccess_API: requireEnv("SELLDO_RESTRICTED_ACCESS_API"),
};
