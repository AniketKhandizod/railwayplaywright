import { expect, request } from "@playwright/test";
import { properties } from "../../Environment/v2";
import { Utils } from "../PlaywrightTestUtils";
import { UserManagementAPIUtils } from "./UserManagementAPIUtils";

export enum MediumType {
  ApiClient = "ApiClient",
  Email = "Email",
  manual_entry = "manual_entry",
  VirtualNumber = "VirtualNumber",
  Whatsapp = "Whatsapp",
  WhatsAppWidget = "WhatsAppWidget"
}

export enum RoutingRuleStrategy {
  weighted_round_robin = "weighted_round_robin",
  round_robin = "round_robin"
}

export class RoutingAPIUtils{

  private readonly clientId: string;
  private readonly apiKey: string;

  constructor(clientId: string, apiKey: string){
    this.clientId = clientId;
    this.apiKey = apiKey;
  }

    private async getRoutingRules(): Promise<any> {
        const url = `/client/configuration/routing_configuration/routing_rules.json`;
      
        const req = await request.newContext();
        const response = await req.get(url, {
          params: {
            client_id: this.clientId,
            api_key: this.apiKey,
          },
        });
      
        expect(response.status()).toBe(200);
        return await response.json();
      }

    private async deleteRoutingRuleById(ruleId: string): Promise<void> {
        const url = `/client/configuration/routing_configuration/routing_rules/${ruleId}.json`;
      
        const req = await request.newContext();
        const response = await req.post(url, {
          params: {
            client_id: this.clientId,
            api_key: this.apiKey,
          },
          form: {
            _method: 'delete',
          },
        });
      
        expect(response.status()).toBe(200);
      }

    async deleteNonDefaultRules(): Promise<string> {
      const rules = await this.getRoutingRules();
      const rulesList: any[] = Array.isArray(rules) ? rules : Array.isArray(rules?.results) ? rules.results : [];

      const defaultRule = rulesList.find((r) => r?.name === "default");
      const defaultRuleId = defaultRule?._id ? String(defaultRule._id) : "";

      const nonDefaultRuleIds = rulesList
        .filter((r) => r?.name !== "default" && r?._id)
        .map((r) => String(r._id));

      // Delete all non-default rules (in parallel for speed).
      await Promise.all(nonDefaultRuleIds.map((id) => this.deleteRoutingRuleById(id)));

      return defaultRuleId; // empty string if no default rule is found
    }

     async getRoutingConfiguration(): Promise<any> {
        const url = `/client/configuration/routing_configuration.json`;
      
        const req = await request.newContext();
        const response = await req.get(url, {
          params: {
            client_id: this.clientId,
            api_key: this.apiKey,
          },
        });
      
        expect(response.status()).toBe(200);
        return await response.json();
      }

      async updateRoutingConfiguration(): Promise<void> {
        const url = `/client/configuration/routing_configuration.json`;
      
        const req = await request.newContext();
        const response = await req.post(url, {
          params: {
            client_id: this.clientId,
            api_key: this.apiKey,
          },
          form: {
            utf8:"✓",
            _method:"patch",
            "routing_configuration[auxiliary_enabled]":"false", 
            "routing_configuration[routing_strategy]":"weighted_round_robin",
            "routing_configuration[routing_priority]":'[["medium_type"]]',
            routing_priority_dropdown:"",
            commit:"Save",
          },
        });
      
        expect(response.status()).toBe(200);
      }

      async updateRoutingConfigurationWithArguments(auxiliaryEnabled: boolean, routingStrategy: string, routingPriority: string): Promise<void> {
        const url = `/client/configuration/routing_configuration.json`;
      
        const req = await request.newContext();
        const response = await req.post(url, {
          params: {
            client_id: this.clientId,
            api_key: this.apiKey,
          },
          form: {
            utf8:"✓",
            _method:"patch",
            "routing_configuration[auxiliary_enabled]":`${auxiliaryEnabled}`, 
            "routing_configuration[routing_strategy]":`${routingStrategy}`, // weighted_round_robin, round_robin
            "routing_configuration[routing_priority]":`${routingPriority}`, // [["medium_type"],["project_id","source","sub_source","medium_type","medium_value","campaign_id"]]
            routing_priority_dropdown:"",
            commit:"Save",
          },
        });
      
        expect(response.status()).toBe(200);
      }

      async resetUserScore(userId: string, score: number): Promise<void> {
        const url = `/client/users/change_user_score.json`;
        const utils = new Utils();
        const userManagementAPIUtils = new UserManagementAPIUtils(this.clientId, this.apiKey);
        const req = await request.newContext();
        const response = await req.post(url, {
          params: {
            client_id: this.clientId,
            api_key: this.apiKey,
          },
          form: {
            utf8:"✓",
            "user[score]":`${score}`,
            "user[roaster]":"a",
            "user[id]":`${userId}`
          },
        });
        await utils.print(`User score for ${await userManagementAPIUtils.getUserFullName(userId)}: is ${score}`);
        expect(response.status()).toBe(200);
      }

      private formatFormArrayValue(value: string | string[] | undefined): string | undefined {
        if (!value) return undefined;
        if (Array.isArray(value)) {
          return value.filter(v => v).join(',');
        }
        return value;
      }

      async createRoutingRule(
        name: string,
        campaigns?: string | string[],
        projects?: string | string[],
        sources?: string | string[],
        subSources?: string | string[],
        mediumTypes?: MediumType | MediumType[],
        mediumValues?: string | string[],
        sales?: string | string[],
        nriSales?: string | string[],
        allowStickiness: boolean = false,
        handleNRI: boolean = false,
        routingRuleStrategy: RoutingRuleStrategy = RoutingRuleStrategy.weighted_round_robin
      ): Promise<any> {
        const url = `/client/configuration/routing_configuration/routing_rules.json`;
      
        const req = await request.newContext();
        
        // Build form data object with only defined values
        const formData: Record<string, string> = {
          utf8: "✓",
          "routing_rule[name]": name,
          "routing_rule[stickiness]": String(allowStickiness).toLowerCase(),
          "routing_rule[nri_routing]": String(handleNRI).toLowerCase(),
          "routing_rule[routing_rule_strategy]": String(routingRuleStrategy),
          commit: "Save",
        };

        // Add optional fields only if they are provided
        const campaignIds = this.formatFormArrayValue(campaigns);
        if (campaignIds) {
          formData["routing_rule[campaign_ids]"] = campaignIds;
        }

        const projectIds = this.formatFormArrayValue(projects);
        if (projectIds) {
          formData["routing_rule[project_ids]"] = projectIds;
        }

        const sourcesValue = this.formatFormArrayValue(sources);
        if (sourcesValue) {
          formData["routing_rule[sources]"] = sourcesValue;
        }

        const subSourcesValue = this.formatFormArrayValue(subSources);
        if (subSourcesValue) {
          formData["routing_rule[sub_sources]"] = subSourcesValue;
        }

        const mediumTypesValue = this.formatFormArrayValue(
          mediumTypes 
            ? (Array.isArray(mediumTypes) 
                ? mediumTypes.map(mt => String(mt)) 
                : String(mediumTypes))
            : undefined
        );
        if (mediumTypesValue) {
          formData["routing_rule[medium_types]"] = mediumTypesValue;
        }

        const mediumValuesValue = this.formatFormArrayValue(mediumValues);
        if (mediumValuesValue) {
          formData["routing_rule[medium_values]"] = mediumValuesValue;
        }

        const saleIds = this.formatFormArrayValue(sales);
        if (saleIds) {
          formData["routing_rule[sale_ids]"] = saleIds;
        }

        // If NRI routing is enabled, add NRI sale IDs from the separate parameter
        if (handleNRI) {
          const nriSaleIds = this.formatFormArrayValue(nriSales);
          if (nriSaleIds) {
            formData["routing_rule[nri_sale_ids]"] = nriSaleIds;
          }
        }

        const response = await req.post(url, {
          params: {
            client_id: this.clientId,
            api_key: this.apiKey,
          },
          form: formData,
        });
      
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody).toEqual({ message: "Routing Rule created successfully" });
        return responseBody;
      }

      async createSingleValueRoutingRule(
        name: string,
        campaignIds?: string,
        projectIds?: string,
        sources?: string,
        subSources?: string,
        mediumTypes?: MediumType | string,
        mediumValues?: string,
        saleIds?: string,
        nriSaleIds?: string,
        stickiness: boolean = false,
        nriRouting: boolean = false,
        routingRuleStrategy: RoutingRuleStrategy = RoutingRuleStrategy.weighted_round_robin
      ): Promise<any> {
        const url = `/client/configuration/routing_configuration/routing_rules.json`;
      
        const req = await request.newContext();
        
        // Build form data object with all fields (using plural form for arrays)
        const formData: Record<string, string> = {
          utf8: "✓",
          "routing_rule[name]": name,
          "routing_rule[stickiness]": String(stickiness).toLowerCase(),
          "routing_rule[nri_routing]": String(nriRouting).toLowerCase(),
          "routing_rule[routing_rule_strategy]": String(routingRuleStrategy),
          commit: "Save",
        };

        // Add optional fields - use provided value or empty space
        if (campaignIds) {
          formData["routing_rule[campaign_ids]"] = campaignIds;
        } else {
          formData["routing_rule[campaign_ids]"] = " ";
        }

        if (projectIds) {
          formData["routing_rule[project_ids]"] = projectIds;
        } else {
          formData["routing_rule[project_ids]"] = " ";
        }

        if (sources) {
          formData["routing_rule[sources]"] = sources;
        } else {
          formData["routing_rule[sources]"] = " ";
        }

        if (subSources) {
          formData["routing_rule[sub_sources]"] = subSources;
        } else {
          formData["routing_rule[sub_sources]"] = " ";
        }

        if (mediumTypes) {
          formData["routing_rule[medium_types]"] = String(mediumTypes);
        } else {
          formData["routing_rule[medium_types]"] = " ";
        }

        if (mediumValues) {
          formData["routing_rule[medium_values]"] = mediumValues;
        } else {
          formData["routing_rule[medium_values]"] = " ";
        }

        if (saleIds) {
          formData["routing_rule[sale_ids]"] = saleIds;
        } else {
          formData["routing_rule[sale_ids]"] = " ";
        }

        if (nriSaleIds) {
          formData["routing_rule[nri_sale_ids]"] = nriSaleIds;
        } else {
          formData["routing_rule[nri_sale_ids]"] = " ";
        }

        const response = await req.post(url, {
          params: {
            client_id: this.clientId,
            api_key: this.apiKey,
          },
          form: formData,
        });
      
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody).toEqual({ message: "Routing Rule created successfully" });
        return responseBody;
      }

      /**
       * Update routing rule by id with Rails-style method override.
       * Matches the curl form values you provided; method accepts only:
       * - `ruleId`
       * - `salesId` (used as `routing_rule[sale_ids]`)
       */
      async updateRoutingRuleById(ruleId: string, salesId: string): Promise<any> {
        const url = `/client/configuration/routing_configuration/routing_rules/${ruleId}.json`;

        const req = await request.newContext();

        // IMPORTANT: `curl` included `routing_rule[stickiness]` twice (`false` then `true`);
        // with object form we can only send one value, so we send the last one (`true`).
        const formData: Record<string, string> = {
          utf8: "✓",
          _method: "patch",
          commit: "Save",

          "routing_rule[name]": "default",
          "routing_rule[sale_ids]": salesId,

          "routing_rule[stickiness]": "true",
          "routing_rule[nri_routing]": "false",
          "routing_rule[nri_sale_ids]": "",

          "routing_rule[routing_rule_strategy]": "weighted_round_robin",
        };

        const response = await req.post(url, {
          params: {
            client_id: this.clientId,
            api_key: this.apiKey,
          },
          form: formData,
        });
        expect(response.status()).toBe(200);
        return await response.json();
      }
      
      
}