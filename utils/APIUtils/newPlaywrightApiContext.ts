import { request, type APIRequestNewContextOptions } from "@playwright/test";
import { properties } from "../../properties/v2";

export function playwrightApiContextOptions(): APIRequestNewContextOptions {
  return { baseURL: properties.API_BASE_URL };
}

/** Use for every `request.newContext()` so `/client/...` paths resolve on Railway and locally. */
export async function newPlaywrightApiContext() {
  return request.newContext(playwrightApiContextOptions());
}
