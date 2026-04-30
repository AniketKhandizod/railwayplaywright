import { expect, APIRequestContext, request } from "@playwright/test";
import { Utils } from "../PlaywrightTestUtils";

export class ChannelPartnerAPIUtils {
  private request!: APIRequestContext;
  private utils!: Utils;
  private readonly clientId: string;
  private readonly apiKey: string;

  constructor(clientId: string, apiKey: string){
    this.clientId = clientId;
    this.apiKey = apiKey;
  }

  private async initializeRequest() {
    if (!this.request) {
      this.utils = new Utils();
      this.request = await request.newContext();
    }
  }

  async getChannelPartnerDetailsById(userId: string | null) {
    await this.initializeRequest();
    const URL = `/client/channel_partners/${userId}.json?api_key=${this.apiKey}&client_id=${this.clientId}`;

    const response = await this.request.get(URL);

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    return responseBody;
  }

  /**
   * GET `/client/channel_partners.json` with `filters[active]=true` (same as
   * `https://v2.sell.do/client/channel_partners.json?filters%5Bactive%5D=true` plus auth params).
   * `index` is 1-based (first row is `{ index: 1 }`).
   */
  async getActiveChannelPartnerIdByListingIndex(options: { index: number }): Promise<string> {
    await this.initializeRequest();

    const response = await this.request.get(`/client/channel_partners.json`, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
        "filters[active]": "true",
      },
      headers: { Accept: "application/json" },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    const list: unknown[] = Array.isArray(body)
      ? body
      : Array.isArray((body as { results?: unknown })?.results)
        ? ((body as { results: unknown[] }).results)
        : [];

    const { index } = options;
    if (!Number.isFinite(index) || !Number.isInteger(index) || index < 1) {
      throw new Error(
        `getActiveChannelPartnerIdByListingIndex: index must be a positive integer (1-based), got ${String(index)}`,
      );
    }

    const i = index - 1;
    if (i >= list.length) {
      throw new Error(
        `getActiveChannelPartnerIdByListingIndex: index ${index} is out of range (listing length: ${list.length})`,
      );
    }

    const row = list[i] as { _id?: unknown };
    if (row == null || typeof row !== "object" || row._id == null) {
      throw new Error(`getActiveChannelPartnerIdByListingIndex: invalid item at index ${index}`);
    }

    return String(row._id);
  }

  
}