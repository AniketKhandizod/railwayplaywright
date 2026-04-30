import { APIRequestContext, expect, request } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { Utils } from "../../PlaywrightTestUtils";
import { properties } from "../../../Environment/v2";
import { CRMAPIUtils, UserRoleFilter } from "../CRMAPIUtils";

type CreateDeveloperResponse = {
  _id?: string;
  id?: string;
};

type CreateProjectResponse = {
  _id?: string;
  id?: string;
};

/** Address + possession sent when creating a project (used to assert import/show_v2 payloads). */
export type CreatedProjectSummary = {
  id: string;
  possession: string;
  address1: string;
  address2: string;
  zip: string;
  city: string;
  state: string;
  country: string;
};

type CreateTowerResponse = {
  _id?: string;
  id?: string;
};

type CreatePaymentScheduleResponse = {
  _id?: string;
  id?: string;
};

type PostSalesTemplateListItem = {
  _id?: string;
  id?: string;
  name?: string;
};

type PostSalesTemplatesResponse = {
  results?: PostSalesTemplateListItem[];
  total?: number;
  page?: number | null;
  per_page?: number;
};

type SchemeListItem = {
  _id?: string;
  created_at?: string;
  // allow extra fields without typing everything
  [key: string]: any;
};

type CreateFloorPlanResponse = {
  _id?: string;
  id?: string;
};

type CreateProjectUnitResponse = {
  _id?: string;
  id?: string;
};

type ProjectUnitAutocompleteItem = {
  _id?: string;
  name?: string;
  project_name?: string;
  project_tower_name?: string;
  unit_configuration_name?: string;
  model?: string;
  [key: string]: unknown;
};

/** JSON from GET `/client/project_units/:id/show_v2.json` (fields vary by client/config). */
export type ProjectUnitShowV2Json = Record<string, unknown>;

type UnitConfigurationUiJson = {
  bedrooms?: number | string;
  bathrooms?: number | string;
  measure?: string;
  saleable?: number | string;
  carpet?: number | string;
  loading?: number | string;
  base_rate?: number | string;
  base_price?: number | string;
  type?: string;
  category?: string;
  [key: string]: any;
};

export class InventoryCreator {

  private requestContext!: APIRequestContext;
  private utils!: Utils;

  private readonly clientId: string;
  private readonly apiKey: string;

  constructor(clientId: string, apiKey: string) {
    this.clientId = clientId;
    this.apiKey = apiKey;
  }

  private async initializeRequest() {
    if (!this.requestContext) {
      this.utils = new Utils();
      this.requestContext = await request.newContext();
    }
  }

  private async resolveTowerIdForPaymentSchedule(paymentScheduleId: string): Promise<string> {
    // Try a few known-ish endpoints; whichever works first wins.
    const candidates = [
      `/client/payment_schedules/${paymentScheduleId}.json`,
      `/client/payment_schedules/${paymentScheduleId}`,
      `/client/project_tower_payment_schedules/${paymentScheduleId}.json`,
      `/client/project_tower_payment_schedules/${paymentScheduleId}`,
    ];

    for (const url of candidates) {
      const res = await this.requestContext.get(url, {
        params: {
          api_key: this.apiKey,
          client_id: this.clientId,
        },
      });

      if (!res.ok()) continue;

      const body = (await res.json().catch(() => ({}))) as Record<string, any>;
      // Common shapes we might see.
      const towerId =
        body?.project_tower_id ??
        body?.project_tower?._id ??
        body?.project_tower?.id ??
        body?.payment_schedule?.project_tower_id ??
        body?.payment_schedule?.project_tower?._id ??
        body?.payment_schedule?.project_tower?.id ??
        body?.project_tower_payment_schedule?.project_tower_id ??
        body?.project_tower_payment_schedule?.project_tower?._id ??
        body?.project_tower_payment_schedule?.project_tower?.id;

      if (typeof towerId === "string" && towerId.trim()) return towerId.trim();
    }

    throw new Error(
      `Unable to resolve tower id for payment schedule ${paymentScheduleId}. ` +
        `Need an endpoint that returns project_tower_id for the given payment schedule.`,
    );
  }

  /**
   * Creates a developer via `/client/developers.json` and returns the created developer `_id`.
   * Only `developerName` is required; the rest is randomly generated.
   */
  async createDeveloper(developerName: string): Promise<string> {
    await this.initializeRequest();

    const randomDescription = `<p>${await this.utils.generateRandomString(20, { casing: "mixed", includeNumbers: true, includeSpecialChars: false })}</p>`;
    const randomAddress1 = await this.utils.generateRandomString(10, { casing: "mixed", includeNumbers: true, includeSpecialChars: false });
    const randomAddress2 = await this.utils.generateRandomString(10, { casing: "mixed", includeNumbers: true, includeSpecialChars: false });
    const randomZip = await this.utils.generateRandomNumber(6);

    const randomFirstName = await this.utils.generateRandomString(8, { casing: "mixed", includeNumbers: false, includeSpecialChars: false });
    const randomLastName = await this.utils.generateRandomString(8, { casing: "mixed", includeNumbers: false, includeSpecialChars: false });
    const randomDesignation = await this.utils.generateRandomString(10, { casing: "upper", includeNumbers: false, includeSpecialChars: false });

    const randomEmail = await this.utils.generateRandomEmail();
    const randomAltEmail = await this.utils.generateRandomEmail();

    const randomPhone = await this.utils.generateRandomPhoneNumber(); // 10-digit India mobile
    const randomAltPhone = await this.utils.generateRandomPhoneNumber();

    const res = await this.requestContext.post(`/client/developers.json`, {
      params: {
        api_key: this.apiKey,
        client_id: this.clientId,
      },
      multipart: {
        utf8: "✓",
        "developer[name]": developerName,
        "developer[description]": randomDescription,
        files: "",

        "developer[address][address1]": randomAddress1,
        "developer[address][address2]": randomAddress2,
        "developer[address][country]": "India",
        "developer[address][state]": "Maharashtra",
        "developer[address][city]": "Ahmednagar",
        "developer[address][zip]": randomZip,

        "developer[contact][salutation]": "mrs",
        "developer[contact][first_name]": randomFirstName,
        "developer[contact][last_name]": randomLastName,
        "developer[contact][phone[ph_number]]": randomPhone,
        "developer[contact][phone[dial_code]]": "91",
        "developer[contact][phone[country_code]]": "in",
        "developer[contact][alternate_phone[ph_number]]": randomAltPhone,
        "developer[contact][alternate_phone[dial_code]]": "91",
        "developer[contact][alternate_phone[country_code]]": "in",
        "developer[contact][designation]": randomDesignation,

        "developer[contact][email]": randomEmail,
        "developer[contact][alternate_email]": randomAltEmail,

        "developer[contact][pan]": "EXZPK3344D",
        commit: "Save",
      },
    });

    const body = (await res.json().catch(() => ({}))) as CreateDeveloperResponse;
    if (!res.ok()) {
      throw new Error(
        `Create developer failed. Status: ${res.status()} ${res.statusText()}, Response: ${JSON.stringify(body)}`,
      );
    }

    const id = body._id ?? body.id;
    expect(id, "Developer id missing in response").toBeTruthy();
    return String(id);
  }

  /**
   * Creates a project via `/client/projects.json` and returns the created project `_id`.
   * Accepts only core identifiers; the rest is randomly generated.
   */
  async createProject(
    projectName: string,
    developerId: string,
    projectSaleId: string,
    projectPreSaleId: string,
    enablePostSales: boolean,
  ): Promise<CreatedProjectSummary> {
    await this.initializeRequest();

    const description = `<p>${await this.utils.generateRandomString(12, { casing: "upper", includeNumbers: false, includeSpecialChars: false })}</p>`;
    const reraProjectId = await this.utils.generateRandomString(8, { casing: "mixed", includeNumbers: true, includeSpecialChars: false });

    const possessionYear = 2027 + Math.floor(Math.random() * 9); // 2027..2035
    const possession = `31/12/${possessionYear}`;

    const address1 = await this.utils.generateRandomString(10, { casing: "mixed", includeNumbers: true, includeSpecialChars: false });
    const address2 = await this.utils.generateRandomString(10, { casing: "mixed", includeNumbers: true, includeSpecialChars: false });
    const zip = await this.utils.generateRandomNumber(6);
    const microMarket = "Ahmednagar";

    const lat = String(10 + Math.floor(Math.random() * 80));
    const lng = String(10 + Math.floor(Math.random() * 80));

    const res = await this.requestContext.post(`/client/projects.json`, {
      params: {
        api_key: this.apiKey,
        client_id: this.clientId,
      },
      multipart: {
        utf8: "✓",
        "project[name]": projectName,
        "project[developer_id]": developerId,
        "project[description]": description,
        files: " ",
        "project[rera_project_id]": reraProjectId,
        "project[project_sale_ids]": projectSaleId,
        "project[project_pre_sale_ids]": projectPreSaleId,
        "project[possession]": possession,
        address: address1,
        "project[address_attributes][address1]": address1,
        "project[address_attributes][address2]": address2,
        "project[address_attributes][country]": "India",
        "project[address_attributes][state]": "Maharashtra",
        "project[address_attributes][city]": "Ahmednagar",
        "project[address_attributes][zip]": zip,
        "project[micro_market]": microMarket,
        "project[lat]": lat,
        "project[lng]": lng,
        commit: "Save",
      },
    });

    const body = (await res.json().catch(() => ({}))) as CreateProjectResponse;
    if (!res.ok()) {
      throw new Error(
        `Create project failed. Status: ${res.status()} ${res.statusText()}, Response: ${JSON.stringify(body)}`,
      );
    }

    const id = body._id ?? body.id;
    expect(id, "Project id missing in response").toBeTruthy();

    if (enablePostSales) {
      await this.setProjectPostSalesEnabled(String(id), true);
    }
    return {
      id: String(id),
      possession,
      address1,
      address2,
      zip: String(zip),
      city: "Ahmednagar",
      state: "Maharashtra",
      country: "India",
    };
  }

  /**
   * Creates a tower via `/client/project_towers.json` and returns the created tower `_id`.
   * Method accepts only tower name and total floors; project is picked from `properties.Project_id`.
   */
  async createTower(towerName: string, projectId: string, totalFloors: number | string): Promise<string> {
    await this.initializeRequest();

    const reraTowerId = await this.utils.generateRandomNumber(2);

    const res = await this.requestContext.post(`/client/project_towers.json`, {
      params: {
        api_key: this.apiKey,
        client_id: this.clientId,
      },
      multipart: {
        utf8: "✓",
        "project_tower[name]": towerName,
        "project_tower[project_id]": projectId,
        "project_tower[total_floors]": String(totalFloors),
        "project_tower[rera_tower_id]": reraTowerId,
        commit: "Save",
      },
    });

    const body = (await res.json().catch(() => ({}))) as CreateTowerResponse;
    if (!res.ok()) {
      throw new Error(
        `Create tower failed. Status: ${res.status()} ${res.statusText()}, Response: ${JSON.stringify(body)}`,
      );
    }

    const id = body._id ?? body.id;
    expect(id, "Tower id missing in response").toBeTruthy();

    // Create and approve payment schedule
    const paymentScheduleId = await this.createPaymentSchedule("Payment schedule for Tower", projectId, String(id));
    await this.approvePaymentSchedule(String(id), String(paymentScheduleId));

    // Get and approve latest scheme
    const schemeId = await this.getLatestSchemeId(String(id));
    await this.approveScheme(String(id), String(schemeId));

    return String(id);
  }

  /**
   * Creates a payment schedule for a newly created tower and returns schedule `_id`.
   * Accepts only payment schedule name; tower dependency is auto-created.
   */
  private async createPaymentSchedule(paymentScheduleName: string,projectId: string, towerId: string): Promise<string> {
    await this.initializeRequest();

    const templateId = await this.getDemandLetterTemplateId(projectId, towerId);
    const paymentSchedulePayload = {
      name: paymentScheduleName,
      floor_wise_type: "custom",
      schedule: [{"key":"stage_booking","dl_generation_date":"","dl_generation_days":"","display_name":"Booking","dl_generation_type":"relative","unit_tower_stage":"stage_booking","template_id":templateId,"calculation_type":"calculate","op1":100,"cost_type":"agreement_value","order":1}],
      is_hybrid: null,
      is_dated: null,
    };

    const res = await this.requestContext.post(
      `/client/project_towers/${towerId}/payment_schedules.json`,
      {
        params: {
          api_key: this.apiKey,
          client_id: this.clientId,
        },
        form: {
          utf8: "✓",
          payment_schedule: JSON.stringify(paymentSchedulePayload),
          commit: "Save",
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const contentType = res.headers()["content-type"] ?? "";
    if (contentType.includes("application/json")) {
      const body = (await res.json().catch(() => ({}))) as CreatePaymentScheduleResponse;
      if (!res.ok()) {
        throw new Error(
          `Create payment schedule failed. Status: ${res.status()} ${res.statusText()}, Response: ${JSON.stringify(body)}`,
        );
      }
      const id = body._id ?? body.id;
      expect(id, "Payment schedule id missing in response").toBeTruthy();
      return String(id);
    }

    const html = await res.text();
    if (!res.ok()) {
      throw new Error(
        `Create payment schedule failed. Status: ${res.status()} ${res.statusText()}, Response: ${html.slice(0, 500)}`,
      );
    }

    const match =
      html.match(/payment_schedules\/([a-f0-9]{24})/i) ??
      html.match(/payment_schedule_id["']?\s*[:=]\s*["']([a-f0-9]{24})["']/i);

    const id = match?.[1];
    expect(id, "Payment schedule id not found in response").toBeTruthy();
    return String(id);
  }

  /**
   * Returns the Post Sales template id for "Send Demand Letter to a Customer".
   * Optimized pagination: determines total pages from `total` + `per_page`.
   */
  private async getDemandLetterTemplateId(projectId: string, towerId: string): Promise<string> {
    await this.initializeRequest();

    const targetName = "Send Demand Letter to a Customer";
    const safetyMaxPages = 100;

    // Fetch first page to learn pagination.
    const firstPage = 1;
    const firstRes = await this.requestContext.get(
      `/client/projects/${projectId}/post_sales_document_templates.json`,
      {
        params: {
          api_key: this.apiKey,
          client_id: this.clientId,
          page: String(firstPage),
        },
      },
    );

    const firstBody = (await firstRes.json().catch(() => ({}))) as PostSalesTemplatesResponse;
    if (!firstRes.ok()) {
      throw new Error(
        `Get post sales templates failed. Status: ${firstRes.status()} ${firstRes.statusText()}, Response: ${JSON.stringify(firstBody)}`,
      );
    }

    const foundOnFirst = firstBody.results?.find((t) => (t.name ?? "").trim() === targetName);
    if (foundOnFirst) {
      const id = foundOnFirst._id ?? foundOnFirst.id;
      expect(id, `Template id missing for "${targetName}"`).toBeTruthy();
      return String(id);
    }

    const total = typeof firstBody.total === "number" ? firstBody.total : 0;
    const perPage = typeof firstBody.per_page === "number" && firstBody.per_page > 0 ? firstBody.per_page : 15;
    const totalPages = Math.max(1, Math.ceil(total / perPage));

    if (totalPages > safetyMaxPages) {
      throw new Error(`Refusing to paginate ${totalPages} pages (safety cap ${safetyMaxPages}).`);
    }

    // Start from page 2 since page 1 is already checked.
    for (let page = firstPage + 1; page <= totalPages; page++) {
      const res = await this.requestContext.get(
        `/client/projects/${projectId}/post_sales_document_templates.json`,
        {
          params: {
            api_key: this.apiKey,
            client_id: this.clientId,
            page: String(page),
          },
        },
      );

      const body = (await res.json().catch(() => ({}))) as PostSalesTemplatesResponse;
      if (!res.ok()) {
        throw new Error(
          `Get post sales templates failed. Status: ${res.status()} ${res.statusText()}, Response: ${JSON.stringify(body)}`,
        );
      }

      const found = body.results?.find((t) => (t.name ?? "").trim() === targetName);
      if (found) {
        const id = found._id ?? found.id;
        expect(id, `Template id missing for "${targetName}"`).toBeTruthy();
        return String(id);
      }
    }

    throw new Error(`Template "${targetName}" not found for project ${projectId}`);
  }

  /**
   * Approves a payment schedule.
   * Accepts only `paymentScheduleId`; tower id is resolved via API.
   */
  private async approvePaymentSchedule(towerId: string, paymentScheduleId: string): Promise<boolean> {
    await this.initializeRequest();

    const res = await this.requestContext.put(
      `/client/project_towers/${towerId}/payment_schedules/${paymentScheduleId}/update_status`,
      {
        params: {
          api_key: this.apiKey,
          client_id: this.clientId,
          "payment_schedule[status]": "approved",
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        // Rails endpoints often accept PUT without a body; keep it minimal.
        data: "",
      },
    );

    return res.ok();
  }

  /**
   * Returns the scheme `_id` having the latest `created_at` for a given tower.
   */
  private async getLatestSchemeId(towerId: string): Promise<string> {
    await this.initializeRequest();

    const res = await this.requestContext.get(
      `/client/project_towers/${towerId}/schemes.json`,
      {
        params: {
          api_key: this.apiKey,
          client_id: this.clientId,
        },
      },
    );

    const raw = (await res.json().catch(() => ([]))) as SchemeListItem[] | Record<string, any>;
    if (!res.ok()) {
      throw new Error(
        `Get schemes failed. Status: ${res.status()} ${res.statusText()}, Response: ${JSON.stringify(raw)}`,
      );
    }

    const schemes: SchemeListItem[] = Array.isArray(raw) ? raw : (raw.results ?? []);
    if (!schemes.length) {
      throw new Error(`No schemes found for tower ${towerId}`);
    }

    const latest = schemes.reduce<SchemeListItem>((best, cur) => {
      const bestTime = best.created_at ? Date.parse(best.created_at) : NaN;
      const curTime = cur.created_at ? Date.parse(cur.created_at) : NaN;

      if (Number.isNaN(bestTime)) return cur;
      if (Number.isNaN(curTime)) return best;
      return curTime > bestTime ? cur : best;
    }, schemes[0]);

    const id = latest?._id;
    expect(id, "Latest scheme id missing in response").toBeTruthy();
    return String(id);
  }

  /**
   * Approves (activates) a scheme for a given tower.
   * Accepts tower id and scheme id and sets `scheme[status]=active`.
   */
  private async approveScheme(towerId: string, schemeId: string): Promise<boolean> {
    await this.initializeRequest();

    const res = await this.requestContext.put(
      `/client/project_towers/${towerId}/schemes/${schemeId}/update_status`,
      {
        params: {
          api_key: this.apiKey,
          client_id: this.clientId,
          "scheme[status]": "active",
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: "",
      },
    );

    return res.ok();
  }

  /**
   * Enable/Disable Post Sales for a project.
   *
   * Optimized payload: only sends the flag + rails method override.
   * (Avoids sending the entire "edit project" form data.)
   */
  private async setProjectPostSalesEnabled(projectId: string, enabled: boolean): Promise<boolean> {
    await this.initializeRequest();
    const crmAPIUtils = new CRMAPIUtils(this.clientId, this.apiKey);
    const postSalesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.PostSales,{index:0});

    const res = await this.requestContext.post(
      `/client/projects/${projectId}.json`,
      {
        params: {
          api_key: this.apiKey,
          client_id: this.clientId,
        },
        multipart: {
          utf8: "✓",
          _method: "patch",
          "project[post_sales_enabled]": enabled ? "1" : "0",
          "project[project_post_sale_ids]":postSalesUserSummary.id,
          commit: "Save",
        },
      },
    );
    await this.utils.print(`Project ${projectId} post sales enabled: ${enabled} and assigned to post sales user ${postSalesUserSummary.name}`);
    return res.ok();
  }

  private async getUnitConfigurationUiJson(unitConfigurationId: string): Promise<UnitConfigurationUiJson> {
    await this.initializeRequest();

    const res = await this.requestContext.get(`/client/unit_configurations/${unitConfigurationId}.json`, {
      params: {
        api_key: this.apiKey,
        client_id: this.clientId,
      },
      headers: {
        accept: "application/json",
      },
    });

    const body = (await res.json().catch(() => ({}))) as UnitConfigurationUiJson;
    if (!res.ok()) {
      throw new Error(
        `Get unit configuration failed. Status: ${res.status()} ${res.statusText()}, Response: ${JSON.stringify(body)}`,
      );
    }

    return body;
  }

  /**
   * GET `/client/project_units/autocomplete.json?query=...` (same contract as the CRM autocomplete).
   * Returns the first result's `_id`.
   */
  private async getFirstProjectUnitIdFromAutocomplete(query: string): Promise<string> {
    await this.initializeRequest();

    const res = await this.requestContext.get(`/client/project_units/autocomplete.json`, {
      params: {
        query,
        api_key: this.apiKey,
        client_id: this.clientId,
      },
      headers: {
        accept: "application/json",
      },
    });

    const body = (await res.json().catch(() => null)) as ProjectUnitAutocompleteItem[] | null;
    if (!res.ok()) {
      throw new Error(
        `Project unit autocomplete failed. Status: ${res.status()} ${res.statusText()}, Response: ${JSON.stringify(body)}`,
      );
    }
    if (!Array.isArray(body) || body.length === 0) {
      throw new Error(`Project unit autocomplete returned no results for query: ${JSON.stringify(query)}`);
    }

    const id = body[0]?._id;
    expect(id, "Project unit _id missing in autocomplete first result").toBeTruthy();
    return String(id);
  }

  /**
   * GET `/client/project_units/:id/show_v2.json` for the unit whose display name matches `unitName`.
   * Resolves `id` via {@link getFirstProjectUnitIdFromAutocomplete}.
   */
  async getProjectUnitShowV2ByUnitName(unitName: string): Promise<ProjectUnitShowV2Json> {
    const unitId = await this.getFirstProjectUnitIdFromAutocomplete(unitName);
    await this.initializeRequest();

    const res = await this.requestContext.get(`/client/project_units/${unitId}/show_v2.json`, {
      params: {
        api_key: this.apiKey,
        client_id: this.clientId,
      },
      headers: {
        accept: "application/json",
      },
    });

    const body = (await res.json().catch(() => ({}))) as ProjectUnitShowV2Json;
    if (!res.ok()) {
      throw new Error(
        `Get project unit show_v2 failed. Status: ${res.status()} ${res.statusText()}, Response: ${JSON.stringify(body)}`,
      );
    }

    return body;
  }

  async getProjectUnitShowV2ById(unitId: string): Promise<ProjectUnitShowV2Json> {
    await this.initializeRequest();

    const res = await this.requestContext.get(`/client/project_units/${unitId}/show_v2.json`, {
      params: {
        api_key: this.apiKey,
        client_id: this.clientId,
      },
      headers: {
        accept: "application/json",
      },
    });

    const body = (await res.json().catch(() => ({}))) as ProjectUnitShowV2Json;
    if (!res.ok()) {
      throw new Error(
        `Get project unit show_v2 failed. Status: ${res.status()} ${res.statusText()}, Response: ${JSON.stringify(body)}`,
      );
    }

    return body;
  }

  /**
   * Creates one Project Unit (POST `/client/project_units`) and returns created `_id`.
   *
   * Accepts a minimal param set mirroring your CURL payload. It fetches unit configuration UI json
   * to populate carpet/saleable/loading/bedrooms/bathrooms/measure so the created unit is complete.
   */
  async createProjectUnit(params: {
    developerId: string;
    projectId: string;
    projectTowerId: string;
    unitConfigurationId: string;
    name: string;
    floor: number | string;
    unitIndex: number | string;
    baseRate: number | string;
    basePrice: number | string;
    propertyPurpose: string; // "sale" (primary use-case)
    type: string;
    category: string;
  }): Promise<string> {
    await this.initializeRequest();

    const uc = await this.getUnitConfigurationUiJson(params.unitConfigurationId);

    const bedrooms = Number.isFinite(Number(uc?.bedrooms)) ? Number(uc.bedrooms) : 0;
    const bathrooms = Number.isFinite(Number(uc?.bathrooms)) ? Number(uc.bathrooms) : 0;
    const measure = (uc?.measure ?? "sq_ft").toString();
    const carpet = Number.isFinite(Number(uc?.carpet)) ? Number(uc.carpet) : 0;
    const saleable = Number.isFinite(Number(uc?.saleable)) ? Number(uc.saleable) : 0;
    const loading = Number.isFinite(Number(uc?.loading)) ? Number(uc.loading) : 0;

    const baseRateFinal =
      uc?.base_rate !== undefined && uc?.base_rate !== null ? String(uc.base_rate) : String(params.baseRate);
    const basePriceFinal =
      uc?.base_price !== undefined && uc?.base_price !== null ? String(uc.base_price) : String(params.basePrice);

    const typeFinal = (uc?.type ?? params.type).toString();
    const categoryFinal = (uc?.category ?? params.category).toString();

    const unitFloorStr = String(params.floor);
    const unitIndexStr = String(params.unitIndex);

    const form = {
      utf8: "✓",
      commit: "Save",
      // Match Rails form field name; images are uploaded via `files`.
      files: "",

      "project_unit[developer_id]": params.developerId,
      "project_unit[project_id]": params.projectId,
      "project_unit[project_tower_id]": params.projectTowerId,
      "project_unit[unit_configuration_id]": params.unitConfigurationId,

      "project_unit[name]": params.name,
      "project_unit[floor]": unitFloorStr,
      "project_unit[unit_index]": unitIndexStr,

      "project_unit[base_rate]": baseRateFinal,
      "project_unit[base_price]": basePriceFinal,

      "project_unit[property_purpose]": params.propertyPurpose,
      "project_unit[type]": typeFinal,
      "project_unit[category]": categoryFinal,

      "project_unit[bedrooms]": String(bedrooms),
      "project_unit[bathrooms]": String(bathrooms),
      "project_unit[measure]": measure,
      "project_unit[carpet]": String(carpet),
      "project_unit[saleable]": String(saleable),
      "project_unit[loading]": String(loading),

      // Optional UI form fields (kept empty/minimal).
      "project_unit[description]": `<p>${await this.utils.generateRandomString(12, { casing: "lower", includeNumbers: true, includeSpecialChars: false })}</p>`,
    };

    // Rails create responds with JSON when Accept is application/json.
    const res = await this.requestContext.post(`/client/project_units.json`, {
      params: {
        api_key: this.apiKey,
        client_id: this.clientId,
      },
      form,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        accept: "application/json",
      },
    });

    const body = (await res.json().catch(() => ({}))) as CreateProjectUnitResponse;
    if (!res.ok()) {
      throw new Error(
        `Create project unit failed. Status: ${res.status()} ${res.statusText()}, Response: ${JSON.stringify(body)}`,
      );
    }

    const id = body._id ?? body.id;
    expect(id, "Project unit id missing in response").toBeTruthy();
    return String(id);
  }

  /**
   * Creates multiple project units by looping `count` times and calling `createProjectUnit` each time.
   *
   * Name/floor/unitIndex are derived from the base values:
   * - `name`: `name-(i+1)` when `count > 1`
   * - `floor` and `unitIndex`: increment when numeric, otherwise randomize.
   */
  async createProjectUnits(params: {
    count: number;
    developerId: string;
    projectId: string;
    projectTowerId: string;
    unitConfigurationId: string;
    name: string;
    floor: number | string;
    unitIndex: number | string;
    baseRate: number | string;
    basePrice: number | string;
    propertyPurpose: string;
    type: string;
    category: string;
  }): Promise<string[]> {
    await this.initializeRequest();

    const countNum = Number(params.count);
    if (!Number.isFinite(countNum) || countNum <= 0) {
      throw new Error(`Invalid count "${params.count}" (must be > 0)`);
    }

    const baseFloor = Number(params.floor);
    const baseUnitIndex = Number(params.unitIndex);

    const ids: string[] = [];
    for (let i = 0; i < countNum; i++) {
      const shouldSuffixName = countNum > 1;
      const unitName = shouldSuffixName ? `${params.name}-${i + 1}` : params.name;

      const floorFinal =
        Number.isFinite(baseFloor) && baseFloor !== 0 ? baseFloor + i : await this.utils.generateRandomInteger(1, 25);
      const unitIndexFinal =
        Number.isFinite(baseUnitIndex) && baseUnitIndex !== 0
          ? baseUnitIndex + i
          : await this.utils.generateRandomInteger(1, 5000);

      const id = await this.createProjectUnit({
        developerId: params.developerId,
        projectId: params.projectId,
        projectTowerId: params.projectTowerId,
        unitConfigurationId: params.unitConfigurationId,
        name: unitName,
        floor: floorFinal,
        unitIndex: unitIndexFinal,
        baseRate: params.baseRate,
        basePrice: params.basePrice,
        propertyPurpose: params.propertyPurpose,
        type: params.type,
        category: params.category,
      });
      ids.push(id);
    }

    return ids;
  }

  /**
   * Creates Floor Plan (`unit_configuration`) and returns created `_id`.
   * Auto-calculates Loading % as:
   *   ((saleable - carpet) / carpet) * 100
   * Auto-calculates Base Price as: saleable × base rate
   */
  async createFloorPlan(params: {
    developerId: string;
    projectId: string;
    projectTowerId: string;
    name: string;
    type: string; // e.g. apartment
    category: string; // e.g. premium
    bedrooms: string | number;
    bathrooms: string | number;
    measure: string; // e.g. sq_ft
    carpet: number | string;
    saleable: number | string;
    coveredArea?: number | string;
    terraceArea?: number | string;
    baseRate: number | string;
  }): Promise<string> {
    await this.initializeRequest();

    const carpetNum = typeof params.carpet === "string" ? Number(params.carpet) : params.carpet;
    const saleableNum = typeof params.saleable === "string" ? Number(params.saleable) : params.saleable;
    const baseRateNum = typeof params.baseRate === "string" ? Number(params.baseRate) : params.baseRate;
    if (!Number.isFinite(carpetNum) || carpetNum <= 0) {
      throw new Error(`Invalid carpet value "${params.carpet}" (must be > 0)`);
    }
    if (!Number.isFinite(saleableNum) || saleableNum <= 0) {
      throw new Error(`Invalid saleable value "${params.saleable}" (must be > 0)`);
    }
    if (!Number.isFinite(baseRateNum) || baseRateNum <= 0) {
      throw new Error(`Invalid base rate "${params.baseRate}" (must be > 0)`);
    }

    const loadingPct = ((saleableNum - carpetNum) / carpetNum) * 100;
    const loading = String(Math.round(loadingPct));
    const basePrice = saleableNum * baseRateNum;

    const res = await this.requestContext.post(`/client/unit_configurations.json`, {
      params: {
        api_key: this.apiKey,
        client_id: this.clientId,
      },
      multipart: {
        utf8: "✓",
        "unit_configuration[developer_id]": params.developerId,
        "unit_configuration[project_id]": params.projectId,
        "unit_configuration[project_tower_id]": params.projectTowerId,
        "unit_configuration[name]": params.name,
        "unit_configuration[type]": params.type,
        "unit_configuration[category]": params.category,
        "unit_configuration[bedrooms]": String(params.bedrooms),
        "unit_configuration[bathrooms]": String(params.bathrooms),
        "unit_configuration[measure]": params.measure,
        "unit_configuration[carpet]": String(params.carpet),
        "unit_configuration[saleable]": String(params.saleable),
        "unit_configuration[loading]": loading,
        "unit_configuration[covered_area]": params.coveredArea !== undefined ? String(params.coveredArea) : "",
        "unit_configuration[terrace_area]": params.terraceArea !== undefined ? String(params.terraceArea) : "",
        "unit_configuration[base_rate]": String(params.baseRate),
        "unit_configuration[base_price]": String(basePrice),
        commit: "Save",
      },
    });

    const contentType = res.headers()["content-type"] ?? "";
    if (contentType.includes("application/json")) {
      const body = (await res.json().catch(() => ({}))) as CreateFloorPlanResponse;
      if (!res.ok()) {
        throw new Error(
          `Create floor plan failed. Status: ${res.status()} ${res.statusText()}, Response: ${JSON.stringify(body)}`,
        );
      }
      const id = body._id ?? body.id;
      expect(id, "Floor plan id missing in response").toBeTruthy();
      return String(id);
    }

    const html = await res.text();
    if (!res.ok()) {
      throw new Error(
        `Create floor plan failed. Status: ${res.status()} ${res.statusText()}, Response: ${html.slice(0, 500)}`,
      );
    }

    const match = html.match(/unit_configurations\/([a-f0-9]{24})/i);
    const id = match?.[1];
    expect(id, "Floor plan id not found in response").toBeTruthy();
    return String(id);
  }

  async getInventoryConstants(){
    await this.initializeRequest();
    const res = await this.requestContext.get(`/client/inventory_constants.json`, {
      params: {
        api_key: this.apiKey,
        client_id: this.clientId,
      },
    });
    const body = await res.json();
    if (!res.ok()) {
      throw new Error(
        `Get inventory constants failed. Status: ${res.status()} ${res.statusText()}, Response: ${JSON.stringify(body)}`,
      );
    }
    return body;
  }
}

