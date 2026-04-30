const fs = require("fs");

const v2Path = "C:\\Users\\admin\\Desktop\\CRM\\properties\\v2.ts";
const outPath = require("path").join(__dirname, "..", "utils", "env.ts");

const text = fs.readFileSync(v2Path, "utf8");
const start = text.indexOf("export const properties = {");
const braceStart = text.indexOf("{", start);
let depth = 0;
let i = braceStart;
for (; i < text.length; i++) {
  const c = text[i];
  if (c === "{") depth++;
  else if (c === "}") {
    depth--;
    if (depth === 0) {
      i++;
      break;
    }
  }
}
const body = text.slice(braceStart + 1, i - 1);
const lines = body.split(/\r?\n/);
const entries = [];

let inBlockComment = false;
for (const line of lines) {
  let trimmed = line.trim();
  if (inBlockComment) {
    if (trimmed.includes("*/")) inBlockComment = false;
    continue;
  }
  if (trimmed.startsWith("/**")) {
    if (!trimmed.includes("*/")) inBlockComment = true;
    continue;
  }
  if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("*")) continue;
  const idx = trimmed.indexOf(":");
  if (idx <= 0) continue;
  const key = trimmed.slice(0, idx).trim();
  if (!/^[A-Za-z_]\w*$/.test(key)) continue;
  let rest = trimmed.slice(idx + 1);
  const ci = rest.indexOf("//");
  if (ci >= 0) rest = rest.slice(0, ci);
  let val = rest.trim().replace(/,\s*$/, "").trim();

  let reader;
  if (val === "true" || val === "false") reader = "bool";
  else if (/^-?\d+$/.test(val)) reader = "num";
  else if (val.startsWith("[")) reader = "arr";
  else reader = "str";

  entries.push({ key, reader });
}

const header = `import { config as loadDotenv } from "dotenv";

loadDotenv();

/**
 * Configuration from process.env only. Names derive from CRM properties/v2.ts keys via envKey().
 *
 * Each variable is resolved in order (first non-empty wins):
 * 1. envKey(propKey) — e.g. Admin_email -> ADMIN_EMAIL, api_teamId -> API_TEAM_ID
 * 2. SELLD_\${envKey(propKey)} — legacy Railway/.env names (SELLD_ADMIN_EMAIL, SELLD_CLIENT_ID, …)
 * 3. propKey verbatim — e.g. Client_id (matches variables pasted from CRM key names)
 *
 * Use a root \`.env\` locally (loaded above); set the same names on Railway.
 */

/** Canonical env name for a v2.ts property key. */
export function envKey(propKey: string): string {
  return propKey.replace(/([a-z\\d])([A-Z])/g, "$1_$2").toUpperCase();
}

/** Ordered candidate env names tried by readEnvRaw (exported for debugging). */
export function envCandidates(propKey: string): readonly string[] {
  const primary = envKey(propKey);
  return [primary, \`SELLD_\${primary}\`, propKey];
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

/** JSON array (e.g. ["a","b"]) or comma-separated values. */
function envStringArray(propKey: string): string[] | undefined {
  const v = readEnvRaw(propKey);
  if (v === undefined) return undefined;
  const trimmed = v.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed.map(String) : undefined;
    } catch {
      return undefined;
    }
  }
  return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
}

export const properties = {
`;

const readerFn = { str: "envString", bool: "envBool", num: "envNum", arr: "envStringArray" };

const propsBody = entries.map(({ key, reader }) => `  ${key}: ${readerFn[reader]}("${key}"),`).join("\n");

const footer = `
};
`;

fs.writeFileSync(outPath, header + propsBody + footer, "utf8");
console.log(`Wrote ${entries.length} keys to ${outPath}`);
