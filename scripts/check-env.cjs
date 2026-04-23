"use strict";

/**
 * Runs before Playwright so Railway logs show a clear env error instead of
 * "No tests found" after properties/v2 fails during test file load.
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

/** UI-only / smoke without API: set PW_SKIP_ENV_CHECK=1 (do not use on Railway for API tests). */
if (
  process.env.PW_SKIP_ENV_CHECK === "1" ||
  process.env.PW_SKIP_ENV_CHECK === "true"
) {
  process.exit(0);
}

function firstDefined(...names) {
  for (const name of names) {
    const v = process.env[name]?.trim();
    if (v !== undefined && v !== "") return v;
  }
  return undefined;
}

const SECRET_GROUPS = [
  ["PASSWORD", ["SELLDO_PASSWORD", "SELLD_PASSWORD", "E2E_PASSWORD", "PASSWORD"]],
  ["Admin_email", ["SELLDO_ADMIN_EMAIL", "SELLD_ADMIN_EMAIL", "E2E_ADMIN_EMAIL", "ADMIN_EMAIL"]],
  ["Client_id", ["SELLDO_CLIENT_ID", "SELLD_CLIENT_ID", "E2E_CLIENT_ID", "CLIENT_ID"]],
  ["FullAccess_API", ["SELLDO_FULL_ACCESS_API", "SELLD_FULL_ACCESS_API", "FULL_ACCESS_API"]],
  [
    "RestrictedAccess_API",
    ["SELLDO_RESTRICTED_ACCESS_API", "SELLD_RESTRICTED_ACCESS_API", "RESTRICTED_ACCESS_API"],
  ],
];

function looksLikeHostname(s) {
  if (!s || s.includes("/") || s.includes(" ")) return false;
  if (s === "localhost" || /^localhost:\d+$/i.test(s)) return true;
  const h = s.replace(/^\*\./, "");
  return /^[a-z0-9][-a-z0-9.]*[a-z0-9]$/i.test(h);
}

function resolveApiBaseUrl() {
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
    return {
      ok: false,
      detail:
        "Set SELDO_API_BASE_URL (full URL, e.g. https://your-subdomain.sell.do) or SELDO_SUBDOMAIN (slug only → https://{slug}.sell.do). Aliases: SELDO_SITE_URL, CRM_BASE_URL, PLAYWRIGHT_BASE_URL.",
    };
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
      return {
        ok: false,
        detail: `Invalid API base (need https URL or hostname): ${JSON.stringify(candidate)}`,
      };
    }
  }

  return { ok: true, url: u };
}

const problems = [];

for (const [label, keys] of SECRET_GROUPS) {
  if (firstDefined(...keys) === undefined) {
    problems.push(`${label}: set ${keys[0]} (aliases: ${keys.slice(1).join(", ")})`);
  }
}

const api = resolveApiBaseUrl();
if (!api.ok) {
  problems.push(`API_BASE_URL: ${api.detail}`);
}

if (problems.length > 0) {
  console.error("\n[check-env] Fix these before running Playwright:\n");
  for (const p of problems) {
    console.error("  •", p);
  }
  console.error(
    "\nRailway: open your **service** (not only the project) → **Variables** → add the missing names. Shared/project variables must be **referenced** on this service.",
  );
  console.error("Reference: https://docs.railway.com/develop/variables\n");
  console.error("Local: copy .env.example → .env and fill values.\n");
  process.exit(1);
}
