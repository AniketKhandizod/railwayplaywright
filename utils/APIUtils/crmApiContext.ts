import { request, type APIRequestContext } from "@playwright/test";

/** Hostnames that must not be used as Sell.Do CRM API origins when mis-set from templates. */
function isPlaywrightDocsDefaultHost(url: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase();
    return h === "railway.com" || h === "www.railway.com";
  } catch {
    return false;
  }
}

function normalizeApiOrigin(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");
  try {
    const u = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    return u.origin;
  } catch {
    return trimmed;
  }
}

/**
 * Origin for CRM JSON APIs (`/api/...`, `/client/...`).
 *
 * Railway: set **`CRM_API_BASE_URL`** to your Sell.Do base (e.g. `https://your-org.amuratech.in`).
 * Falls back to **`BASE_URL`** only when it is not the generic Playwright template default (`railway.com`).
 */
export function getCrmApiBaseURL(): string {
  const explicit =
    process.env.CRM_API_BASE_URL?.trim() || process.env.SELLD_CRM_API_BASE_URL?.trim();
  if (explicit) return normalizeApiOrigin(explicit);

  const base = process.env.BASE_URL?.trim();
  if (base && !isPlaywrightDocsDefaultHost(base)) return normalizeApiOrigin(base);

  return "";
}

/** Shared API context for CRM calls (relative paths resolve against {@link getCrmApiBaseURL}). */
export async function newCrmApiRequestContext(): Promise<APIRequestContext> {
  const baseURL = getCrmApiBaseURL();
  if (!baseURL) {
    throw new Error(
      "Set CRM_API_BASE_URL (or a non-default BASE_URL) to your Sell.Do CRM origin, e.g. https://example.amuratech.in",
    );
  }
  return request.newContext({ baseURL });
}
