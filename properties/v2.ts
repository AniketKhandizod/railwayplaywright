import path from "path";
import { config as loadEnv } from "dotenv";

/**
 * Merge root `.env` if it exists. Default `dotenv` does not override vars already set
 * (e.g. Railway-injected), so deploy + local both behave correctly.
 */
loadEnv({ path: path.join(__dirname, "..", ".env") });

function firstDefined(...names: string[]): string | undefined {
  for (const name of names) {
    const v = process.env[name]?.trim();
    if (v !== undefined && v !== "") return v;
  }
  return undefined;
}

/** Primary name first, then common Railway / typo aliases */
const SECRETS = {
  PASSWORD: [
    "SELLDO_PASSWORD",
    "SELLD_PASSWORD", // typo seen in older .env.example
    "E2E_PASSWORD",
    "PASSWORD",
  ],
  Admin_email: [
    "SELLDO_ADMIN_EMAIL",
    "SELLD_ADMIN_EMAIL",
    "E2E_ADMIN_EMAIL",
    "ADMIN_EMAIL",
  ],
  Client_id: [
    "SELLDO_CLIENT_ID",
    "SELLD_CLIENT_ID",
    "E2E_CLIENT_ID",
    "CLIENT_ID",
  ],
  FullAccess_API: [
    "SELLDO_FULL_ACCESS_API",
    "SELLD_FULL_ACCESS_API",
    "FULL_ACCESS_API",
  ],
  RestrictedAccess_API: [
    "SELLDO_RESTRICTED_ACCESS_API",
    "SELLD_RESTRICTED_ACCESS_API",
    "RESTRICTED_ACCESS_API",
  ],
} as const;

type SecretField = keyof typeof SECRETS;

function loadSecrets(): Record<SecretField, string> {
  const missing: string[] = [];
  const out = {} as Record<SecretField, string>;

  for (const field of Object.keys(SECRETS) as SecretField[]) {
    const aliases = SECRETS[field];
    const v = firstDefined(...aliases);
    if (v === undefined) {
      missing.push(
        `${field}: set ${aliases[0]} (or alias: ${aliases.slice(1).join(", ")})`
      );
    } else {
      out[field] = v;
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[properties/v2] Missing ${missing.length} credential(s). Add them in Railway → Service → Variables (shared vars must be linked to this service), or in project root .env:\n` +
        missing.map((line) => `  • ${line}`).join("\n") +
        `\nSee .env.example for names.\n` +
        `Tip: Specs that import this file (or PlaywrightTestUtils / *APIUtils*) need these vars. For UI-only runs, avoid those imports or use PW_SKIP_ENV_CHECK=1 (see package.json test:light).`
    );
  }

  return out;
}

const secrets = loadSecrets();

function looksLikeHostname(s: string): boolean {
  if (!s || s.includes("/") || s.includes(" ")) return false;
  if (s === "localhost" || /^localhost:\d+$/i.test(s)) return true;
  const h = s.replace(/^\*\./, "");
  return /^[a-z0-9][-a-z0-9.]*[a-z0-9]$/i.test(h);
}

function loadApiBaseUrl(): string {
  const raw = firstDefined(
    "SELLDO_API_BASE_URL",
    "SELLDO_API_BASEURL",
    "SELLDO_BASE_URL",
    "SELLDO_SITE_URL",
    "API_BASE_URL",
    "CRM_BASE_URL",
    "CRM_API_URL",
    "PLAYWRIGHT_BASE_URL",
    "BASE_URL",
  );

  const subdomainOnly = firstDefined(
    "SELLDO_SUBDOMAIN",
    "SELLDO_TENANT",
    "TENANT_SUBDOMAIN",
  );

  let candidate = raw;
  if (candidate === undefined && subdomainOnly !== undefined) {
    const sub = subdomainOnly
      .replace(/^https?:\/\//i, "")
      .split("/")[0]
      .replace(/\.sell\.do$/i, "")
      .trim();
    if (sub) candidate = `https://${sub}.sell.do`;
  }

  if (candidate === undefined) {
    throw new Error(
      `[properties/v2] Missing API base URL. In Railway → Variables set SELDO_API_BASE_URL (full URL, e.g. https://your-subdomain.sell.do) ` +
        `or SELDO_SUBDOMAIN (tenant slug only; expands to https://{slug}.sell.do). ` +
        `Aliases: SELDO_SITE_URL, CRM_BASE_URL, PLAYWRIGHT_BASE_URL. See .env.example.`
    );
  }

  let u = candidate.trim().replace(/\/$/, "");
  if (!/^https?:\/\//i.test(u)) {
    if (/\.sell\.do$/i.test(u)) {
      u = `https://${u}`;
    } else if (/^[a-z0-9][-a-z0-9]*$/i.test(u)) {
      u = `https://${u}.sell.do`;
    } else if (looksLikeHostname(u)) {
      u = `https://${u}`;
    } else {
      throw new Error(
        `[properties/v2] API base URL must be a full https URL or a hostname. Got: ${JSON.stringify(candidate)}`
      );
    }
  }
  return u;
}

const API_BASE_URL = loadApiBaseUrl();

export const properties = {
  // File Paths
  filePath: "/SampleFiles/selldo.gif",
  SampleFilePath: "/SampleFiles/selldo.jpg",
  printLogsToConsole: true,
  /** When false, `Utils.safeDeleteFile` / `safeDeleteFiles` skip deletion (e.g. keep generated import files for debugging). */
  delete_files: false,
  ImportCount: 1,

  API_BASE_URL,

  PASSWORD: secrets.PASSWORD,
  Admin_email: secrets.Admin_email,
  Client_id: secrets.Client_id,
  FullAccess_API: secrets.FullAccess_API,
  RestrictedAccess_API: secrets.RestrictedAccess_API,
};
