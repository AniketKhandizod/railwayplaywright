const fs = require("fs");

const v2Path = "C:\\Users\\admin\\Desktop\\CRM\\properties\\v2.ts";
const outPath = require("path").join(__dirname, "..", "Environment", "env.ts");

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

const header = `/**
 * Configuration from process.env only. Names derive from CRM properties/v2.ts keys via envKey():
 * Admin_email -> ADMIN_EMAIL, printLogsToConsole -> PRINT_LOGS_TO_CONSOLE.
 * Set in .env locally and Railway variables.
 */

function envKey(propKey: string): string {
  return propKey.replace(/([a-z\\d])([A-Z])/g, "$1_$2").toUpperCase();
}

/** Optional string from env (empty string treated as unset). */
function envString(propKey: string): string | undefined {
  const v = process.env[envKey(propKey)];
  return v === "" ? undefined : v;
}

function envBool(propKey: string): boolean | undefined {
  const v = process.env[envKey(propKey)];
  if (v === undefined || v === "") return undefined;
  const lower = v.toLowerCase();
  if (lower === "true" || lower === "1" || lower === "yes") return true;
  if (lower === "false" || lower === "0" || lower === "no") return false;
  return undefined;
}

function envNum(propKey: string): number | undefined {
  const v = process.env[envKey(propKey)];
  if (v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** JSON array (e.g. ["a","b"]) or comma-separated values. */
function envStringArray(propKey: string): string[] | undefined {
  const v = process.env[envKey(propKey)];
  if (v === undefined || v === "") return undefined;
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
