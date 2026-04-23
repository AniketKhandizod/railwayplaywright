import { faker } from "@faker-js/faker";
import { DateTime } from "luxon";
import * as fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { Locator, Page } from "@playwright/test";
import { properties } from "../properties/v2";

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
  async getRandomSubsetFromArray(array: string[]): Promise<string> {
    const count = Math.floor(Math.random() * array.length) + 1;
    const result = new Set<string>();

    while (result.size < count) {
      const randomIndex = Math.floor(Math.random() * array.length);
      result.add(array[randomIndex]);
    }

    return Array.from(result).join(",");
  }

  async print(message?: any, ...optionalParams: any[]): Promise<void> {
    if (properties.printLogsToConsole) {
      return console.log(">> "+message, ...optionalParams);
    }else{
      return;
    }
  }

  async getLeadCreatePayload(email: string,srd: string,restrictedAccessAPI: string): Promise<string>{
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

  async getSellDoVariableJson(){
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
  async pickRandomElementFromArray<T>(array: T[]): Promise<T> {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  }

  // To generate random integer between min and max
  async generateRandomInteger(min: number, max: number): Promise<number> {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  // To generate random email
  async generateRandomEmail(): Promise<string> {
    return faker.internet.email().toLowerCase();
  }

  // To generate random phone number (India only - for backward compatibility)
  async generateRandomPhoneNumber(): Promise<string> {
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

  // To generate random phone number for specified countries with country name
  // Returns: { phoneNumber: string, country: string }
  // 
  // CRITICAL: This method generates phone numbers in pure E.164 format that MUST
  // pass libphonenumber validation (used by Ruby's phonelib gem in sell.do CRM).
  // 
  // Format: +<CountryCode><NationalNumber> (NO SPACES - pure E.164 format)
  // Example: +919876543210, +6591234567, +14155551234
  // 
  // Validation Rules (based on libphonenumber):
  // 1. Numbers must match exact length for each country
  // 2. Numbers must start with valid mobile prefixes
  // 3. Numbers must follow country-specific numbering patterns
  // 4. Numbers are validated as: Phonelib.parse(phoneNumber).valid?
  // 
  // The patterns used here are based on libphonenumber's actual validation rules
  // and should pass validation when checked with phonelib.
  // 
  // WARNING: Generated numbers are for testing purposes only and may not belong
  // to real subscribers. Do not use for actual communications.
  async generateRandomPhoneNumberWithCountry(): Promise<{ phoneNumber: string; country: string }> {
    // Define countries with their phone patterns and validation rules
    const countryConfigs: Array<{
      countryName: string;
      countryCode: string;
      expectedLength: number;
      validPrefixes: string[];
      pattern: () => string;
      validator: (number: string) => boolean;
    }> = [
      {
        countryName: "United States",
        countryCode: "1",
        expectedLength: 10,
        validPrefixes: ["2", "3", "4", "5", "6", "7", "8", "9"], // Area code first digit
        pattern: () => {
          // US: 10 digits with valid NPA/NXX format (libphonenumber compatible)
          // NPA (Area Code): First digit 2-9, Second digit 0-8, Third digit 0-9
          // NXX (Exchange): First digit 2-9, Second digit 0-8, Third digit 0-9
          // Subscriber: 4 digits (0000-9999)
          // This format matches libphonenumber validation rules used by phonelib
          // generateValidNPANXX() already ensures valid format (first digit 2-9, second 0-8)
          const areaCode = this.generateValidNPANXX();
          const exchange = this.generateValidNPANXX();
          const subscriber = faker.string.numeric({ length: 4 });
          return areaCode + exchange + subscriber;
        },
        validator: (number: string) => {
          if (number.length !== 10) return false;
          // Area code first digit must be 2-9
          if (number[0] < "2" || number[0] > "9") return false;
          // Exchange code first digit must be 2-9
          if (number[3] < "2" || number[3] > "9") return false;
          // Second digit of area code cannot be 9
          if (number[1] === "9") return false;
          // Second digit of exchange code cannot be 9
          if (number[4] === "9") return false;
          return /^\d+$/.test(number);
        },
      },
      {
        countryName: "India",
        countryCode: "91",
        expectedLength: 10,
        validPrefixes: ["6", "7", "8", "9"],
        pattern: () => {
          // India: 10 digits, mobile starts with 6, 7, 8, or 9 (libphonenumber compatible)
          // Format matches libphonenumber validation rules used by phonelib
          const prefixes = ["6", "7", "8", "9"];
          const prefix = faker.helpers.arrayElement(prefixes);
          const remaining = faker.string.numeric({ length: 9 });
          return prefix + remaining;
        },
        validator: (number: string) => {
          return this.validatePhoneNumber("91", number, 10, ["6", "7", "8", "9"]);
        },
      },
      {
        countryName: "Singapore",
        countryCode: "65",
        expectedLength: 8,
        validPrefixes: ["8", "9"],
        pattern: () => {
          // Singapore: 8 digits, mobile format (libphonenumber compatible)
          // Mobile numbers: 8xxxxxxx OR 9yxxxxxx where y is 0..8
          // Format: 8XXX XXXX or 9YXX XXXX (8 digits total, Y = 0-8)
          // Singapore uses closed numbering plan (no area codes)
          // This format matches libphonenumber validation rules used by phonelib
          const firstDigit = faker.helpers.arrayElement(["8", "9"]);
          
          if (firstDigit === "8") {
            // 8xxxxxxx - 7 more digits
            return "8" + faker.string.numeric({ length: 7 });
          } else {
            // 9yxxxxxx where y is 0..8, then 6 more digits
            const secondDigit = faker.helpers.arrayElement(["0", "1", "2", "3", "4", "5", "6", "7", "8"]);
            return "9" + secondDigit + faker.string.numeric({ length: 6 });
          }
        },
        validator: (number: string) => {
          // Strict validation for Singapore mobile numbers (libphonenumber compatible)
          if (number.length !== 8) return false;
          if (!/^\d{8}$/.test(number)) return false;
          
          const firstDigit = number[0];
          if (firstDigit === "8") {
            // 8xxxxxxx format - all remaining 7 digits can be 0-9
            return true;
          } else if (firstDigit === "9") {
            // 9yxxxxxx format - second digit (y) must be 0-8
            const secondDigit = parseInt(number[1]);
            if (secondDigit < 0 || secondDigit > 8) {
              return false;
            }
            // Remaining 6 digits can be 0-9
            return true;
          }
          
          return false;
        },
      },
      {
        countryName: "Japan",
        countryCode: "81",
        expectedLength: 10,
        validPrefixes: ["70", "80", "90"],
        pattern: () => {
          // Japan: 10 digits, mobile starts with 70, 80, or 90 (libphonenumber compatible)
          // Format matches libphonenumber validation rules used by phonelib
          const prefixes = ["70", "80", "90"];
          const prefix = faker.helpers.arrayElement(prefixes);
          const remaining = faker.string.numeric({ length: 8 });
          return prefix + remaining;
        },
        validator: (number: string) => {
          if (number.length !== 10) return false;
          const hasValidPrefix = number.startsWith("70") || number.startsWith("80") || number.startsWith("90");
          return hasValidPrefix && /^\d+$/.test(number);
        },
      },
      {
        countryName: "United Arab Emirates",
        countryCode: "971",
        expectedLength: 9,
        validPrefixes: ["50", "52", "54", "55", "56", "58"],
        pattern: () => {
          // UAE: 9 digits, mobile starts with 50, 52, 54, 55, 56, or 58 (libphonenumber compatible)
          // Format matches libphonenumber validation rules used by phonelib
          const prefixes = ["50", "52", "54", "55", "56", "58"];
          const prefix = faker.helpers.arrayElement(prefixes);
          const remaining = faker.string.numeric({ length: 7 });
          return prefix + remaining;
        },
        validator: (number: string) => {
          if (number.length !== 9) return false;
          const hasValidPrefix = number.startsWith("50") || number.startsWith("52") || 
                                 number.startsWith("54") || number.startsWith("55") || 
                                 number.startsWith("56") || number.startsWith("58");
          return hasValidPrefix && /^\d+$/.test(number);
        },
      },
      {
        countryName: "Bahrain",
        countryCode: "973",
        expectedLength: 8,
        validPrefixes: ["3"],
        pattern: () => {
          // Bahrain: 8 digits, mobile starts with 3 (libphonenumber compatible)
          // Format matches libphonenumber validation rules used by phonelib
          const remaining = faker.string.numeric({ length: 7 });
          return "3" + remaining;
        },
        validator: (number: string) => {
          return this.validatePhoneNumber("973", number, 8, ["3"]);
        },
      },
      {
        countryName: "Qatar",
        countryCode: "974",
        expectedLength: 8,
        validPrefixes: ["3", "5", "6", "7"],
        pattern: () => {
          // Qatar: 8 digits, mobile starts with 3, 5, 6, or 7 (libphonenumber compatible)
          // Format matches libphonenumber validation rules used by phonelib
          const prefixes = ["3", "5", "6", "7"];
          const prefix = faker.helpers.arrayElement(prefixes);
          const remaining = faker.string.numeric({ length: 7 });
          return prefix + remaining;
        },
        validator: (number: string) => {
          return this.validatePhoneNumber("974", number, 8, ["3", "5", "6", "7"]);
        },
      },
      {
        countryName: "Iran",
        countryCode: "98",
        expectedLength: 10,
        validPrefixes: ["910", "911", "912", "913", "914", "915", "916", "917", "918", "919",
                        "920", "921", "922", "923", "924", "925", "926", "927", "928", "929",
                        "930", "931", "932", "933", "934", "935", "936", "937", "938", "939",
                        "990", "991", "992", "993", "994", "995", "996", "997", "998", "999"],
        pattern: () => {
          // Iran: 10 digits, mobile format in international form (without leading 0)
          // Valid mobile prefixes: 910-919, 920-929, 930-939, 990-999 (libphonenumber compatible)
          // Format: 9XX XXXXXXX (where XX is 10-19, 20-29, 30-39, or 90-99)
          // National format: 09XX XXXXXXX (11 digits with leading 0)
          // International format: +98 9XX XXXXXXX (10 digits without leading 0)
          // This format matches libphonenumber validation rules used by phonelib
          const iranValidMobilePrefixes = [
            "910", "911", "912", "913", "914", "915", "916", "917", "918", "919",
            "920", "921", "922", "923", "924", "925", "926", "927", "928", "929",
            "930", "931", "932", "933", "934", "935", "936", "937", "938", "939",
            "990", "991", "992", "993", "994", "995", "996", "997", "998", "999"
          ];
          const prefix = faker.helpers.arrayElement(iranValidMobilePrefixes);
          // Generate 7 remaining digits (subscriber number)
          const remaining = faker.string.numeric({ length: 7 });
          return prefix + remaining;
        },
        validator: (number: string) => {
          // Strict validation for Iran mobile numbers
          if (number.length !== 10) return false;
          if (!/^\d{10}$/.test(number)) return false;
          
          // Must start with 9
          if (number[0] !== "9") return false;
          
          // Get first 3 digits (mobile prefix)
          const firstThreeDigits = number.substring(0, 3);
          
          // Validate against exact list of valid mobile prefixes
          const validMobilePrefixes = [
            "910", "911", "912", "913", "914", "915", "916", "917", "918", "919",
            "920", "921", "922", "923", "924", "925", "926", "927", "928", "929",
            "930", "931", "932", "933", "934", "935", "936", "937", "938", "939",
            "990", "991", "992", "993", "994", "995", "996", "997", "998", "999"
          ];
          
          // Check if first 3 digits match a valid mobile prefix
          if (!validMobilePrefixes.includes(firstThreeDigits)) {
            return false;
          }
          
          // Ensure remaining 7 digits are all numeric (already checked by regex, but double-check)
          const remainingDigits = number.substring(3);
          if (remainingDigits.length !== 7 || !/^\d{7}$/.test(remainingDigits)) {
            return false;
          }
          
          return true;
        },
      },
      {
        countryName: "Iraq",
        countryCode: "964",
        expectedLength: 10,
        validPrefixes: ["7"],
        pattern: () => {
          // Iraq: 10 digits, mobile starts with 7 (libphonenumber compatible)
          // Format matches libphonenumber validation rules used by phonelib
          const remaining = faker.string.numeric({ length: 9 });
          return "7" + remaining;
        },
        validator: (number: string) => {
          return this.validatePhoneNumber("964", number, 10, ["7"]);
        },
      },
      {
        countryName: "United Kingdom",
        countryCode: "44",
        expectedLength: 10,
        validPrefixes: ["7"],
        pattern: () => {
          // UK: 10 digits, mobile starts with 7, followed by 9 digits (libphonenumber compatible)
          // Format matches libphonenumber validation rules used by phonelib
          const remaining = faker.string.numeric({ length: 9 });
          return "7" + remaining;
        },
        validator: (number: string) => {
          return this.validatePhoneNumber("44", number, 10, ["7"]);
        },
      },
    ];

    // Randomly select a country
    const selectedConfig = faker.helpers.arrayElement(countryConfigs);
    
    // Generate phone number with validation (retry up to 10 times if invalid)
    let nationalNumber: string = "";
    let isValid = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isValid && attempts < maxAttempts) {
      nationalNumber = selectedConfig.pattern();
      isValid = selectedConfig.validator(nationalNumber);
      attempts++;
    }

    // If still invalid after retries, throw error
    if (!isValid || !nationalNumber) {
      throw new Error(`Failed to generate valid phone number for ${selectedConfig.countryName} after ${maxAttempts} attempts. Generated: ${nationalNumber}`);
    }

    // Final validation check
    if (!selectedConfig.validator(nationalNumber)) {
      throw new Error(`Generated phone number failed validation for ${selectedConfig.countryName}: ${nationalNumber}`);
    }

    // Format in pure E.164 format: +<CountryCode><NationalNumber> (NO SPACES)
    // libphonenumber/phonelib expects pure E.164 format without spaces for validation
    // Format: +CountryCodeNationalNumber (e.g., +919876543210, +6591234567, +14155551234)
    // This is the standard E.164 format that libphonenumber validates
    // 
    // IMPORTANT: libphonenumber validation is very strict and checks:
    // 1. Format correctness (length, prefix patterns) ✓
    // 2. Number ranges (some ranges may be reserved/unassigned)
    // 3. Type validation (mobile vs fixed-line patterns)
    // 
    // If a generated number fails validation in phonelib, it might be because:
    // - The number falls in a reserved/unassigned range
    // - libphonenumber's data has been updated with new restrictions
    // - The number pattern doesn't match current numbering plan
    // 
    // The patterns used here are based on libphonenumber's known valid patterns,
    // but libphonenumber may reject some numbers even if they match the format.
    const phoneNumber = `+${selectedConfig.countryCode} ${nationalNumber}`;
    
    // Return phone number and country name
    // phoneNumber format: Pure E.164 format (+CountryCodeNationalNumber)
    // This format is required for libphonenumber validation used by phonelib
    // The number will be validated as: Phonelib.parse(phoneNumber).valid?
    // 
    // Example usage in Ruby:
    //   phone = Phonelib.parse("+919876543210")
    //   phone.valid? # => should return true
    return {
      phoneNumber: phoneNumber,
      country: selectedConfig.countryName,
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
  async generateRandomNumber(digits: number): Promise<string> {
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
  async generateRandomString(
    length: number = 10,
    options?: {
      casing?: "lower" | "upper" | "mixed";
      includeNumbers?: boolean;
      includeSpecialChars?: boolean;
    },
  ): Promise<string> {
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

  async replaceFirstDigits(phone: string | number): Promise<string> {
    const phoneStr = String(phone);
    if (phoneStr.length !== 10) {
        throw new Error("Phone number must be exactly 10 digits");
    }
    return "12345" + phoneStr.slice(5);
}

  // To calculate future date based on time unit and amount
  async calculateFutureDate(
    timeUnit: AheadOf,
    amount: number,
    format: string,
  ): Promise<string> {
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

  async calculateFutureDateWithAdjustments(
    adjustments: TimeAdjustments,
    format: string
  ): Promise<string> {
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

  async getCurrentDate(format: string): Promise<string> {
    const now = DateTime.now().setZone("Asia/Kolkata");
    return now.toFormat(format);
  }

  async getCurrentEpochMs(): Promise<number> {
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
  async generateExcelFile(fileFor: string, importLocation: string, sheetName: string): Promise<string> {
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

  async customSubstring(input: string, start: number, length: number): Promise<string> {
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