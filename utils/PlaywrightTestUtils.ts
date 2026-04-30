import { faker } from "@faker-js/faker";
import { DateTime } from "luxon";
import * as fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { Locator, Page } from "@playwright/test";
import { isValidPhoneNumber, parsePhoneNumber, type CountryCode } from "libphonenumber-js/max";
import { properties } from "./env";

/** Result of {@link Utils.generateRandomPhoneNumberWithCountry}. */
export type GeneratedPhoneWithCountry = {
  /** Country calling code, digits only (e.g. `"91"`). */
  countryCode: string;
  /** National significant number (e.g. `"9900332212"`). */
  phoneNumber: string;
  /** Country name (e.g. `"India"`, `"United States"`). */
  countryName: string;
  /** Spaced international form for APIs that expect it: `"+<countryCode> <phoneNumber>"`. */
  e164Display: string;
  /** Calling code + national, digits only (e.g. `"919900332212"`). */
  fullPhoneNumber: string;
};

type TimeAdjustments = {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
};

export enum AheadOf {
  Second = 1000,
  Minute = 60000,
  Hour = 3600000,
  Day = 86400000,
  Year = 31536000000,
}

export enum Country {
  India = "IN",
  UnitedStates = "US",
  UnitedKingdom = "GB",
  Canada = "CA",
  Australia = "AU",
  Germany = "DE",
  France = "FR",
  Spain = "ES",
  Italy = "IT",
  Netherlands = "NL",
  Brazil = "BR",
  Mexico = "MX",
  Japan = "JP",
  China = "CN",
  Russia = "RU",
  SouthKorea = "KR",
  SaudiArabia = "SA",
  UnitedArabEmirates = "AE",
  Singapore = "SG",
  Malaysia = "MY",
  Thailand = "TH",
  Indonesia = "ID",
  Philippines = "PH",
  Vietnam = "VN",
  SouthAfrica = "ZA",
  Egypt = "EG",
  Nigeria = "NG",
  Kenya = "KE",
  Argentina = "AR",
  Chile = "CL",
  Colombia = "CO",
  Peru = "PE",
  Turkey = "TR",
  Poland = "PL",
  Sweden = "SE",
  Norway = "NO",
  Denmark = "DK",
  Finland = "FI",
  Belgium = "BE",
  Switzerland = "CH",
  Austria = "AT",
  Portugal = "PT",
  Greece = "GR",
  Ireland = "IE",
  NewZealand = "NZ",
  Israel = "IL",
  Pakistan = "PK",
  Bangladesh = "BD",
  SriLanka = "LK",
  Nepal = "NP",
  Afghanistan = "AF",
  Iran = "IR",
  Iraq = "IQ",
}

export class Utils {

  private consoleErrors: string[] = [];
  private jsErrors: string[] = [];
  private apiErrors: string[] = [];
  private networkErrors: string[] = [];

  async startErrorTracking(page: Page): Promise<void> {

    page.on('console', msg => {
      if (msg.type() === 'error') {
        this.consoleErrors.push(msg.text());
      }
    });
  
    page.on('pageerror', error => {
      this.jsErrors.push(error.message);
    });
  
    page.on('response', response => {
      if (response.status() >= 500) {
        this.apiErrors.push(response.url());
      }
    });
  
    page.on('requestfailed', request => {
      this.networkErrors.push(request.url());
    });
  
  }

  async validateBrowserAndApiErrors(): Promise<boolean> {

      this.print(`consoleErrors >> ${this.consoleErrors.length}${this.consoleErrors.length > 0 ? " >>> " + this.consoleErrors.join(" | ") : ""}, ` );
      this.print(`jsErrors >>  ${this.jsErrors.length}${this.jsErrors.length > 0 ? " >>> " + this.jsErrors.join(" | ") : ""}, ` );
      this.print(`apiErrors >> ${this.apiErrors.length}${this.apiErrors.length > 0 ? " >>> " + this.apiErrors.join(" | ") : ""}, ` );
      this.print(`networkErrors >> ${this.networkErrors.length}${this.networkErrors.length > 0 ? " >>> " + this.networkErrors.join(" | ") : ""}` );
      
    if (
      this.consoleErrors.length > 0 ||
      this.jsErrors.length > 0 ||
      this.apiErrors.length > 0 ||
      this.networkErrors.length > 0
    ) {
      return false;
    }
  
    return true;
  }

  // To generate random subset from array
  getRandomSubsetFromArray(array: string[]): string {
    const count = Math.floor(Math.random() * array.length) + 1;
    const result = new Set<string>();

    while (result.size < count) {
      const randomIndex = Math.floor(Math.random() * array.length);
      result.add(array[randomIndex]);
    }

    return Array.from(result).join(",");
  }

  /**
   * Serializes `print` arguments to one line for the persistence file (console still uses multi-arg `console.log`).
   */
  private formatPrintLineForFile(message?: any, optionalParams: any[] = []): string {
    const parts: string[] = [String(message ?? "")];
    for (const p of optionalParams) {
      if (p === undefined) {
        parts.push("undefined");
      } else if (p === null) {
        parts.push("null");
      } else if (typeof p === "object") {
        try {
          parts.push(JSON.stringify(p));
        } catch {
          parts.push(String(p));
        }
      } else {
        parts.push(String(p));
      }
    }
    return `>> ${parts.join(" ")}`;
  }

  async print(message?: any, ...optionalParams: any[]): Promise<void> {
    const toConsole = properties.printLogsToConsole;
    const toFile = properties.persistPrintLogsToFile;

    if (!toConsole && !toFile) {
      return;
    }

    if (toFile) {
      const storeDirRaw = (properties.printLogsStorePath || properties.ImportLocation || "./store").trim();
      const storeDir = path.isAbsolute(storeDirRaw) ? storeDirRaw : path.join(process.cwd(), storeDirRaw);
      const fileName = (properties.printLogFileName || "playwright-print.log").replace(/[/\\]/g, "_");
      const filePath = path.join(storeDir, fileName);
      const line = this.formatPrintLineForFile(message, optionalParams);
      const stamped = `[${new Date().toISOString()}] ${line}\n`;

      try {
        await fs.promises.mkdir(storeDir, { recursive: true });
        await fs.promises.appendFile(filePath, stamped, "utf8");
      } catch (err) {
        console.error("Utils.print: could not append to log file:", filePath, err);
      }
    }

    if (toConsole) {
      console.log(">> " + message, ...optionalParams);
    }
  }

  getLeadCreatePayload(email: string,srd: string,restrictedAccessAPI: string): string{
      const webhookPayload = `{
        "sell_do": {
            "form": {
                "lead": {
                    "name": "Webhook Lead",
                    "phone": "",
                    "email": "${email}",
                    "project_id": "",
                    "sales": "",
                    "user_created_tags": [
                        "ads",
                        "adad"
                    ]
                }
            },
            "campaign": {
                "srd": "${srd}"
            }
        },
        "api_key": "${restrictedAccessAPI}"
    }`;
    return webhookPayload;
  }

  getSellDoVariableJson(): string {
    const sellDoVariableJson = `{
          "project_name": "$project_name",
          "rera_id": "$rera_id",
          "project_address": "$project_address",
          "last_lead_project_name": "$last_lead_project_name",
          "first_lead_project_name": "$first_lead_project_name",
          "name": "$lead_name",
          "lead_first_name": "$lead_first_name",
          "lead_last_name": "$lead_last_name",
          "lead_id": "$lead_id",
          "leadid": "$leadid",
          "lead_email": "$lead_email",
          "lead_phone_number": "$lead_phone_number",
          "sales_email": "$sales_email",
          "lead_created_at_date_only": "$lead_created_at_date_only",
          "latest_campaign": "$latest_campaign",
          "latest_source": "$latest_source",
          "latest_sub_source": "$latest_sub_source",
          "lead_phone_dialcode": "$lead_phone_dialcode",
          "created_at": "$created_at",
          "client_short_name": "$client_short_name",
          "client_name": "$client_name",
          "last_note": "$last_note",
          "sales_name": "$sales_name",
          "team_name": "$team_name",
          "otp_code": "$otp_code",
          "current_time": "$current_time",
          "lead_created_at": "$lead_created_at",
          "lead_address": "$lead_address",
          "activity_owner": "$activity_owner",
          "agenda": "$agenda",
          "date": "$date",
          "time": "$time",
          "sitevisit_type": "$sitevisit_type",
          "conducted_on": "$conducted_on",
          "acted_on": "$acted_on",
          "lead_otp": "$lead_otp",
          "sales_otp": "$sales_otp",
          "sitevisit_google_calendar_invite": "$sitevisit_google_calendar_invite",
          "sitevisit_ms365_calendar_invite": "$sitevisit_ms365_calendar_invite",
          "sitevisit_zoom_calendar_invite": "$sitevisit_zoom_calendar_invite",
          "sitevisit_google_calendar_url": "$sitevisit_google_calendar_url",
          "sitevisit_ms365_calendar_url": "$sitevisit_ms365_calendar_url",
          "sitevisit_zoom_calendar_url": "$sitevisit_zoom_calendar_url",
          "sitevisit_google_calendar_sms_invite": "$sitevisit_google_calendar_sms_invite",
          "sitevisit_ms365_calendar_sms_invite": "$sitevisit_ms365_calendar_sms_invite",
          "sitevisit_zoom_calendar_sms_invite": "$sitevisit_zoom_calendar_sms_invite",
          "task_due_on": "$task_due_on",
          "task_priority": "$task_priority",
          "task_status": "$task_status",
          "task_assignee": "$task_assignee",
          "task_creator": "$task_creator",
          "taskable_type": "$taskable_type",
          "taskable_name": "$taskable_name",
          "lat": "$lat",
          "lng": "$lng",
          "followup_type": "$followup_type",
          "subject": "$subject",
          "vr_link": "$vr_link",
          "task_title": "$task_title",
          "ivr_number": "$ivr_number",
          "sales_manager_name": "$sales_manager_name",
          "by_creator_name": "$by_creator_name",
          "call_time": "$call_time",
          "record_url": "$record_url",
          "lead_profile_url": "$lead_profile_url",
          "call_feedback_url": "$call_feedback_url",
          "call_url": "$call_url",
          "email_url": "$email_url",
          "c_note": "$c_note",
          "booking_detail_id": "$booking_detail_id",
          "booking_amount": "$booking_amount",
          "project_tower_name": "$project_tower_name",
          "project_unit_name": "$project_unit_name",
          "applicant_name": "$applicant_name",
          "ledger_html": "$ledger_html",
          "sales_phone": "$sales_phone",
          "booking_id": "$booking_id",
          "booking_date": "$booking_date",
          "floor_number": "$floor_number",
          "unit_type": "$unit_type",
          "balance": "$balance",
          "plan_short_url": "$plan_short_url",
          "verification_code": "$verification_code",
          "qr_image": "$qr_image",
          "qr_image_sms": "$qr_image_sms",
          "pick_up_location_time": "$pick_up_location_time",
          "sales_pickup_info": "$sales_pickup_info",
          "lead_pickup_info": "$lead_pickup_info",
          "other_invities": "$other_invities",
          "pick_up_location": "$pick_up_location",
          "pick_up_time": "$pick_up_time",
          "requirement": "$requirement",
          "s_note": "$s_note",
          "requirement_min_possession": "$requirement_min_possession",
          "requirement_max_possession": "$requirement_max_possession",
          "confirmation_url": "$confirmation_url",
          "lead_source": "$lead_source",
          "lead_campaign": "$lead_campaign",
          "lead_last_source": "$lead_last_source",
          "lead_last_campaign": "$lead_last_campaign",
          "masked_lead_primary_email": "$masked_lead_primary_email",
          "lead_primary_email": "$lead_primary_email",
          "masked_lead_primary_phone": "$masked_lead_primary_phone",
          "lead_primary_phone": "$lead_primary_phone",
          "phone_number": "$phone_number",
          "post_sales_name": "$post_sales_name",
          "post_sales_email": "$post_sales_email",
          "post_sales_phone": "$post_sales_phone",
          "url_shortener_link": "$url_shortener_link",
          "lead_otp_text": "$lead_otp_text",
          "sales_otp_text": "$sales_otp_text",
          "admin_name": "$admin_name",
          "client_billing_url": "$client_billing_url",
          "support_url": "$support_url",
          "support_phone_number": "$support_phone_number",
          "activity_created_at": "$activity_created_at",
          "work_completed": "$work_completed",
          "total_amount_demanded": "$total_amount_demanded",
          "due_date": "$due_date",
          "current_stage": "$current_stage",
          "receipt_amount": "$receipt_amount",
          "receipt_status": "$receipt_status",
          "receipt_payment_mode": "$receipt_payment_mode",
          "receipt_issuing_bank": "$receipt_issuing_bank",
          "receipt_issuing_bank_branch": "$receipt_issuing_bank_branch",
          "receipt_cheque_no": "$receipt_cheque_no",
          "receipt_accounting_date": "$receipt_accounting_date",
          "receipt_issued_date": "$receipt_issued_date",
          "google_now_tag": "$google_now_tag",
          "task_reminder_subject": "$task_reminder_subject",
          "task_assigned_subject": "$task_assigned_subject",
          "task_completed_subject": "$task_completed_subject",
          "property_types": "$property_types",
          "reassigned_by": "$reassigned_by",
          "lead_update_url": "$lead_update_url",
          "booking_detail_db_id": "$booking_detail_db_id",
          "masked_lead_secondary_emails": "$masked_lead_secondary_emails",
          "lead_secondary_emails": "$lead_secondary_emails",
          "masked_lead_secondary_phones": "$masked_lead_secondary_phones",
          "lead_secondary_phones": "$lead_secondary_phones",
          "gender": "$gender",
          "country": "$country",
          "salutation": "$salutation",
          "birthday": "$birthday",
          "designation": "$designation",
          "lead_db_id": "$lead_db_id",
          "lead_booking_update_url": "$lead_booking_update_url",
          "address1": "$address1",
          "address2": "$address2",
          "city": "$city",
          "state": "$state",
          "zip": "$zip_code",
          "country_code": "$country_code",
          "latest_campaign_id": "$latest_campaign_id",
          "latest_campaign_project_id": "$latest_campaign_project_id",
          "latest_campaign_project_name": "$latest_campaign_project_name"
          }`;

    return sellDoVariableJson;
  }

  // To pick random element from array
  pickRandomElementFromArray<T>(array: T[]): T {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  }

  // To generate random integer between min and max
  generateRandomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  // To generate random email
  generateRandomEmail(): string {
    return faker.internet.email().toLowerCase();
  }

  // To generate random phone number (India only - for backward compatibility)
  generateRandomPhoneNumber(): string {
    const prefixes = ["6", "7", "8", "9"];
    const prefix = faker.helpers.arrayElement(prefixes);
    return prefix + faker.string.numeric({ length: 9 }).trim();
  }

  // Helper function to validate phone number format
  // This validation ensures numbers match libphonenumber's expected patterns
  // Note: This is a basic validation. libphonenumber has additional checks
  // that verify numbers against actual number ranges, not just patterns.
  private validatePhoneNumber(countryCode: string, nationalNumber: string, expectedLength: number, validPrefixes: string[]): boolean {
    // Check length - must match exactly
    if (nationalNumber.length !== expectedLength) {
      return false;
    }
    
    // Check all characters are digits
    if (!/^\d+$/.test(nationalNumber)) {
      return false;
    }
    
    // Check if starts with valid prefix
    const hasValidPrefix = validPrefixes.some(prefix => nationalNumber.startsWith(prefix));
    if (!hasValidPrefix) {
      return false;
    }
    
    return true;
  }

  /**
   * Ruby phonelib (https://github.com/daddyz/phonelib) ships the same metadata as Google libphonenumber.
   * Relevant APIs:
   * - `Phonelib.valid?(e164)` / `phone.valid?` — "valid" patterns (stricter than `possible?`)
   * - `Phonelib.possible?` — length / loose patterns only
   * - `Phonelib.valid_for_country?(digits, 'US')` — ISO 3166-1 alpha-2 region
   * - `phone.types` — :mobile, :fixed_line, :fixed_or_mobile, etc. (Rails validator can restrict `types:`)
   *
   * This helper uses `libphonenumber-js/max` (full metadata) so checks track phonelib major-version data.
   * It enforces `valid?` plus `phone.country == region` (e.g. US vs CA for +1, RU vs KZ for +7).
   */
  private isValidE164ForPhonelibRegion(e164: string, region: CountryCode): boolean {
    if (!isValidPhoneNumber(e164)) {
      return false;
    }
    const parsed = parsePhoneNumber(e164);
    return parsed !== undefined && parsed.isValid() && parsed.country === region;
  }

  // To generate random phone number for specified countries with country name.
  // Returns {@link GeneratedPhoneWithCountry}: countryCode, national phoneNumber, countryName,
  // plus e164Display and fullPhoneNumber for callers that need a single string.
  //
  // CRITICAL: Output MUST satisfy Ruby phonelib the same way sell.do would:
  //   Phonelib.parse(phoneNumber).valid?  # => true
  //   Phonelib.parse(phoneNumber).country # => expected ISO region (e.g. "US", "SG")
  //
  // We generate national significant number candidates, build compact E.164 (+CC + national, no spaces),
  // then accept only if `isValidE164ForPhonelibRegion` passes (libphonenumber "valid" + region match).
  //
  // WARNING: Test data only; may not be assignable in real networks.
  async generateRandomPhoneNumberWithCountry(): Promise<GeneratedPhoneWithCountry> {
    if (properties.getNumberFromServer) {
      return await this.fetchRandomPhoneFromPhonelibServer();
    }

    type CountryCfg = {
      countryName: string;
      region: CountryCode;
      callingCode: string;
      pattern: () => string;
    };

    const isNanpN11 = (threeDigits: string) => threeDigits.length === 3 && threeDigits[1] === "1" && threeDigits[2] === "1";

    /** NPAs assigned to Canada so +1 parses as `CA` in phonelib (not `US`). */
    const canadianNpa = () =>
      faker.helpers.arrayElement([
        "204", "226", "236", "249", "250", "289", "306", "343", "365", "367", "368", "382", "403", "416", "418", "428",
        "431", "437", "438", "450", "468", "474", "506", "514", "519", "548", "579", "581", "584", "587", "604", "613",
        "639", "647", "672", "683", "705", "709", "742", "753", "778", "780", "782", "807", "819", "825", "867", "873",
        "879", "902", "905", "942",
      ]);

    const iranMobilePrefixes = [
      "910", "911", "912", "913", "914", "915", "916", "917", "918", "919", "920", "921", "922", "923", "924", "925",
      "926", "927", "928", "929", "930", "931", "932", "933", "934", "935", "936", "937", "938", "939", "990", "991",
      "992", "993", "994", "995", "996", "997", "998", "999",
    ];

    const countryConfigs: CountryCfg[] = [
      {
        countryName: "United States",
        region: "US",
        callingCode: "1",
        pattern: () => {
          let areaCode: string;
          let exchange: string;
          do {
            areaCode = this.generateValidNPANXX();
          } while (isNanpN11(areaCode));
          do {
            exchange = this.generateValidNPANXX();
          } while (isNanpN11(exchange));
          return areaCode + exchange + faker.string.numeric({ length: 4 });
        },
      },
      {
        countryName: "Japan",
        region: "JP",
        callingCode: "81",
        pattern: () => {
          const prefix = faker.helpers.arrayElement(["70", "80", "90"] as const);
          return prefix + faker.string.numeric({ length: 8 });
        },
      },
      {
        countryName: "United Arab Emirates",
        region: "AE",
        callingCode: "971",
        pattern: () => {
          const prefix = faker.helpers.arrayElement(["50", "52", "54", "55", "56", "58"] as const);
          return prefix + faker.string.numeric({ length: 7 });
        },
      },
      {
        countryName: "Qatar",
        region: "QA",
        callingCode: "974",
        pattern: () => {
          const prefix = faker.helpers.arrayElement(["3", "5", "6", "7"] as const);
          return prefix + faker.string.numeric({ length: 7 });
        },
      },
      {
        countryName: "Singapore",
        region: "SG",
        callingCode: "65",
        pattern: () => {
          const firstDigit = faker.helpers.arrayElement(["8", "9"] as const);
          if (firstDigit === "8") {
            return "8" + faker.string.numeric({ length: 7 });
          }
          const secondDigit = faker.helpers.arrayElement(["0", "1", "2", "3", "4", "5", "6", "7", "8"] as const);
          return "9" + secondDigit + faker.string.numeric({ length: 6 });
        },
      },
      {
        countryName: "United Kingdom",
        region: "GB",
        callingCode: "44",
        pattern: () => "7" + faker.string.numeric({ length: 9 }),
      },
      {
        countryName: "Germany",
        region: "DE",
        callingCode: "49",
        pattern: () => {
          const prefix = faker.helpers.arrayElement(["15", "16", "17"] as const);
          const suffixLen = faker.helpers.arrayElement([8, 9] as const);
          return prefix + faker.string.numeric({ length: suffixLen });
        },
      },
      {
        countryName: "Canada",
        region: "CA",
        callingCode: "1",
        pattern: () => {
          const areaCode = canadianNpa();
          let exchange: string;
          do {
            exchange = this.generateValidNPANXX();
          } while (isNanpN11(exchange));
          return areaCode + exchange + faker.string.numeric({ length: 4 });
        },
      },
      {
        countryName: "Russia",
        region: "RU",
        callingCode: "7",
        pattern: () => "9" + faker.string.numeric({ length: 9 }),
      },
      {
        countryName: "Iraq",
        region: "IQ",
        callingCode: "964",
        pattern: () => "7" + faker.string.numeric({ length: 9 }),
      },
      {
        countryName: "Iran",
        region: "IR",
        callingCode: "98",
        pattern: () => faker.helpers.arrayElement(iranMobilePrefixes) + faker.string.numeric({ length: 7 }),
      },
      {
        countryName: "Bahrain",
        region: "BH",
        callingCode: "973",
        pattern: () => "3" + faker.string.numeric({ length: 7 }),
      },
    ];

    const selectedConfig = faker.helpers.arrayElement(countryConfigs);

    let nationalNumber = "";
    const maxAttempts = 96;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      nationalNumber = selectedConfig.pattern();
      const e164Display = `+${selectedConfig.callingCode} ${nationalNumber}`;
      const fullPhoneNumber = `${selectedConfig.callingCode}${nationalNumber}`;
      await this.print(
        `National: ${nationalNumber} (${selectedConfig.countryName}) e164Display: ${e164Display} fullPhoneNumber: ${fullPhoneNumber}`,
      );
      if (this.isValidE164ForPhonelibRegion(e164Display, selectedConfig.region)) {
        return {
          countryCode: selectedConfig.callingCode,
          phoneNumber: nationalNumber,
          countryName: selectedConfig.countryName,
          e164Display,
          fullPhoneNumber,
        };
      }
    }

    throw new Error(
      `Failed to generate phonelib-valid E.164 for ${selectedConfig.countryName} (${selectedConfig.region}) after ${maxAttempts} attempts. Last national: ${nationalNumber}`,
    );
  }

  /**
   * GET https://phonelib-production.up.railway.app/api/v1/phones/random
   * Requires `properties.getNumberFromServer` and `properties.Phonelib_Random_Phone_Api_Key`.
   */
  private async fetchRandomPhoneFromPhonelibServer(): Promise<GeneratedPhoneWithCountry> {
    const apiKey = properties.Phonelib_Random_Phone_Api_Key?.trim();
    if (!apiKey) {
      throw new Error(
        "properties.getNumberFromServer is true but properties.Phonelib_Random_Phone_Api_Key is missing or empty",
      );
    }

    const url = "https://phonelib-production.up.railway.app/api/v1/phones/random";
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Api-Key": apiKey,
      },
    });

    const rawText = await response.text();
    if (!response.ok) {
      throw new Error(`Phonelib random phone API HTTP ${response.status}: ${rawText}`);
    }

    let body: {
      success?: boolean;
      data?: { phone_number?: string; country_code?: string; country_name?: string };
    };
    try {
      body = JSON.parse(rawText) as typeof body;
    } catch {
      throw new Error(`Phonelib random phone API returned non-JSON: ${rawText.slice(0, 500)}`);
    }

    if (!body.success || !body.data) {
      throw new Error(`Phonelib random phone API unsuccessful: ${rawText}`);
    }

    const phone_number = body.data.phone_number?.trim() ?? "";
    const country_code = body.data.country_code?.trim() ?? "";
    const country_name = body.data.country_name?.trim() ?? "";

    if (!phone_number || !country_code) {
      throw new Error(`Phonelib random phone API missing phone_number or country_code: ${rawText}`);
    }

    const e164Display = `+${country_code} ${phone_number}`;
    const fullPhoneNumber = `${country_code} ${phone_number}`;

    await this.print(`Phonelib random phone API: ${country_name} ${e164Display}`);

    return {
      countryCode: country_code,
      phoneNumber: phone_number,
      countryName: country_name,
      e164Display,
      fullPhoneNumber,
    };
  }

  // Helper function to generate valid NPA/NXX code (for US/Canada)
  // Format: First digit 2-9, Second digit 0-8, Third digit 0-9
  private generateValidNPANXX(): string {
    const first = Math.floor(Math.random() * 8) + 2; // 2-9
    const second = Math.floor(Math.random() * 9); // 0-8 (cannot be 9)
    const third = Math.floor(Math.random() * 10); // 0-9
    return `${first}${second}${third}`;
  }

  // To generate random phone number for any country (valid for phonelib)
  async generateRandomPhoneNumberByCountry(country: Country): Promise<string> {
    const countryPhonePatterns: Record<Country, { countryCode: string; pattern: () => string }> = {
      [Country.India]: {
        countryCode: "91",
        pattern: () => {
          // India: 10 digits, mobile starts with 6, 7, 8, or 9
          const prefixes = ["6", "7", "8", "9"];
          const prefix = faker.helpers.arrayElement(prefixes);
          return prefix + faker.string.numeric({ length: 9 });
        },
      },
      [Country.UnitedStates]: {
        countryCode: "1",
        pattern: () => {
          // US: 10 digits
          // Area code (NPA): First digit 2-9, Second digit 0-8, Third digit 0-9
          // Exchange code (NXX): First digit 2-9, Second digit 0-8, Third digit 0-9
          // Subscriber: 4 digits (0000-9999)
          const areaCode = this.generateValidNPANXX();
          const exchange = this.generateValidNPANXX();
          const subscriber = faker.string.numeric({ length: 4 });
          return areaCode + exchange + subscriber;
        },
      },
      [Country.UnitedKingdom]: {
        countryCode: "44",
        pattern: () => {
          // UK: 10 digits, mobile starts with 7, followed by 9 digits
          return "7" + faker.string.numeric({ length: 9 });
        },
      },
      [Country.Canada]: {
        countryCode: "1",
        pattern: () => {
          // Canada: Same format as US
          // Area code (NPA): First digit 2-9, Second digit 0-8, Third digit 0-9
          // Exchange code (NXX): First digit 2-9, Second digit 0-8, Third digit 0-9
          // Subscriber: 4 digits (0000-9999)
          const areaCode = this.generateValidNPANXX();
          const exchange = this.generateValidNPANXX();
          const subscriber = faker.string.numeric({ length: 4 });
          return areaCode + exchange + subscriber;
        },
      },
      [Country.Australia]: {
        countryCode: "61",
        pattern: () => {
          // Australia: 9 digits, mobile starts with 4 (with leading 0 removed for international format)
          return "4" + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Germany]: {
        countryCode: "49",
        pattern: () => {
          // Germany: 10-11 digits, mobile starts with 15, 16, or 17
          const mobilePrefixes = ["15", "16", "17"];
          const prefix = faker.helpers.arrayElement(mobilePrefixes);
          return prefix + faker.string.numeric({ length: 8 });
        },
      },
      [Country.France]: {
        countryCode: "33",
        pattern: () => {
          // France: 9 digits, mobile starts with 6 or 7
          const prefixes = ["6", "7"];
          const prefix = faker.helpers.arrayElement(prefixes);
          return prefix + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Spain]: {
        countryCode: "34",
        pattern: () => {
          // Spain: 9 digits, mobile starts with 6 or 7
          const prefixes = ["6", "7"];
          const prefix = faker.helpers.arrayElement(prefixes);
          return prefix + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Italy]: {
        countryCode: "39",
        pattern: () => {
          // Italy: 9-10 digits, mobile starts with 3
          return "3" + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Netherlands]: {
        countryCode: "31",
        pattern: () => {
          // Netherlands: 9 digits, mobile starts with 6
          return "6" + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Brazil]: {
        countryCode: "55",
        pattern: () => {
          // Brazil: 10-11 digits, mobile starts with 9 in area code + 9
          const areaCode = faker.helpers.arrayElement(["11", "21", "31", "41", "47", "48", "51", "61", "71", "81", "85", "92"]);
          return areaCode + "9" + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Mexico]: {
        countryCode: "52",
        pattern: () => {
          // Mexico: 10 digits, mobile starts with area code + 1
          const areaCodeFirst = Math.floor(Math.random() * 9) + 1; // 1-9
          const areaCode = areaCodeFirst + faker.string.numeric({ length: 1 });
          return areaCode + "1" + faker.string.numeric({ length: 7 });
        },
      },
      [Country.Japan]: {
        countryCode: "81",
        pattern: () => {
          // Japan: 10 digits, mobile starts with 90 or 80
          const prefixes = ["90", "80"];
          const prefix = faker.helpers.arrayElement(prefixes);
          return prefix + faker.string.numeric({ length: 8 });
        },
      },
      [Country.China]: {
        countryCode: "86",
        pattern: () => {
          // China: 11 digits, mobile starts with 1
          return "1" + faker.string.numeric({ length: 10 });
        },
      },
      [Country.Russia]: {
        countryCode: "7",
        pattern: () => {
          // Russia: 10 digits, mobile starts with 9
          return "9" + faker.string.numeric({ length: 9 });
        },
      },
      [Country.SouthKorea]: {
        countryCode: "82",
        pattern: () => {
          // South Korea: 9-10 digits, mobile starts with 10
          return "10" + faker.string.numeric({ length: 8 });
        },
      },
      [Country.SaudiArabia]: {
        countryCode: "966",
        pattern: () => {
          // Saudi Arabia: 9 digits, mobile starts with 5
          return "5" + faker.string.numeric({ length: 8 });
        },
      },
      [Country.UnitedArabEmirates]: {
        countryCode: "971",
        pattern: () => {
          // UAE: 9 digits, mobile starts with 5
          return "5" + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Singapore]: {
        countryCode: "65",
        pattern: () => {
          // Singapore: 8 digits, mobile starts with 8 or 9
          const prefixes = ["8", "9"];
          const prefix = faker.helpers.arrayElement(prefixes);
          return prefix + faker.string.numeric({ length: 7 });
        },
      },
      [Country.Malaysia]: {
        countryCode: "60",
        pattern: () => {
          // Malaysia: 9-10 digits, mobile starts with 1
          return "1" + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Thailand]: {
        countryCode: "66",
        pattern: () => {
          // Thailand: 9 digits, mobile starts with 6, 8, or 9
          const prefixes = ["6", "8", "9"];
          const prefix = faker.helpers.arrayElement(prefixes);
          return prefix + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Indonesia]: {
        countryCode: "62",
        pattern: () => {
          // Indonesia: 9-11 digits, mobile starts with 8
          return "8" + faker.string.numeric({ length: 9 });
        },
      },
      [Country.Philippines]: {
        countryCode: "63",
        pattern: () => {
          // Philippines: 10 digits, mobile starts with 9
          return "9" + faker.string.numeric({ length: 9 });
        },
      },
      [Country.Vietnam]: {
        countryCode: "84",
        pattern: () => {
          // Vietnam: 9-10 digits, mobile starts with 9, 3, or 7
          const prefixes = ["9", "3", "7"];
          const prefix = faker.helpers.arrayElement(prefixes);
          return prefix + faker.string.numeric({ length: 8 });
        },
      },
      [Country.SouthAfrica]: {
        countryCode: "27",
        pattern: () => {
          // South Africa: 9 digits, mobile starts with 6, 7, or 8
          const prefixes = ["6", "7", "8"];
          const prefix = faker.helpers.arrayElement(prefixes);
          return prefix + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Egypt]: {
        countryCode: "20",
        pattern: () => {
          // Egypt: 10 digits, mobile starts with 1
          return "1" + faker.string.numeric({ length: 9 });
        },
      },
      [Country.Nigeria]: {
        countryCode: "234",
        pattern: () => {
          // Nigeria: 10 digits, mobile starts with 7, 8, or 9
          const prefixes = ["7", "8", "9"];
          const prefix = faker.helpers.arrayElement(prefixes);
          return prefix + faker.string.numeric({ length: 9 });
        },
      },
      [Country.Kenya]: {
        countryCode: "254",
        pattern: () => {
          // Kenya: 9 digits, mobile starts with 7
          return "7" + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Argentina]: {
        countryCode: "54",
        pattern: () => {
          // Argentina: 10 digits, mobile starts with 9
          return "9" + faker.string.numeric({ length: 9 });
        },
      },
      [Country.Chile]: {
        countryCode: "56",
        pattern: () => {
          // Chile: 9 digits, mobile starts with 9
          return "9" + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Colombia]: {
        countryCode: "57",
        pattern: () => {
          // Colombia: 10 digits, mobile starts with 3
          return "3" + faker.string.numeric({ length: 9 });
        },
      },
      [Country.Peru]: {
        countryCode: "51",
        pattern: () => {
          // Peru: 9 digits, mobile starts with 9
          return "9" + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Turkey]: {
        countryCode: "90",
        pattern: () => {
          // Turkey: 10 digits, mobile starts with 5
          return "5" + faker.string.numeric({ length: 9 });
        },
      },
      [Country.Poland]: {
        countryCode: "48",
        pattern: () => {
          // Poland: 9 digits, mobile starts with 5, 6, 7, or 8
          const prefixes = ["5", "6", "7", "8"];
          const prefix = faker.helpers.arrayElement(prefixes);
          return prefix + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Sweden]: {
        countryCode: "46",
        pattern: () => {
          // Sweden: 9 digits, mobile starts with 7
          return "7" + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Norway]: {
        countryCode: "47",
        pattern: () => {
          // Norway: 8 digits, mobile starts with 4, 9, or 5
          const prefixes = ["4", "9", "5"];
          const prefix = faker.helpers.arrayElement(prefixes);
          return prefix + faker.string.numeric({ length: 7 });
        },
      },
      [Country.Denmark]: {
        countryCode: "45",
        pattern: () => {
          // Denmark: 8 digits
          return faker.string.numeric({ length: 8 });
        },
      },
      [Country.Finland]: {
        countryCode: "358",
        pattern: () => {
          // Finland: 9 digits, mobile starts with 4 or 5
          const prefixes = ["4", "5"];
          const prefix = faker.helpers.arrayElement(prefixes);
          return prefix + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Belgium]: {
        countryCode: "32",
        pattern: () => {
          // Belgium: 9 digits, mobile starts with 4
          return "4" + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Switzerland]: {
        countryCode: "41",
        pattern: () => {
          // Switzerland: 9 digits, mobile starts with 7
          return "7" + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Austria]: {
        countryCode: "43",
        pattern: () => {
          // Austria: 10-13 digits, mobile starts with 6
          return "6" + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Portugal]: {
        countryCode: "351",
        pattern: () => {
          // Portugal: 9 digits, mobile starts with 9
          return "9" + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Greece]: {
        countryCode: "30",
        pattern: () => {
          // Greece: 10 digits, mobile starts with 6
          return "6" + faker.string.numeric({ length: 9 });
        },
      },
      [Country.Ireland]: {
        countryCode: "353",
        pattern: () => {
          // Ireland: 9 digits, mobile starts with 8
          return "8" + faker.string.numeric({ length: 8 });
        },
      },
      [Country.NewZealand]: {
        countryCode: "64",
        pattern: () => {
          // New Zealand: 8-9 digits, mobile starts with 2
          return "2" + faker.string.numeric({ length: 7 });
        },
      },
      [Country.Israel]: {
        countryCode: "972",
        pattern: () => {
          // Israel: 9 digits, mobile starts with 5
          return "5" + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Pakistan]: {
        countryCode: "92",
        pattern: () => {
          // Pakistan: 10 digits, mobile starts with 3
          return "3" + faker.string.numeric({ length: 9 });
        },
      },
      [Country.Bangladesh]: {
        countryCode: "880",
        pattern: () => {
          // Bangladesh: 10 digits, mobile starts with 1
          return "1" + faker.string.numeric({ length: 9 });
        },
      },
      [Country.SriLanka]: {
        countryCode: "94",
        pattern: () => {
          // Sri Lanka: 9 digits, mobile starts with 7
          return "7" + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Nepal]: {
        countryCode: "977",
        pattern: () => {
          // Nepal: 10 digits, mobile starts with 9
          return "9" + faker.string.numeric({ length: 9 });
        },
      },
      [Country.Afghanistan]: {
        countryCode: "93",
        pattern: () => {
          // Afghanistan: 9 digits, mobile starts with 7
          return "7" + faker.string.numeric({ length: 8 });
        },
      },
      [Country.Iran]: {
        countryCode: "98",
        pattern: () => {
          // Iran: 10 digits, mobile starts with 9
          return "9" + faker.string.numeric({ length: 9 });
        },
      },
      [Country.Iraq]: {
        countryCode: "964",
        pattern: () => {
          // Iraq: 10 digits, mobile starts with 7
          return "7" + faker.string.numeric({ length: 9 });
        },
      },
    };

    const countryPattern = countryPhonePatterns[country];
    if (!countryPattern) {
      throw new Error(`Phone number pattern not defined for country: ${country}`);
    }

    const nationalNumber = countryPattern.pattern();
    // Return in format: +<countryCode> <Number> (e.g., +91 9900332212)
    return `+${countryPattern.countryCode} ${nationalNumber}`;
  }

  // To generate random number with specified digits (doesn't start with zero)
  generateRandomNumber(digits: number): string {
    if (digits <= 0) {
      throw new Error("Number of digits must be greater than 0");
    }
    
    // First digit should be 1-9 (not zero)
    const firstDigit = Math.floor(Math.random() * 9) + 1;
    
    // Remaining digits can be 0-9
    let remainingDigits = "";
    for (let i = 1; i < digits; i++) {
      remainingDigits += Math.floor(Math.random() * 10);
    }
    
    return firstDigit + remainingDigits;
  }

  // To generate random string
  generateRandomString(
    length: number = 10,
    options?: {
      casing?: "lower" | "upper" | "mixed";
      includeNumbers?: boolean;
      includeSpecialChars?: boolean;
    },
  ): string {
    let chars = "abcdefghijklmnopqrstuvwxyz";

    if (options?.casing === "upper") {
      chars = chars.toUpperCase();
    } else if (options?.casing === "mixed") {
      chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }

    if (options?.includeNumbers) {
      chars += "0123456789";
    }

    if (options?.includeSpecialChars) {
      chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    }

    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  replaceFirstDigits(phone: string | number): string {
    const phoneStr = String(phone);
    if (phoneStr.length !== 10) {
        throw new Error("Phone number must be exactly 10 digits");
    }
    return "12345" + phoneStr.slice(5);
}

  // To calculate future date based on time unit and amount
  calculateFutureDate(
    timeUnit: AheadOf,
    amount: number,
    format: string,
  ): string {
    const now = DateTime.now().setZone("Asia/Kolkata");
    let futureDate: DateTime;

    switch (timeUnit) {
      case AheadOf.Day:
        futureDate = now.plus({ days: amount });
        break;
      case AheadOf.Hour:
        futureDate = now.plus({ hours: amount });
        break;
      case AheadOf.Minute:
        futureDate = now.plus({ minutes: amount });
        break;
      case AheadOf.Second:
        futureDate = now.plus({ seconds: amount });
        break;
      case AheadOf.Year:
        futureDate = now.plus({ years: amount });
        break;
      default:
        futureDate = now;
    }

    return futureDate.toFormat(format);
  }

  calculateFutureDateWithAdjustments(
    adjustments: TimeAdjustments,
    format: string
  ): string {
    const now = DateTime.now().setZone("Asia/Kolkata");
  
    // Luxon .plus() can take an object with all adjustments at once
    const futureDate = now.plus({
      years: adjustments.years ?? 0,
      months: adjustments.months ?? 0,
      days: adjustments.days ?? 0,
      hours: adjustments.hours ?? 0,
      minutes: adjustments.minutes ?? 0,
      seconds: adjustments.seconds ?? 0,
    });
  
    return futureDate.toFormat(format);
  }

  getCurrentDate(format: string): string {
    const now = DateTime.now().setZone("Asia/Kolkata");
    return now.toFormat(format);
  }

  getCurrentEpochMs(): number {
    return DateTime.now().setZone("Asia/Kolkata").toMillis();
  }

  // To remove files by keyword
  async removeFilesByKeyword(folderPath: string, keyword: string): Promise<void> {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      return;
    }

    const files = fs.readdirSync(folderPath);
    for (const file of files) {
      if (file.toLowerCase().includes(keyword.toLowerCase())) {
        fs.unlinkSync(path.join(folderPath, file));
      }
    }
  }

  // To create directory if not exists
  async createDirectoryIfNotExists(dirPath: string): Promise<void> {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      //console.log(`Directory created: ${dirPath}`);
    } else {
      //console.log(`Directory already exists: ${dirPath}`);
    }
  }

  // To generate excel file
  async generateExcelFile(fileFor: string, importLocation: string, sheetName: string = "Sheet1"): Promise<string> {
    this.createDirectoryIfNotExists(importLocation);
    const dirPath = path.join(process.cwd(), importLocation);
    //this.removeFilesByKeyword(dirPath, fileFor);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const fileName = `${fileFor} ${this.generateRandomString(10)}.xls`;
    const filePath = path.join(dirPath, fileName);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([[]]); // Create empty sheet
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    XLSX.writeFile(wb, filePath, { bookType: "xls" });

    return Promise.resolve(filePath);
  }

  // To ensure directory exists
  async ensureDirectoryExists(dirPath: string): Promise<void> {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Directory created: ${dirPath}`);
    } else {
      console.log(`Directory already exists: ${dirPath}`);
    }
  }

  async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async waitUntilDurationPassed(durationMs: number): Promise<void> {
    const start = Date.now(); // Get current timestamp in milliseconds
  
    while (Date.now() - start < durationMs) {
      // Busy-wait loop until duration has passed
    }
  }

  async loopWait(page: Page, showLoadingBar: boolean): Promise<void> {
    await this.waitTillFullPageLoad(page);
    let counter = 0;
    const startTime = Date.now();
  
    if (showLoadingBar) {
      process.stdout.write("Waiting for page to be ready: ");
    }
  
    while (true) {
      const isReady = await page.evaluate(() => {
        return (
          document.readyState === 'complete' &&
          (!('jQuery' in window) || (window as any).jQuery.active === 0)
        );
      });
  
      if (isReady) {
        if (showLoadingBar) {
          const endTime = Date.now();
          const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);
          console.log(` ✅ Ready! ⏱️ ${durationSeconds} seconds`);
        }
        break;
      }
  
      if (showLoadingBar) {
        process.stdout.write("█");
        if (counter % 100 === 0 && counter !== 0) {
          process.stdout.write("\n");
        }
      }
  
      await this.sleep(100);
      counter++;
    }
  }
  
   async waitTillFullPageLoad(page: Page): Promise<void> {
    await this.waitUntilDurationPassed(1000);
    try {
      await page.waitForLoadState('networkidle', { timeout: 90 * 1000 });
    } catch (error) {
      await this.loopWait(page, false);
    }
    try {
      await page.waitForLoadState('domcontentloaded', { timeout: 90 * 1000 });
    } catch (error) {
      await this.loopWait(page, false);
    }

    try {
     if(await page.locator("div.block_ui #dot1").isVisible()){
       await this.highlightElement(page, page.locator("div.block_ui .tc.loading_screen_bars"));
       await page.locator("div.block_ui #dot1").waitFor({ state: "hidden" });
     }
    } catch (error) {
      
    }
  }

  async jsClick(page: Page, locator: Locator) {

    // Wait until the element is visible & enabled
    await locator.waitFor({ state: 'visible', timeout: 10000 });

    // Add a small async pause like in your original setTimeout
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));

    // Click using JS execution
    await page.evaluate((el: HTMLElement | SVGElement | null) => {
        if (el && 'click' in el) {
            (el as HTMLElement).click();
        }
    }, await locator.elementHandle());
  }

  async highlightElement(page: Page, locator: Locator) {
    await page.evaluate((el: HTMLElement | SVGElement | null) => {
        if (el && 'style' in el) {
            const originalStyle = (el as HTMLElement).style.border;
            (el as HTMLElement).style.border = '3px solid green';
            setTimeout(() => {
                (el as HTMLElement).style.border = originalStyle;
            }, 1000);
        }
    }, await locator.elementHandle());
 }

  async normalizeFilePath(filePath: string): Promise<string> {
    // Check if running on Windows
    if (process.platform === "win32") {
      // Convert all "\" to "\\"
      return filePath.replace(/\\/g, "\\\\");
    }
    // For Linux/macOS just return the normalized path
    return path.normalize(filePath);
  }

  /**
   * Safely deletes a single file at the given path (cross-platform: Windows, macOS, Linux).
   * - If `properties.delete_files` is false, returns false immediately (no deletion).
   * - Trims the path; no-op if null, undefined, empty, or non-string.
   * - Resolves relative paths with `path.resolve` against `process.cwd()`.
   * - Only removes files or symbolic links to files; never deletes directories.
   * - Missing file (ENOENT) is treated as success (idempotent cleanup).
   * - On permission or other errors, logs via `print` and returns false — does not throw (safe for test teardown).
   * @returns true if a file was removed, false if skipped or already absent
   */
  private async safeDeleteFile(filePath: string | null | undefined): Promise<boolean> {
    if (!properties.delete_files) {
      return false;
    }
    if (filePath == null || typeof filePath !== "string") {
      return false;
    }
    const trimmed = filePath.trim();
    if (!trimmed) {
      return false;
    }

    let resolved: string;
    try {
      resolved = path.resolve(trimmed);
    } catch {
      await this.print(`[safeDeleteFile] invalid path: ${String(filePath)}`);
      return false;
    }

    try {
      const stat = await fs.promises.lstat(resolved);
      if (stat.isDirectory()) {
        await this.print(`[safeDeleteFile] skipped (not a file): ${resolved}`);
        return false;
      }
      await fs.promises.unlink(resolved);
      return true;
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? (err as NodeJS.ErrnoException).code : undefined;
      if (code === "ENOENT") {
        return false;
      }
      await this.print(`[safeDeleteFile] failed: ${resolved}`, err);
      return false;
    }
  }

  /**
   * Deletes multiple files with the same rules as {@link safeDeleteFile} (including `properties.delete_files`).
   * Duplicate paths are de-duplicated; order is preserved for first occurrence.
   */
  async safeDeleteFiles(filePaths: (string | null | undefined)[]): Promise<void> {
    if (!properties.delete_files) {
      return;
    }
    const seen = new Set<string>();
    for (const p of filePaths) {
      if (p == null || typeof p !== "string" || !p.trim()) {
        continue;
      }
      const resolved = path.resolve(p.trim());
      if (seen.has(resolved)) {
        continue;
      }
      seen.add(resolved);
      await this.safeDeleteFile(resolved);
    }
    // Compose a detailed file deletion report with numbering, property flag, and actual deletion check
    let reportLines: string[] = [];
    let index = 1;
    for (const p of filePaths) {
      if (typeof p !== "string" || !p.trim()) {
        reportLines.push(`${index}) [SKIPPED] (Empty or invalid path)`);
        index++;
        continue;
      }
      const resolved = path.resolve(p.trim());
      // If file was duplicated, only first occurrence processed
      const deletedPerProperty = properties.delete_files ? "YES" : "NO";
      let actuallyDeleted = "NO";
      try {
        // Check if file exists now (after attempted deletion)
        await fs.promises.access(resolved, fs.constants.F_OK);
        actuallyDeleted = "NO";
      } catch {
        // File no longer exists
        actuallyDeleted = "YES";
      }
      reportLines.push(`${index}) ${path.basename(resolved)} | property.delete_files: ${deletedPerProperty} | actually deleted: ${actuallyDeleted}`);
      index++;
    }
    await this.print("File Deletion Report:\n" + reportLines.join("\n"));
  }

  customSubstring(input: string, start: number, length: number): string {
    // Handle invalid start index
    if (start < 0 || start >= input.length) {
      console.error("Enter Valid Start Index");
    }

    // Calculate the end index safely
    const end = Math.min(start + length, input.length);

    return input.substring(start, end);
  }

  async getTimeDifferenceInSeconds(oldDate: string, newDate: string): Promise<number> {
    const date1 = new Date(oldDate);
    const date2 = new Date(newDate);
  
    // Difference in milliseconds
    const diffMs = date2.getTime() - date1.getTime();
  
    // Convert to seconds
    return Math.floor(diffMs / 1000);
  }

  /**
   * Converts 12-hour time format to 24-hour format
   * @param timeString - Time string in format "HH:MM AM/PM" (e.g., "11:55 PM")
   * @returns Object with hours and minutes in 24-hour format
   */
  async convertTo24HourFormat(timeString: string): Promise<{ hours: number; minutes: number }> {
    const [time, modifier] = timeString.trim().split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    
    let convertedHours = hours;
    
    if (modifier.toUpperCase() === "PM" && hours !== 12) {
      convertedHours = hours + 12;
    } else if (modifier.toUpperCase() === "AM" && hours === 12) {
      convertedHours = 0;
    }
    
    return { hours: convertedHours, minutes };
  }

  /**
   * Calculates time difference between two time strings in minutes
   * @param startTimeString - Start time in format "HH:MM AM/PM" (e.g., "11:55 PM")
   * @param endTimeString - End time in format "HH:MM AM/PM" (e.g., "12:30 AM")
   * @returns Time difference in minutes
   */
  async calculateTimeDifferenceInMinutes(startTimeString: string, endTimeString: string): Promise<number> {
    const startTime = await this.convertTo24HourFormat(startTimeString);
    const endTime = await this.convertTo24HourFormat(endTimeString);
    
    const startTotalMinutes = startTime.hours * 60 + startTime.minutes;
    const endTotalMinutes = endTime.hours * 60 + endTime.minutes;
    
    return endTotalMinutes - startTotalMinutes;
  }

  /**
   * Calculates time difference between two time strings in minutes (alternative method)
   * This method handles the case where time strings might be undefined or null
   * @param startTimeString - Start time in format "HH:MM AM/PM" or null/undefined
   * @param endTimeString - End time in format "HH:MM AM/PM" or null/undefined
   * @returns Time difference in minutes, or 0 if either time is invalid
   */
  async calculateTimeDifferenceSafely(startTimeString: string | null | undefined, endTimeString: string | null | undefined): Promise<number> {
    if (!startTimeString || !endTimeString) {
      return 0;
    }
    
    return await this.calculateTimeDifferenceInMinutes(startTimeString, endTimeString);
  }

   async formatDateToIST(dateString: string): Promise<string> {
    const date = new Date(dateString);
  
    // Convert to IST
    const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
  
    const day = String(istDate.getUTCDate()).padStart(2, '0');
    const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const year = istDate.getUTCFullYear();
  
    const hours = String(istDate.getUTCHours()).padStart(2, '0');
    const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(istDate.getUTCSeconds()).padStart(2, '0');
  
    return `${day}/${month}/${year}-${hours}:${minutes}:${seconds}`;
  }

  async getValueByIndex(input: string, index: number): Promise<string | null> {
    if (!input) return String("");

    const values = input.split(",").map(v => v.trim());

    if (index < 0 || index >= values.length) {
      return String("");
    }

    return String(values[index]?.trim() || null);
  }

}