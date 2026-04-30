import { expect, APIRequestContext, request } from "@playwright/test";

/**
 * Webhook event types supported by sell.do API.
 * Aligned with API response and PR/code (client webhooks).
 */
export enum WebhookEvent {
  LEAD_CREATED = "LEAD_CREATED",
  LEAD_UPDATED = "LEAD_UPDATED",
  LEAD_DELETED = "LEAD_DELETED",
  SITE_VISIT_CREATED = "SITE_VISIT_CREATED",
  SITE_VISIT_UPDATED = "SITE_VISIT_UPDATED",
  SITE_VISIT_DELETED = "SITE_VISIT_DELETED",
  CAMPAIGN_RESPONSE_CREATED = "CAMPAIGN_RESPONSE_CREATED",
  CAMPAIGN_RESPONSE_DELETED = "CAMPAIGN_RESPONSE_DELETED",
  CALL_CREATED = "CALL_CREATED",
  CALL_UPDATED = "CALL_UPDATED",
  CALL_DELETED = "CALL_DELETED",
  FOLLOWUP_CREATED = "FOLLOWUP_CREATED",
  FOLLOWUP_UPDATED = "FOLLOWUP_UPDATED",
  FOLLOWUP_DELETED = "FOLLOWUP_DELETED",
  NOTE_CREATED = "NOTE_CREATED",
  NOTE_DELETED = "NOTE_DELETED",
  INTERESTED_PROPERTY_CREATED = "INTERESTED_PROPERTY_CREATED",
  INTERESTED_PROPERTY_UPDATED = "INTERESTED_PROPERTY_UPDATED",
  INTERESTED_PROPERTY_DELETED = "INTERESTED_PROPERTY_DELETED",
  PROJECT_CREATED = "PROJECT_CREATED",
  PROJECT_UPDATED = "PROJECT_UPDATED",
  PROJECT_DELETED = "PROJECT_DELETED",
  PROJECT_UNIT_CREATED = "PROJECT_UNIT_CREATED",
  PROJECT_UNIT_UPDATED = "PROJECT_UNIT_UPDATED",
  PROJECT_UNIT_DELETED = "PROJECT_UNIT_DELETED",
  BOOKING_DETAIL_CREATED = "BOOKING_DETAIL_CREATED",
  BOOKING_DETAIL_UPDATED = "BOOKING_DETAIL_UPDATED",
  BOOKING_DETAIL_DELETED = "BOOKING_DETAIL_DELETED",
  BOOKING_SCHEME_CREATED = "BOOKING_SCHEME_CREATED",
  BOOKING_SCHEME_UPDATED = "BOOKING_SCHEME_UPDATED",
  BOOKING_SCHEME_DELETED = "BOOKING_SCHEME_DELETED",
  APPLICANT_CREATED = "APPLICANT_CREATED",
  APPLICANT_UPDATED = "APPLICANT_UPDATED",
  APPLICANT_DELETED = "APPLICANT_DELETED",
  BOOKING_RECEIPT_CREATED = "BOOKING_RECEIPT_CREATED",
  BOOKING_RECEIPT_UPDATED = "BOOKING_RECEIPT_UPDATED",
  BOOKING_RECEIPT_DELETED = "BOOKING_RECEIPT_DELETED",
  DEMAND_LETTER_CREATED = "DEMAND_LETTER_CREATED",
  DEMAND_LETTER_UPDATED = "DEMAND_LETTER_UPDATED",
  DEMAND_LETTER_DELETED = "DEMAND_LETTER_DELETED",
  USER_CREATED = "USER_CREATED",
  USER_UPDATED = "USER_UPDATED",
  USER_DELETED = "USER_DELETED",
  TEAM_CREATED = "TEAM_CREATED",
  TEAM_UPDATED = "TEAM_UPDATED",
  TEAM_DELETED = "TEAM_DELETED",
}

/**
 * Authentication type for webhook (API supports NONE and others).
 */
export type WebhookAuthenticationType = "NONE" | "BASIC" | "BEARER";

/**
 * Options for creating a webhook. Only enabledEvents are sent; other events are disabled.
 */
export interface CreateWebhookOptions {
  /** Display name for the webhook */
  name?: string;
  /** Whether the webhook is active (default true) */
  active?: boolean;
  /** Authentication type (default NONE) */
  authentication_type?: WebhookAuthenticationType;
  /** Authentication data (e.g. headers/credentials); null for NONE */
  authentication_data?: Record<string, string> | null;
  /** Request type (API supports POST) */
  request_type?: "POST";
}

/**
 * API response for webhook create.
 */
export interface WebhookCreateResponse {
  webhook: {
    _id: string;
    active: boolean;
    authentication_key: string | null;
    authentication_type: string;
    client_id: string;
    consecutive_retry_count: number;
    created_at: string;
    created_by_id: string;
    events: string[];
    last_triggered_at: string | null;
    name: string;
    request_type: string;
    system: boolean;
    trigger_count: number;
    updated_at: string;
    updated_by_id: string;
    url: string;
  };
  message: string;
}

/**
 * API response for webhook search (POST /client/webhooks/search.json).
 */
export interface WebhookSearchResponse {
  webhooks: Array<{
    id: string;
    name: string;
    url: string;
    events: string[];
    active: boolean;
    triggerCount: number;
    lastTriggeredAt: string | null;
    system: boolean;
    requestType: string;
    authenticationType: string;
    authenticationKey: string | null;
    consecutiveRetryCount: number;
    updatedBy: { id: string; name: string };
    createdBy: { id: string; name: string };
    createdAt: string;
    updatedAt: string;
    authenticationData: Record<string, unknown>;
    eventLogs: unknown[];
  }>;
  currentPage: string;
  totalPages: number;
  totalElements: number;
  perPage: number;
}

export class WebhookConfigurationAPIUtils {
  private request!: APIRequestContext;
  private readonly clientId: string;
  private readonly apiKey: string;

  constructor(clientId: string, apiKey: string) {
    this.clientId = clientId;
    this.apiKey = apiKey;
  }

  private async initializeRequest() {
    if (!this.request) {
      this.request = await request.newContext();
    }
  }

  /**
   * Create a webhook with only the given events enabled.
   * POST /client/webhooks.json
   * @param enabledEvents – Array of WebhookEvent (or event strings) to enable; all others are disabled
   * @param webhookUrl – Endpoint URL to receive webhook payloads
   * @param options – Optional name, active, authentication_type, authentication_data, request_type
   */
  async createWebhook(
    enabledEvents: (WebhookEvent | string)[],
    webhookUrl: string,
    options: CreateWebhookOptions = {}
  ): Promise<WebhookCreateResponse> {
    await this.initializeRequest();

    const eventStrings = enabledEvents.map((e) => (typeof e === "string" ? e : String(e)));
    const payload = {
      name: options.name ?? "Webhook",
      url: webhookUrl,
      active: options.active ?? true,
      events: eventStrings,
      authentication_type: options.authentication_type ?? "NONE",
      authentication_data: options.authentication_data ?? null,
      request_type: options.request_type ?? "POST",
    };

    const response = await this.request.post(`/client/webhooks.json`, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
      },
      data: payload,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    expect(response.ok()).toBeTruthy();
    return await response.json();
  }

  /**
   * Search/list webhooks.
   * POST /client/webhooks/search.json
   * @param options – Optional page, sort, rules (default: page 1, sort updated_at desc, no filters)
   */
  async getWebhooks(options?: {
    page?: number;
    sort?: string;
    rules?: unknown[];
  }): Promise<WebhookSearchResponse> {
    await this.initializeRequest();
    const body = {
      page: options?.page ?? 1,
      sort: options?.sort ?? "updated_at,desc",
      rules: options?.rules ?? [],
    };
    const response = await this.request.post(`/client/webhooks/search.json`, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
      },
      data: body,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });
    expect(response.ok()).toBeTruthy();
    return await response.json();
  }

  // ✅ Get webhook by ID
  async getWebhookById(webhookId: string): Promise<any> {
    await this.initializeRequest();
    const response = await this.request.get(`/client/webhooks/${webhookId}.json`, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    expect(response.ok()).toBeTruthy();
    return await response.json();
  }

  // ✅ Update webhook configuration
  async updateWebhookConfiguration(
    webhookId: string,
    payload: {
      name?: string;
      url?: string;
      active?: boolean;
      events?: string[];
      authentication_type?: string;
      authentication_data?: Record<string, string> | null;
      request_type?: string;
    }
  ): Promise<any> {
    await this.initializeRequest();
    const response = await this.request.put(`/client/webhooks/${webhookId}.json`, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
      },
      data: payload,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });
    expect(response.ok()).toBeTruthy();
    return await response.json();
  }

  // ✅ Delete webhook
  async deleteWebhook(webhookId: string): Promise<any> {
    await this.initializeRequest();
    const response = await this.request.delete(`/client/webhooks/${webhookId}.json`, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    expect(response.ok()).toBeTruthy();
    return await response.json();
  }
}
