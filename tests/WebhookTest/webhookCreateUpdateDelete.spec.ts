import { test, expect } from "@playwright/test";
import {
  WebhookConfigurationAPIUtils,
  WebhookEvent,
} from "../../utils/APIUtils/webhookConfiguration.ts";
import { properties } from "../../properties/v2.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";

const webhookUrl = "https://marth-untranslated-compensatingly.ngrok-free.dev/webhook";
const updatedUrl = "https://marth-untranslated-compensatingly.ngrok-free.dev";
test.describe.configure({ mode: "serial" });

test.describe("Webhook Create, Update and Delete API Tests", () => {
  let webhookApi: WebhookConfigurationAPIUtils;
  const clientId = properties.Client_id;
  const apiKey = properties.FullAccess_API;
  let createdWebhookId: string;

  test.beforeAll(() => {
    webhookApi = new WebhookConfigurationAPIUtils(clientId, apiKey);
  });

  test("1. Create webhook", async () => {
    const utils = new Utils();
    const uniqueName = `Webhook Test ${await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false})}`;

    const response = await webhookApi.createWebhook(
      [WebhookEvent.LEAD_CREATED, WebhookEvent.LEAD_UPDATED],
      webhookUrl,
      { name: uniqueName, active: true }
    );

    expect(response).toBeDefined();
    expect(response.webhook).toBeDefined();
    expect(response.webhook._id).toBeTruthy();
    expect(response.webhook.name).toBe(uniqueName);
    expect(response.webhook.url).toBe(webhookUrl);
    expect(response.webhook.active).toBe(true);
    expect(response.webhook.events).toContain(WebhookEvent.LEAD_CREATED);
    expect(response.webhook.events).toContain(WebhookEvent.LEAD_UPDATED);
    expect(response.message).toBeTruthy();

    createdWebhookId = response.webhook._id;
  });

  test("2. Update webhook", async () => {
    expect(createdWebhookId).toBeDefined();

    const utils = new Utils();
    const updatedName = `Webhook Updated ${await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false})}`;

    await webhookApi.updateWebhookConfiguration(createdWebhookId, {
      name: updatedName,
      url: updatedUrl,
      active: false,
      events: [WebhookEvent.LEAD_CREATED, WebhookEvent.LEAD_UPDATED, WebhookEvent.LEAD_DELETED],
    });

    const getResponse = await webhookApi.getWebhookById(createdWebhookId);
    const webhook = getResponse.webhook ?? getResponse;
    expect(webhook.name).toBe(updatedName);
    expect(webhook.url).toBe(updatedUrl);
    expect(webhook.active).toBe(false);
    expect(webhook.events).toContain(WebhookEvent.LEAD_DELETED);
  });

  test.skip("3. Delete webhook", async () => {
    expect(createdWebhookId).toBeDefined();

    await webhookApi.deleteWebhook(createdWebhookId);

    const getResponse = await webhookApi.getWebhooks();
    // Assuming getResponse is already an array or contains webhooks in .webhooks property
    const webhooks = Array.isArray(getResponse)
      ? getResponse
      : getResponse.webhooks
        ? getResponse.webhooks
        : [];
    const found = webhooks.find((w: any) => (w._id ?? w.id) === createdWebhookId);
    expect(found).toBeUndefined();

  });
});
