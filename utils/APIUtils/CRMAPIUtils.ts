import { expect, APIRequestContext, test, request } from "@playwright/test";
import { properties } from "../env";
import * as fs from "fs";
import * as path from "path";
import { Utils } from "../PlaywrightTestUtils";

/** JSON body from CSV import endpoints that return a `notice` (and optional `error`). */
type NoticeImportJsonResponse = {
  notice?: string;
  error?: string;
  [key: string]: any;
};

// Enum for data for
export enum DataFor {
  User = "users",
  Team = "teams",
  Project = "projects",
  ChannelPartner = "channel_partners",
  Campaign = "campaigns",
}

export enum PushLeadStrategy {
  TEAM = "team",
  PROJECT = "project"
}

/** `client_configuration[reassign_lead_strategy]` (reassign lead strategy: team vs project). */
export enum ReassignLeadStrategy {
  Team = "team",
  Project = "project",
}

/**
 * Serialized as literal `"true"` / `"false"` for `client_configuration[team_based_access]`,
 * `client_configuration[lead_details_for_export]`, etc.
 */
export enum ClientConfigFormTrueFalse {
  True = "true",
  False = "false",
}

/**
 * Serialized as `"1"` / `"0"` for `client_configuration[allow_search_access_secondary_sales]`,
 * `client_configuration[allow_search_access_team_sales]`,
 * `client_configuration[allow_search_access_other_sales]`.
 */
export enum ClientConfigFormOneZero {
  True = "1",
  False = "0",
}

/** Role segments accepted in `client_configuration[lead_merge_access]` (comma-separated). */
export enum LeadMergeAccessRole {
  Manager = "manager",
  Admin = "admin",
  Sales = "sales",
  PreSales = "pre_sales",
}

export type UserSummary = {
  id: string;
  email: string;
  name: string;
};

export enum UserRoleFilter {
  Sales = "sales",
  PreSales = "pre_sales",
  Admin = "admin",
  PostSales = "post_sales",
  SalesManager = "sales_manager",
  PreSalesManager = "pre_sales_manager",
  CustomRole = "custom_role",
}

export type CampaignSummary = {
  id: string;
  name: string;
  isDefault: boolean;
};

export type ChannelPartnerSummary = {
  id: string;
  name: string;
  phone: string;
  email: string;
  fullName: string;
};

export type ProjectSummary = {
  id: string;
  name: string;
  developerName: string;
  /** First id from API `project_pre_sale_ids` (undefined if missing or empty). */
  firstProjectPreSaleId?: string;
  /** First id from API `project_sale_ids` (undefined if missing or empty). */
  firstProjectSaleId?: string;
  /** First id from API `project_post_sale_ids` (undefined if missing or empty). */
  firstProjectPostSaleId?: string;
};

export type SellDoClientDetails = {
  client_id: string;
  name: string;
  email: string;
  time_zone: string;
};

/**
 * Placeholder keys accepted in WhatsApp template preview `template_content`
 * (e.g. `WhatsappTemplateVariable.project_name` is `"project_name"` for map lookups).
 */
export enum WhatsappTemplateVariable {
  project_name = "project_name",
  rera_id = "rera_id",
  project_address = "project_address",
  last_lead_project_name = "last_lead_project_name",
  first_lead_project_name = "first_lead_project_name",
  name = "name",
  lead_first_name = "lead_first_name",
  lead_last_name = "lead_last_name",
  lead_id = "lead_id",
  leadid = "leadid",
  lead_email = "lead_email",
  lead_phone_number = "lead_phone_number",
  sales_email = "sales_email",
  lead_created_at_date_only = "lead_created_at_date_only",
  latest_campaign = "latest_campaign",
  latest_source = "latest_source",
  latest_sub_source = "latest_sub_source",
  lead_phone_dialcode = "lead_phone_dialcode",
  created_at = "created_at",
  client_short_name = "client_short_name",
  client_name = "client_name",
  last_note = "last_note",
  sales_name = "sales_name",
  team_name = "team_name",
  otp_code = "otp_code",
  current_time = "current_time",
  lead_created_at = "lead_created_at",
  lead_address = "lead_address",
  activity_owner = "activity_owner",
  agenda = "agenda",
  date = "date",
  time = "time",
  sitevisit_type = "sitevisit_type",
  conducted_on = "conducted_on",
  acted_on = "acted_on",
  lead_otp = "lead_otp",
  sales_otp = "sales_otp",
  sitevisit_google_calendar_invite = "sitevisit_google_calendar_invite",
  sitevisit_ms365_calendar_invite = "sitevisit_ms365_calendar_invite",
  sitevisit_zoom_calendar_invite = "sitevisit_zoom_calendar_invite",
  sitevisit_google_calendar_url = "sitevisit_google_calendar_url",
  sitevisit_ms365_calendar_url = "sitevisit_ms365_calendar_url",
  sitevisit_zoom_calendar_url = "sitevisit_zoom_calendar_url",
  sitevisit_google_calendar_sms_invite = "sitevisit_google_calendar_sms_invite",
  sitevisit_ms365_calendar_sms_invite = "sitevisit_ms365_calendar_sms_invite",
  sitevisit_zoom_calendar_sms_invite = "sitevisit_zoom_calendar_sms_invite",
  task_due_on = "task_due_on",
  task_priority = "task_priority",
  task_status = "task_status",
  task_assignee = "task_assignee",
  task_creator = "task_creator",
  taskable_type = "taskable_type",
  taskable_name = "taskable_name",
  lat = "lat",
  lng = "lng",
  followup_type = "followup_type",
  subject = "subject",
  vr_link = "vr_link",
  task_title = "task_title",
  ivr_number = "ivr_number",
  sales_manager_name = "sales_manager_name",
  by_creator_name = "by_creator_name",
  call_time = "call_time",
  record_url = "record_url",
  lead_profile_url = "lead_profile_url",
  call_feedback_url = "call_feedback_url",
  call_url = "call_url",
  email_url = "email_url",
  c_note = "c_note",
  booking_detail_id = "booking_detail_id",
  booking_amount = "booking_amount",
  project_tower_name = "project_tower_name",
  project_unit_name = "project_unit_name",
  applicant_name = "applicant_name",
  ledger_html = "ledger_html",
  sales_phone = "sales_phone",
  booking_id = "booking_id",
  booking_date = "booking_date",
  floor_number = "floor_number",
  unit_type = "unit_type",
  balance = "balance",
  plan_short_url = "plan_short_url",
  verification_code = "verification_code",
  qr_image = "qr_image",
  qr_image_sms = "qr_image_sms",
  pick_up_location_time = "pick_up_location_time",
  sales_pickup_info = "sales_pickup_info",
  lead_pickup_info = "lead_pickup_info",
  other_invities = "other_invities",
  pick_up_location = "pick_up_location",
  pick_up_time = "pick_up_time",
  requirement = "requirement",
  s_note = "s_note",
  requirement_min_possession = "requirement_min_possession",
  requirement_max_possession = "requirement_max_possession",
  confirmation_url = "confirmation_url",
  lead_source = "lead_source",
  lead_campaign = "lead_campaign",
  lead_last_source = "lead_last_source",
  lead_last_campaign = "lead_last_campaign",
  masked_lead_primary_email = "masked_lead_primary_email",
  lead_primary_email = "lead_primary_email",
  masked_lead_primary_phone = "masked_lead_primary_phone",
  lead_primary_phone = "lead_primary_phone",
  phone_number = "phone_number",
  post_sales_name = "post_sales_name",
  post_sales_email = "post_sales_email",
  post_sales_phone = "post_sales_phone",
  url_shortener_link = "url_shortener_link",
  lead_otp_text = "lead_otp_text",
  sales_otp_text = "sales_otp_text",
  admin_name = "admin_name",
  client_billing_url = "client_billing_url",
  support_url = "support_url",
  support_phone_number = "support_phone_number",
  activity_created_at = "activity_created_at",
  work_completed = "work_completed",
  total_amount_demanded = "total_amount_demanded",
  due_date = "due_date",
  current_stage = "current_stage",
  receipt_amount = "receipt_amount",
  receipt_status = "receipt_status",
  receipt_payment_mode = "receipt_payment_mode",
  receipt_issuing_bank = "receipt_issuing_bank",
  receipt_issuing_bank_branch = "receipt_issuing_bank_branch",
  receipt_cheque_no = "receipt_cheque_no",
  receipt_accounting_date = "receipt_accounting_date",
  receipt_issued_date = "receipt_issued_date",
  google_now_tag = "google_now_tag",
  task_reminder_subject = "task_reminder_subject",
  task_assigned_subject = "task_assigned_subject",
  task_completed_subject = "task_completed_subject",
  property_types = "property_types",
  reassigned_by = "reassigned_by",
  lead_update_url = "lead_update_url",
  booking_detail_db_id = "booking_detail_db_id",
  masked_lead_secondary_emails = "masked_lead_secondary_emails",
  lead_secondary_emails = "lead_secondary_emails",
  masked_lead_secondary_phones = "masked_lead_secondary_phones",
  lead_secondary_phones = "lead_secondary_phones",
  gender = "gender",
  country = "country",
  salutation = "salutation",
  birthday = "birthday",
  designation = "designation",
  lead_db_id = "lead_db_id",
  lead_booking_update_url = "lead_booking_update_url",
  address1 = "address1",
  address2 = "address2",
  city = "city",
  state = "state",
  zip = "zip",
  country_code = "country_code",
  latest_campaign_id = "latest_campaign_id",
  latest_campaign_project_id = "latest_campaign_project_id",
  latest_campaign_project_name = "latest_campaign_project_name",
}

export type WhatsappTemplatesListResponse = {
  page: number | null;
  per_page: number;
  results: WhatsappTemplateListItem[];
  total: number;
};

export type WhatsappTemplateListItem = {
  _id: string;
  name?: string;
  content?: string;
  active?: boolean;
  client_id?: string;
  [key: string]: unknown;
};

export type WhatsappPreviewParsedResult = {
  /** Raw JSON body from the preview endpoint */
  raw: unknown;
  /** `template_content` converted to a readable string map (Ruby hash string parsed when needed). */
  templateContent: Record<string, string>;
  /** Resolved value for a variable, e.g. `get(WhatsappTemplateVariable.project_name)`. */
  get: (variable: WhatsappTemplateVariable) => string;
};

/**
 * Converts the Ruby hash inspect string returned in `template_content` from
 * `/whatsapps/preview.json` into a plain object suitable for JSON serialization.
 */
export function parseWhatsappPreviewRubyHashString(rubyHash: string): Record<string, string> {
  let inner = rubyHash.trim();
  if (inner.startsWith("{") && inner.endsWith("}")) {
    inner = inner.slice(1, -1).trim();
  }

  const result: Record<string, string> = {};
  const len = inner.length;
  let i = 0;

  const skipWs = () => {
    while (i < len && /\s/.test(inner[i])) i++;
  };

  const readQuoted = (): string => {
    if (inner[i] !== '"') {
      throw new Error(`parseWhatsappPreviewRubyHashString: expected opening " at index ${i}`);
    }
    i++;
    let out = "";
    while (i < len) {
      const c = inner[i];
      if (c === "\\") {
        i++;
        if (i < len) out += inner[i++];
        continue;
      }
      if (c === '"') {
        i++;
        return out;
      }
      out += c;
      i++;
    }
    throw new Error("parseWhatsappPreviewRubyHashString: unterminated string");
  };

  while (i < len) {
    skipWs();
    if (i >= len) break;
    const key = readQuoted();
    skipWs();
    if (inner.slice(i, i + 2) !== "=>") {
      throw new Error(`parseWhatsappPreviewRubyHashString: expected => after key "${key}" at index ${i}`);
    }
    i += 2;
    skipWs();
    const value = readQuoted();
    result[key] = value;
    skipWs();
    if (inner[i] === ",") {
      i++;
    }
  }

  return result;
}

/** Normalizes `template_content` from the preview API (string or object) into string values. */
export function normalizeWhatsappPreviewTemplateContent(raw: unknown): Record<string, string> {
  if (raw == null) {
    return {};
  }
  if (typeof raw === "string") {
    return parseWhatsappPreviewRubyHashString(raw);
  }
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(o)) {
      out[k] = v == null ? "" : String(v);
    }
    return out;
  }
  return {};
}

/** One row from `/client/configuration/data_provider_for_source.json` */
export type DataProviderSourceItem = {
  id: string;
  text: string;
};

export class CRMAPIUtils {

  private request!: APIRequestContext;
  private readonly clientId: string;
  private readonly apiKey: string;
  private readonly utils: Utils;

  constructor(clientId: string, apiKey: string){
    this.clientId = clientId;
    this.apiKey = apiKey;
    this.utils = new Utils();
  }
  private async initializeRequest() {
    if (!this.request) {
      this.request = await request.newContext();
    }
  }

   // ✅ Update presales configuration
   async updatePresalesConfiguration(
    pushLeadStrategy: PushLeadStrategy,
    autoForward: boolean,
    pullToSales: number,
    considerHierarchyForPushToSales: boolean,
    dispositionTimeout: number,
    callCenterPresenceManagement: boolean,
    salesToPreSales: boolean
  ) {
    await this.initializeRequest();
    const URL = `/client/configuration.json?api_key=${this.apiKey}&client_id=${this.clientId}`;

    const formData = new URLSearchParams();
    formData.append("utf8", "✓");
    formData.append("_method", "put");
    formData.append("client_configuration[pre_sales_configuration][push_lead_strategy]", pushLeadStrategy);
    formData.append("client_configuration[pre_sales_configuration][auto_forward]", autoForward.toString());
    formData.append("client_configuration[pre_sales_configuration][pull_to_sales]", pullToSales.toString());
    formData.append("client_configuration[pre_sales_configuration][consider_hierarchy_for_push_to_sales]", considerHierarchyForPushToSales.toString());
    formData.append("client_configuration[pre_sales_configuration][disposition_timeout]", dispositionTimeout.toString());
    formData.append("client_configuration[pre_sales_configuration][call_center_presence_management]", callCenterPresenceManagement.toString());
    formData.append("client_configuration[pre_sales_configuration][sales_to_pre_sales]", salesToPreSales.toString());
    formData.append("commit", "Save");

    const response = await this.request.put(URL, {
      data: formData.toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    return responseBody;
  }

  /**
   * Updates team-based access, lead export details, cross-team search flags, and lead merge roles
   * (`PUT` via `_method`, same as updating client configuration in the CRM UI).
   * - `team_based_access` and `lead_details_for_export` use `"true"` / `"false"`.
   * - `allow_search_access_*` use `"1"` / `"0"`.
   * - `lead_merge_access` is a comma-separated role string; pass a string or {@link LeadMergeAccessRole} values.
   */
  async updateClientConfigurationTeamAccessLeadExportAndSearch(options: {
    teamBasedAccess: ClientConfigFormTrueFalse;
    leadDetailsForExport: ClientConfigFormTrueFalse;
    allowSearchAccessSecondarySales: ClientConfigFormOneZero;
    allowSearchAccessTeamSales: ClientConfigFormOneZero;
    allowSearchAccessOtherSales: ClientConfigFormOneZero;
    leadMergeAccess: string | readonly LeadMergeAccessRole[];
  }): Promise<any> {
    await this.initializeRequest();
    const URL = `/client/configuration.json?api_key=${this.apiKey}&client_id=${this.clientId}`;

    const leadMergeAccess =
      typeof options.leadMergeAccess === "string"
        ? options.leadMergeAccess
        : options.leadMergeAccess.join(",");

    const formData = new URLSearchParams();
    formData.append("utf8", "✓");
    formData.append("_method", "put");
    formData.append("client_id", this.clientId);
    formData.append("client_configuration[team_based_access]", options.teamBasedAccess);
    formData.append("client_configuration[lead_details_for_export]", options.leadDetailsForExport);
    formData.append(
      "client_configuration[allow_search_access_secondary_sales]",
      options.allowSearchAccessSecondarySales,
    );
    formData.append("client_configuration[allow_search_access_team_sales]", options.allowSearchAccessTeamSales);
    formData.append("client_configuration[allow_search_access_other_sales]", options.allowSearchAccessOtherSales);
    formData.append("client_configuration[lead_merge_access]", leadMergeAccess);
    formData.append("commit", "Save");

    const response = await this.request.put(URL, {
      data: formData.toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    this.utils.print(`Update client configuration: team base accees is ${options.teamBasedAccess} | lead details export is ${options.leadDetailsForExport} | allow search access secondary sales is ${options.allowSearchAccessSecondarySales} | allow search access team sales is ${options.allowSearchAccessTeamSales} | allow search access other sales is ${options.allowSearchAccessOtherSales} | lead merge access is ${leadMergeAccess}`);
    expect(response.status()).toBe(200);
    return await response.json();
  }

  /**
   * Sets `client_configuration[reassign_lead_strategy]` (`PUT` via `_method`, same as CRM configuration UI).
   * Curl equivalent: `client/configuration.json` with form fields `utf8`, `_method`, `client_id`, `commit`, and reassign strategy.
   */
  async updateReassignLeadStrategy(strategy: ReassignLeadStrategy): Promise<any> {
    await this.initializeRequest();
    const URL = `/client/configuration.json?api_key=${this.apiKey}&client_id=${this.clientId}`;

    const formData = new URLSearchParams();
    formData.append("utf8", "✓");
    formData.append("_method", "put");
    formData.append("client_id", this.clientId);
    formData.append("client_configuration[reassign_lead_strategy]", strategy);
    formData.append("commit", "Save");

    const response = await this.request.put(URL, {
      data: formData.toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    await this.utils.print(
      `Update reassign lead strategy: ${response.status()} reassign_lead_strategy=${strategy}`,
    );
    expect(response.status()).toBe(200);
    return await response.json();
  }

  // ✅ Enable / Disable Workflow Edit Access for Admin
async updateWorkflowEditAccess(enableWorkflowAccess: boolean) {
  await this.initializeRequest();

  const URL = `/client/configuration.json?api_key=${this.apiKey}&client_id=${this.clientId}`;

  const payload = {
    client_id: this.clientId,
    client_configuration: {
      enable_workflow_access: enableWorkflowAccess
    }
  };

  const response = await this.request.put(URL, {
    data: payload,
    headers: {
      "Content-Type": "application/json"
    }
  });

  expect(response.status()).toBe(200);

  const responseBody = await response.json();
  return responseBody;
}

  // To get user token
  async getUserToken(email: string, password: string): Promise<string> {
    const URL = `/mobile/create.json`;

    const body = {
      device_type: "android",
      user: {
        email,
        password,
      },
    };

    const req = await request.newContext();
    const response = await req.post(URL, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
      },
      data: body,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok()) {
      throw new Error(
        `Token request failed: ${response.status()} - ${response.statusText()}`,
      );
    }

    const responseBody = await response.json();
    const token = responseBody.authentication_token;

    if (!token) {
      throw new Error("Authentication token not found in response");
    }

    return ""+token.trim();
  }

    // To get user id
    async getUserId(email: string): Promise<string> {
      const URL = `/mobile/create.json`;
  
      const body = {
        device_type: "android",
        user: {
          email,
          password: properties.PASSWORD,
        },
      };
      const req = await request.newContext();
      const response = await req.post(URL, {
        params: {
          client_id: this.clientId,
          api_key: this.apiKey,
        },
        data: body,
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok()) {
        throw new Error(
          `Token request failed: ${response.status()} - ${response.statusText()}`,
        );
      }
  
      const responseBody = await response.json();
      const token = responseBody.sales_id;
  
      if (!token) {
        throw new Error("Authentication token not found in response");
      }
  
      return ""+token.trim();
    }

  async dataProvider(df: DataFor): Promise<any> {
    const url = `/client/${df}/data_provider.json`;

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

  /**
   * Fetches lead sources from `data_provider_for_source` and returns the row at the given **1-based** index.
   * Use `result.id` or `result.text` for the selected entry.
   * @param options.index 1-based position (`{ index: 1 }` is the first item in the API array).
   */
  async dataProvider_Source(options: { index: number }): Promise<DataProviderSourceItem> {
    const url = `/client/configuration/data_provider_for_source.json`;

    const req = await request.newContext();
    const response = await req.get(url, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
      },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();
    const list = Array.isArray(json) ? json : null;
    if (!list) {
      throw new Error("dataProvider_Source: expected API response to be a JSON array");
    }

    const { index } = options;
    if (!Number.isFinite(index) || !Number.isInteger(index) || index < 1) {
      throw new Error(`dataProvider_Source: index must be a positive integer (1-based), got ${String(index)}`);
    }

    const i = index - 1;
    if (i >= list.length) {
      throw new Error(
        `dataProvider_Source: index ${index} is out of range (sources length: ${list.length})`,
      );
    }

    const raw = list[i] as { id?: unknown; text?: unknown };
    if (raw == null || typeof raw !== "object") {
      throw new Error(`dataProvider_Source: invalid item at index ${index}`);
    }
    if (raw.id == null || raw.text == null) {
      throw new Error(`dataProvider_Source: item at index ${index} is missing id or text`);
    }

    return { id: String(raw.id), text: String(raw.text) };
  }

  async dataProvider_SubSource(options: { index: number }): Promise<DataProviderSourceItem> {
    const url = `/client/campaigns/data_provider_subcampaigns.json?only_sub_sources=true`;

    const req = await request.newContext();
    const response = await req.get(url, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
      },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();
    const list = Array.isArray(json) ? json : null;
    if (!list) {
      throw new Error("dataProvider_SubSource: expected API response to be a JSON array");
    }

    const { index } = options;
    if (!Number.isFinite(index) || !Number.isInteger(index) || index < 1) {
      throw new Error(`dataProvider_SubSource: index must be a positive integer (1-based), got ${String(index)}`);
    }

    const i = index - 1;
    if (i >= list.length) {
      throw new Error(
        `dataProvider_SubSource: index ${index} is out of range (sources length: ${list.length})`,
      );
    }

    const raw = list[i] as { id?: unknown; text?: unknown };
    if (raw == null || typeof raw !== "object") {
      throw new Error(`dataProvider_SubSource: invalid item at index ${index}`);
    }
    if (raw.id == null || raw.text == null) {
      throw new Error(`dataProvider_SubSource: item at index ${index} is missing id or text`);
    }

    return { id: String(raw.id), text: String(raw.text) };
  }

  async getConstants(eamil:string): Promise<any> {
    const url = `/client/constants.json`;
    const token = await this.getUserToken(eamil, properties.PASSWORD ?? "");
    const req = await request.newContext();
    const response = await req.get(url, {
      params: {
        user_token: token,
        user_email: eamil,
      },
    });

    expect(response.status()).toBe(200);
    const responseData = await response.json();
    return responseData;
  }

  async isDealManagementEnabled(eamil:string): Promise<boolean> {
    const constants = await this.getConstants(eamil);
    return constants.Constants.client_configuration.features_enabled.deal_management;
  }

  async getClinetLeadStrategy(eamil:string): Promise<any> {
    const constants = await this.getConstants(eamil);
    return constants.Constants.client.lead_strategy; //>> allow_duplicates_at_project_level || no_duplicate_leads
  }

  async getSellDoClientDetails(): Promise<SellDoClientDetails> {
    await this.initializeRequest();

    const response = await this.request.get(`/client.json?api_key=${this.apiKey}&client_id=${this.clientId}`, {
      headers: { Accept: "application/json" },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    const client = body?.client;
    if (!client?._id) {
      throw new Error("Unexpected response: missing client._id");
    }
    
    return {
      client_id: String((client._id ?? "").trim()),
      name: String((client.name ?? "").trim()),
      email: String((client.email ?? "").trim()),
      time_zone: String((client.time_zone ?? "").trim()),
    };
  }

  // ✅ Reset Activity Configuration
async resetActivityConfiguration() {
  await this.initializeRequest();

  const URL = `/client/configuration.json?api_key=${this.apiKey}&client_id=${this.clientId}`;

  const formData = new URLSearchParams();

  formData.append("utf8", "✓");
  formData.append("_method", "put");
  formData.append("client_id", this.clientId);

  formData.append("client_configuration[activity_calender_time_attributes][active]", "1");

  formData.append("client_configuration[activity_calender_time][site_visit_hours]", "0");
  formData.append("client_configuration[activity_calender_time][site_visit_minutes]", "20");

  formData.append("client_configuration[followup_cancellation_reasons]", "");

  formData.append("client_configuration[followup_configuration][start]", "0");
  formData.append("client_configuration[followup_configuration][end]", "5");

  formData.append("client_configuration[site_visit_configuration][start]", "0");
  formData.append("client_configuration[site_visit_configuration][end]", "60");

  formData.append("client_configuration[pickup]", "true");
  formData.append("client_configuration[auto_conduct_online_meeting]", "true");

  formData.append("client_configuration[pickup_locations]", "Pune,Savedi,Mahalunge");

  formData.append("client_configuration[site_visit_verification][enabled]", "false");
  formData.append("client_configuration[site_visit_verification][gps]", "false");

  formData.append("client_configuration[otp_override_roles]", "");

  formData.append("client_configuration[hide_wf_notes]", "false");
  formData.append("client_configuration[is_score_increasable]", "true");

  formData.append("commit", "Save");

  const response = await this.request.put(URL, {
    data: formData.toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });

  await this.utils.print(`Reset activity configuration response: ${response.status()} activity configuration reset`);
  expect(response.status()).toBe(200);
  return await response.json();
}

  // ✅ Update site visit experience feature
  async updateSiteVisitExperience(
    siteVisitExperienceEnabled: boolean,
  ) {
    await this.initializeRequest();
    const URL = `/client/configuration.json?api_key=${this.apiKey}&client_id=${this.clientId}`;

    const formData = new URLSearchParams();
    formData.append("utf8", "✓");
    formData.append("_method", "put");
    formData.append("client_configuration[features_enabled][site_visit_experience]", siteVisitExperienceEnabled.toString());
    formData.append("commit", "Save");

    const response = await this.request.put(URL, {
      data: formData.toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    await this.utils.print(`Update site visit experience response: ${response.status()} site visit experience enabled: ${siteVisitExperienceEnabled}`);
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    return responseBody;
  }

  // ✅ Update cooling period for lead re-engagement (in days)
  // This controls how long to wait before a lead can be re-engaged with same email/phone but different source
  // Note: API uses days, so for 1 minute testing, we set to 0 days (immediate) and test timing manually
  async updateCoolingPeriod(coolingPeriodDays: number): Promise<any> {
    await this.initializeRequest();
    const URL = `/client/configuration.json?api_key=${this.apiKey}&client_id=${this.clientId}`;

    const formData = new URLSearchParams();
    formData.append("utf8", "✓");
    formData.append("_method", "put");
    formData.append("client_configuration[website_new_campaign_response_days]", coolingPeriodDays.toString());
    formData.append("commit", "Save");

    const response = await this.request.put(URL, {
      data: formData.toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    await this.utils.print(`Update cooling period response: ${response.status()} cooling period days: ${coolingPeriodDays}`);
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    return responseBody;
  }

  async getFirstActiveUserSummary(
    filter: UserRoleFilter,
    options?: {
      index?: number; // 0-based index in active results
      teamId?: string;
      searchString?: string;
      customRoleValue?: string; // required when filter = CustomRole
      unlimitedCalling?: boolean;
    },
  ): Promise<UserSummary> {
    await this.initializeRequest();

    const URL = `/client/users.json`;

    const params: Record<string, any> = {
      api_key: this.apiKey,
      client_id: this.clientId,
      utf8: "✓",
      commit: "Apply",
      "search_params[team_id]": options?.teamId ?? "",
      "search_params[search_string]": options?.searchString ?? "",
      "search_params[status]": "true",
      "search_params[unlimited_calling]":
        typeof options?.unlimitedCalling === "boolean" ? String(options.unlimitedCalling) : "",
    };

    const roleAndDepartment = (() => {
      switch (filter) {
        case UserRoleFilter.Sales:
          return { role: "sales", department: "sales" };
        case UserRoleFilter.PreSales:
          return { role: "pre_sales", department: "pre_sales" };
        case UserRoleFilter.Admin:
          return { role: "admin", department: "" };
        case UserRoleFilter.PostSales:
          return { role: "post_sales", department: "post_sales" };
        case UserRoleFilter.SalesManager:
          return { role: "manager", department: "sales" };
        case UserRoleFilter.PreSalesManager:
          return { role: "manager", department: "pre_sales" };
        case UserRoleFilter.CustomRole: {
          const customRoleValue = options?.customRoleValue?.trim();
          if (!customRoleValue) {
            throw new Error("customRoleValue is required when filter = UserRoleFilter.CustomRole");
          }
          return { role: customRoleValue, department: "" };
        }
        default:
          return { role: "", department: "" };
      }
    })();

    params["search_params[role]"] = roleAndDepartment.role;
    params["search_params[department]"] = roleAndDepartment.department;

    const response = await this.request.get(URL, {
      params,
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    const results: any[] = Array.isArray(body?.results) ? body.results : [];
    const activeResults = results.filter((u) => u?.is_active === true);

    const index = options?.index ?? 0;
    if (!Number.isInteger(index) || index < 0) {
      throw new Error(`index must be a non-negative integer. Received: ${String(options?.index)}`);
    }

    const selected = activeResults[index];

    if (!selected?._id) {
      throw new Error(
        `No active user found for filter=${filter} role=${roleAndDepartment.role} department=${roleAndDepartment.department} at index=${index}`,
      );
    }

    const name =
      selected.full_name?.trim() ||
      `${selected.first_name ?? ""} ${selected.last_name ?? ""}`.trim() ||
      selected.email ||
      selected._id;

    return {
      id: String(selected._id),
      email: String(selected.email ?? ""),
      name,
    };
  }

  async getFirstActiveCampaignSummary(options?: {
    index?: number; // 0-based index in active results (after optional default-first ordering)
    preferDefault?: boolean;
  }): Promise<CampaignSummary> {
    await this.initializeRequest();

    const URL = `/client/campaigns.json`;

    const response = await this.request.get(URL, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
      },
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    const results: any[] = Array.isArray(body?.results) ? body.results : [];
    const activeCampaigns = results.filter((c) => c?.is_active === true);

    const preferDefault = options?.preferDefault !== false;

    const index = options?.index ?? 0;
    if (!Number.isInteger(index) || index < 0) {
      throw new Error(`index must be a non-negative integer. Received: ${String(options?.index)}`);
    }

    const defaultCampaign = preferDefault ? activeCampaigns.find((c) => c?.is_default === true) : undefined;
    const orderedCampaigns = defaultCampaign
      ? [defaultCampaign, ...activeCampaigns.filter((c) => c?._id !== defaultCampaign?._id)]
      : activeCampaigns;

    const selected = orderedCampaigns[index];

    if (!selected?._id) {
      throw new Error(`No active campaign found at index=${index}`);
    }

    return {
      id: String(selected._id),
      name: String(selected.name ?? ""),
      isDefault: selected.is_default === true,
    };
  }

  async getFirstActiveCampaignId(options?: { preferDefault?: boolean; index?: number }): Promise<string> {
    const campaign = await this.getFirstActiveCampaignSummary(options);
    return campaign.id;
  }

  async getFirstActiveChannelPartnerSummary(options?: { index?: number }): Promise<ChannelPartnerSummary> {
    await this.initializeRequest();

    const URL = `/client/channel_partners.json`;

    const response = await this.request.get(URL, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
        "filters[active]": "true",
      },
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    const list: any[] = Array.isArray(body) ? body : Array.isArray(body?.results) ? body.results : [];
    const index = options?.index ?? 0;
    if (!Number.isInteger(index) || index < 0) {
      throw new Error(`index must be a non-negative integer. Received: ${String(options?.index)}`);
    }

    const first = list[index];

    if (!first?._id) {
      throw new Error(`No active channel partner found at index=${index}`);
    }

    const contact = first.contact ?? {};
    const firstName = String(contact.first_name ?? "").trim();
    const lastName = String(contact.last_name ?? "").trim();
    const fullName = `${firstName} ${lastName}`.trim();

    const phoneObj = contact.phone ?? {};
    const dialCode = String(phoneObj.dial_code ?? "").trim();
    const phNumber = String(phoneObj.ph_number ?? "").trim();
    const phone = dialCode && phNumber ? `+${dialCode}${phNumber}` : phNumber || dialCode;

    return {
      id: String(first._id),
      name: String(first.name ?? ""),
      phone,
      email: String(contact.email ?? ""),
      fullName,
    };
  }

  async getFirstActiveChannelPartnerId(options?: { index?: number }): Promise<string> {
    const cp = await this.getFirstActiveChannelPartnerSummary(options);
    return cp.id;
  }

  async getFirstActiveProjectSummary(options?: {
    index?: number; // 0-based index in active results
    sortOrder?: 1 | -1;
    sortField?: string;
  }): Promise<ProjectSummary> {
    await this.initializeRequest();

    const URL = `/client/projects/search.json`;

    const response = await this.request.get(URL, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
        status: "true",
        sort_order: String(options?.sortOrder ?? 1),
        sort_field: options?.sortField ?? "created_at",
      },
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    const list: any[] = Array.isArray(body) ? body : Array.isArray(body?.results) ? body.results : [];
    const activeProjects = list.filter((p) => p?.is_active === true);

    const index = options?.index ?? 0;
    if (!Number.isInteger(index) || index < 0) {
      throw new Error(`index must be a non-negative integer. Received: ${String(options?.index)}`);
    }

    const selected = activeProjects[index];

    if (!selected?._id) {
      throw new Error(`No active project found at index=${index}`);
    }

    const firstIdFromList = (value: unknown): string | undefined => {
      if (!Array.isArray(value) || value.length === 0) return undefined;
      const first = value[0];
      return first == null ? undefined : String(first);
    };

    return {
      id: String(selected._id),
      name: String(selected.name ?? ""),
      developerName: String(selected.developer_name ?? ""),
      firstProjectPreSaleId: firstIdFromList(selected.project_pre_sale_ids),
      firstProjectSaleId: firstIdFromList(selected.project_sale_ids),
      firstProjectPostSaleId: firstIdFromList(selected.project_post_sale_ids),
    };
  }

  async getFirstActiveProjectId(options?: { sortOrder?: 1 | -1; sortField?: string; index?: number }): Promise<string> {
    const project = await this.getFirstActiveProjectSummary(options);
    return project.id;
  }

    /**
   * Uploads a project-unit import CSV to `/client/project_units/import`.
   * Accepts only the generated CSV `filePath` and returns the success `notice` message.
   *
   * Note: this hits the same endpoint as the UI upload. The server validates headers via
   * `Client::ProjectUnitsController#check_validity` and may reject with a generic format error.
   */
    async importProjectUnitsCsv(filePath: string): Promise<string> {
      await this.initializeRequest();
  
      const fileName = path.basename(filePath);
      const buffer = fs.readFileSync(filePath);
  
      const maxAttempts = 3;
      let lastStatus = 0;
      let lastStatusText = "";
      let lastBody: NoticeImportJsonResponse = {};
  
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const response = await this.request.post(`/client/project_units/import.json`, {
          params: {
            api_key: this.apiKey,
            client_id: this.clientId,
          },
          multipart: {
            file: {
              name: fileName,
              mimeType: "text/csv",
              buffer,
            },
          },
          headers: {
            accept: "application/json",
            "x-requested-with": "XMLHttpRequest",
          },
        });
  
        lastStatus = response.status();
        lastStatusText = response.statusText();
        lastBody = (await response.json().catch(() => ({}))) as NoticeImportJsonResponse;
  
        if (response.ok()) break;
        if (lastStatus < 500 || attempt === maxAttempts) {
          throw new Error(
            `Import project units failed. Status: ${lastStatus} ${lastStatusText}, Response: ${JSON.stringify(lastBody)}`,
          );
        }
  
        // transient 5xx: retry with small backoff
        await new Promise((r) => setTimeout(r, 750 * attempt));
      }
  
      if (lastBody?.error) {
        throw new Error(`Import project units failed: ${lastBody.error}`);
      }
  
      const notice = lastBody?.notice;
      await this.utils.print(`Import project units notice: ${String(notice)}`);
      expect(notice, "Import notice missing in response").toBeTruthy();
      return String(notice);
    }

    async importProjectUnitsModifyCsv(filePath: string): Promise<string> {
      await this.initializeRequest();
  
      const fileName = path.basename(filePath);
      const buffer = fs.readFileSync(filePath);
  
      const maxAttempts = 3;
      let lastStatus = 0;
      let lastStatusText = "";
      let lastBody: NoticeImportJsonResponse = {};
  
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const response = await this.request.post(`/client/project_units/modify_units.json`, {
          params: {
            api_key: this.apiKey,
            client_id: this.clientId,
          },
          multipart: {
            file: {
              name: fileName,
              mimeType: "text/csv",
              buffer,
            },
          },
          headers: {
            accept: "application/json",
            "x-requested-with": "XMLHttpRequest",
          },
        });
  
        lastStatus = response.status();
        lastStatusText = response.statusText();
        lastBody = (await response.json().catch(() => ({}))) as NoticeImportJsonResponse;
  
        if (response.ok()) break;
        if (lastStatus < 500 || attempt === maxAttempts) {
          throw new Error(
            `Import project units failed. Status: ${lastStatus} ${lastStatusText}, Response: ${JSON.stringify(lastBody)}`,
          );
        }
  
        // transient 5xx: retry with small backoff
        await new Promise((r) => setTimeout(r, 750 * attempt));
      }
  
      if (lastBody?.error) {
        throw new Error(`Import project units failed: ${lastBody.error}`);
      }
  
      const notice = lastBody?.notice;
      await this.utils.print(`Import project units notice: ${String(notice)}`);
      expect(notice, "Import notice missing in response").toBeTruthy();
      return String(notice);
    }

  /**
   * Uploads a channel-partner import CSV to `/client/channel_partners/import`.
   * Same shape as the UI upload; processing runs in the background and the API returns a `notice`
   * (e.g. email when the import finishes).
   */
  async importChannelPartnersCsv(filePath: string): Promise<string> {
    await this.initializeRequest();

    const fileName = path.basename(filePath);
    const buffer = fs.readFileSync(filePath);

    const maxAttempts = 3;
    let lastStatus = 0;
    let lastStatusText = "";
    let lastBody: NoticeImportJsonResponse = {};

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const response = await this.request.post(`/client/channel_partners/import.json`, {
        params: {
          api_key: this.apiKey,
          client_id: this.clientId,
        },
        multipart: {
          file: {
            name: fileName,
            mimeType: "text/csv",
            buffer,
          },
        },
        headers: {
          accept: "application/json",
          "x-requested-with": "XMLHttpRequest",
        },
      });

      lastStatus = response.status();
      lastStatusText = response.statusText();
      lastBody = (await response.json().catch(() => ({}))) as NoticeImportJsonResponse;

      if (response.ok()) break;
      if (lastStatus < 500 || attempt === maxAttempts) {
        throw new Error(
          `Import channel partners failed. Status: ${lastStatus} ${lastStatusText}, Response: ${JSON.stringify(lastBody)}`,
        );
      }

      await new Promise((r) => setTimeout(r, 750 * attempt));
    }

    if (lastBody?.error) {
      throw new Error(`Import channel partners failed: ${lastBody.error}`);
    }

    const notice = lastBody?.notice;
    await this.utils.print(`Import channel partners notice: ${String(notice)}`);
    expect(notice, "Import notice missing in response").toBeTruthy();
    return String(notice);
  }

  /**
   * GET `/client/whatsapp_templates.json` (same host as v2, e.g. `https://v2.sell.do/client/whatsapp_templates.json`)
   * and returns the `_id` of the template at the given **0-based** index in `results`.
   *
   * @param nth 0-based position (`0` = first template in the response).
   */
  async getWhatsappTemplateIdByIndex(nth: number): Promise<string> {
    await this.initializeRequest();
    if (!Number.isInteger(nth) || nth < 0) {
      throw new Error(
        `getWhatsappTemplateIdByIndex: nth must be a non-negative integer, got ${String(nth)}`,
      );
    }

    const response = await this.request.get(`/client/whatsapp_templates.json`, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
      },
      headers: { Accept: "application/json" },
    });

    expect(response.status()).toBe(200);
    const body = (await response.json()) as WhatsappTemplatesListResponse;
    const results = Array.isArray(body?.results) ? body.results : [];
    if (nth >= results.length) {
      throw new Error(
        `getWhatsappTemplateIdByIndex: nth ${nth} is out of range (results length: ${results.length})`,
      );
    }
    const item = results[nth];
    if (!item?._id) {
      throw new Error(`getWhatsappTemplateIdByIndex: missing _id at index ${nth}`);
    }
    return String(item._id);
  }

  async previewWhatsappTemplate(lead_id: string): Promise<WhatsappPreviewParsedResult> {
    await this.initializeRequest();

    const sellDoVariableJson = await this.utils.getSellDoVariableJson();
    const getWhatsappTemplateId = await this.getWhatsappTemplateIdByIndex(0);
    const variableJson = JSON.parse(sellDoVariableJson);

    const response = await this.request.post(`/${this.clientId}/whatsapps/preview.json`, {
      params: { api_key: this.apiKey },
      data: {
        template_content: variableJson,
        lead_id: lead_id,
        template_id: getWhatsappTemplateId,
      },
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });

    expect(response.status()).toBe(200);
    
    const raw = await response.json();
    const rawContent = (raw as { template_content?: unknown })?.template_content;
    const templateContent = normalizeWhatsappPreviewTemplateContent(rawContent);

    const get = (variable: WhatsappTemplateVariable): string =>
      templateContent[variable] ?? "";

    return { raw, templateContent, get };
  }
}
