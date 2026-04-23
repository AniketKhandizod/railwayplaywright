import { expect, APIRequestContext, test, request } from "@playwright/test";
import { properties } from "../../properties/v2";
import { Utils } from "../PlaywrightTestUtils";

export class CampaignAPIUtils {
  private request: APIRequestContext;
  private utils: Utils;
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

  // ✅ Delete SRD (Sales Rules Definition)
  async deleteSRD(
    srdId: string,
  ): Promise<void> {
    await this.initializeRequest();
    
    const url = `/rules/${srdId}`;
    
      const response = await this.request.delete(url, {
        params: {
          api_key: this.apiKey,
          client_id: this.clientId,
        },
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout
      });

      expect(await response.text()).toContain("Campaign rule deleted successfully.");
  }

  /**
   * Create SRD (Sales Rules Definition) via:
   * POST https://v2.sell.do/rules.json
   *
   * Uses the same form fields as your curl, while NOT requiring the values you listed as fixed.
   * Returns the created SRD id (rule id).
   */
  async createSRD(input: {
    entityType: string; // rule[entity_type]
    campaignApiRuleId: string; // rule[campaign_api_rule_id]
    entityId: string; // rule[entity_id]
    campaign: string; // rule[campaign]
    projectId: string; // rule[project_id]
    source: string; // rule[source]
    subSource: string; // rule[sub_source]
  }): Promise<string> {
    await this.initializeRequest();

    const formData: Record<string, string> = {
      utf8: "✓",

      "rule[entity_type]": input.entityType,
      "rule[campaign_api_rule_id]": input.campaignApiRuleId,
      "rule[entity_value]": "",
      "rule[entity_id]": input.entityId,
      "rule[campaign]": input.campaign,
      "rule[project_id]": input.projectId,
      "rule[source]": input.source,
      "rule[sub_source]": input.subSource,

      // Fixed empty values (do not ask at method level)
      "rule[adwords_account_id]": "",
      "rule[adwords_campaign_ids]": "",
      "rule[adverts_account_id]": "",
      "rule[adverts_campaign_ids]": "",
      "rule[associated_virtual_phone_id]": "",
      "rule[associated_short_code]": "",

      // Fixed pagination values (do not ask at method level)
      next_tab_index: "",
      page: "",
    };

    const response = await this.request.post(`/rules.json`, {
      params: {
        api_key: this.apiKey,
        client_id: this.clientId,
      },
      form: formData,
      headers: {
        accept: "application/json",
      },
    });
    console.log(response.body());
    expect(response.status()).toBe(200);

    // Response shape can vary; attempt common id locations.
    const body = await response
      .json()
      .catch(async () => ({ text: await response.text() }));

    const id =
      body?._id ??
      body?.id ??
      body?.rule?._id ??
      body?.rule?.id ??
      body?.data?._id ??
      body?.data?.id;

    if (!id) {
      throw new Error(`SRD create failed: missing id in response. Response: ${JSON.stringify(body)}`);
    }

    return String(id);
  }

}
