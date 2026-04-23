import { expect, APIRequestContext, test } from "@playwright/test";
import { properties } from "../../properties/v2";
import { AheadOf, Utils } from "../PlaywrightTestUtils";
import { newPlaywrightApiContext } from "./newPlaywrightApiContext";

const WEEKDAYS_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type Weekday = (typeof WEEKDAYS_ORDER)[number];

export class UserManagementAPIUtils {
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
      this.request = await newPlaywrightApiContext();
      this.utils = new Utils();
    }
  }
  // ✅ Create team
  async createTeam(teamName: string) {
    await this.initializeRequest();
    const URL = `/client/teams.json`;

    const requestBody = {
      api_key: this.apiKey,
      client_id: this.clientId,
      commit: "Save",
      utf8: "✓",
      team: {
        name: teamName,
        accessible_teams: "",
        allied_user_ids: "",
        location: "Pune",
        team_hierarchy_id: properties.teamHierarchyID,
        unlimited_ivr_phone: "",
      },
    };

    //console.log(`🟡 Creating team with name: 🔴 ${teamName}`);

    const response = await this.request.post(URL, {
      headers: { "Content-Type": "application/json" },
      data: requestBody,
    });

    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    return responseBody; // Assuming same as Root_GetTeam
  }

  // ✅ Save call availabilities
  async saveCallAvailabilities(userId: string, available: boolean) {
    await this.initializeRequest();
    const URL = `/client/users/save_call_availabilities.json?api_key=${this.apiKey}&client_id=${this.clientId}`;
    
    const day = await this.utils.calculateFutureDate(AheadOf.Day, 0, "EEEE");
    const response = await this.request.put(URL, {
      data: `user_id=${userId}&day=${day.toLowerCase()}&available=${available.toString()}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    await this.utils.print(`User availability for ${await this.getUserFullName(userId)}: is ${available ? "available" : "unavailable"}`);
    expect(response.status()).toBe(200);
  }

  // ✅ Save call availabilities for all days of the week (Monday to Sunday)
  async saveCallAvailabilitiesForAllDays(userId: string, availability: boolean) {
    await this.initializeRequest();
    const URL = `/client/users/save_call_availabilities.json?api_key=${this.apiKey}&client_id=${this.clientId}`;
    
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (const day of daysOfWeek) {
      const response = await this.request.put(URL, {
        data: `user_id=${userId}&day=${day}&available=${availability.toString()}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      expect(response.status()).toBe(200);
    }
  }

  // ✅ Update user call availability with full options
  async updateUserCallAvailability(
    userId: string,
    available: boolean,
    fallbackUserIds?: string[],
    replaceWithSales?: string[]
  ) {
    await this.initializeRequest();
    const URL = `/client/users/save_call_availabilities.json`;
    
    // Detect today's day and convert to lowercase
    const day = await this.utils.calculateFutureDate(AheadOf.Day, 0, "EEEE");
    
    // Build JSON request body
    const requestBody: Record<string, any> = {
      user_id: userId,
      day: day.toLowerCase(),
      available: available,
    };

    // Add fallback_user_ids if provided
    if (fallbackUserIds && fallbackUserIds.length > 0) {
      requestBody.fallback_user_ids = fallbackUserIds;
    }

    // Add replace_with_sales if provided
    if (replaceWithSales && replaceWithSales.length > 0) {
      requestBody.replace_with_sales = replaceWithSales;
    }

    const response = await this.request.put(URL, {
      params: {
        api_key: this.apiKey,
        client_id: this.clientId,
      },
      headers: {
        "Content-Type": "application/json",
      },
      data: requestBody,
    });
    if(available){
      await this.utils.print(`User availability update for ${await this.getUserFullName(userId)}: from ${day.toLowerCase()} to ${available ? "available" : "unavailable"}`);
    }else{
      await this.utils.print(`User availability update for ${await this.getUserFullName(userId)}: from ${day.toLowerCase()} to ${available ? "available" : "unavailable"} and fallback user ids: ${fallbackUserIds?.join(", ")} and replace with sales: ${replaceWithSales?.join(", ")}`);
    }
    expect(response.status()).toBe(200);
    return await response.json();
  }

  // ✅ Get user by ID
  async getUserDetailsById(userId: string) {
    await this.initializeRequest();
    const URL = `/client/users/${userId}/edit.json?api_key=${this.apiKey}&client_id=${this.clientId}`;

    const response = await this.request.get(URL);

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    return responseBody;
  }

  /**
   * GET call-availabilities for a user; returns each weekday's availability document `_id`
   * (e.g. sunday → "67da7d99b0834510573b3f59").
   */
  private async getCallAvailabilityIdsByDay(
    userId: string
  ): Promise<Record<string, string>> {
    await this.initializeRequest();
    const URL = `/client/users/${userId}/call-availabilities.json?api_key=${this.apiKey}&client_id=${this.clientId}`;

    const response = await this.request.get(URL);
    expect(response.status()).toBe(200);
    const body = await response.json();
    const availabilities = body.call_availabilities ?? [];
    const idsByDay: Record<string, string> = {};
    for (const entry of availabilities) {
      if (entry?.day && entry?._id) {
        idsByDay[entry.day] = entry._id;
      }
    }
    return idsByDay;
  }

  /**
   * PUT `/client/users/:id.json` — set call availability for every weekday with the same time window.
   * Uses existing per-day document ids from `getCallAvailabilityIdsByDay`.
   * @param opts.defaultAvailable — when set, used for any day not listed in `opts.availableByDay` (default `true`).
   * @param opts.availableByDay — optional per-day `available` flags (e.g. thursday/friday only).
   */
  async updateUserCallAvailabilityForFullWeek(
    userId: string,
    startHour: number,
    startMinute: number,
    endHour: number,
    endMinute: number,
    opts?: {
      defaultAvailable?: boolean;
      availableByDay?: Partial<Record<Weekday, boolean>>;
    }
  ): Promise<any> {
    await this.initializeRequest();
    const idsByDay = await this.getCallAvailabilityIdsByDay(userId);
    const defaultAvailable = opts?.defaultAvailable ?? true;

    const callAvailabilitiesAttributes: Record<string, Record<string, string | boolean>> = {};
    for (const day of WEEKDAYS_ORDER) {
      const available =
        opts?.availableByDay?.[day] ?? defaultAvailable;
      callAvailabilitiesAttributes[day] = {
        id: idsByDay[day] ?? "",
        available,
        start_hour: String(startHour),
        start_minute: String(startMinute),
        end_hour: String(endHour),
        end_minute: String(endMinute),
        fallback_user_ids: "",
      };
    }

    const URL = `/client/users/${userId}.json?api_key=${this.apiKey}&client_id=${this.clientId}`;
    const response = await this.request.put(URL, {
      headers: { "Content-Type": "application/json" },
      data: {
        user: {
          call_availabilities_attributes: callAvailabilitiesAttributes,
        },
      },
    });

    expect(response.status()).toBe(200);
    await this.utils.print(`User availbality update for ${await this.getUserFullName(userId)}: from ${startHour}:${startMinute} to ${endHour}:${endMinute}`);
    return response.json();
  }

  async getUserRoaster(userId: string): Promise<any> {
    const userDetails = await this.getUserDetailsById(userId);
    const roster = userDetails.roaster;
    return roster; //>> return available-a || break-brk || on call - bsy || deposition - d || leave - na
  }

  async getUserEmail(userId: string): Promise<any> {
    const userDetails = await this.getUserDetailsById(userId);
    const email = userDetails.email;
    return email;
  }

  async getUserFullName(userId: string): Promise<any> {
    const userDetails = await this.getUserDetailsById(userId);
    const fullName = userDetails.full_name;
    return fullName;
  }

  async getUserTeamId(userId: string): Promise<any> {
    const userDetails = await this.getUserDetailsById(userId);
    const team = userDetails.team_id;
    return team;
  }

  // ✅ Mark all users as available
  async markAllUsersAsAvailable(): Promise<{ processed: number; skipped: number; errors: number }> {
    await this.initializeRequest();
    const URL = `/client/users.json`;
    const perPage = 15;
    let currentPage = 1;
    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let isLastPage = false;

    while (!isLastPage) {
      const params: Record<string, any> = {
        api_key: this.apiKey,
        client_id: this.clientId,
        page: currentPage,
        "search_params[status]": "true",
      };

      const response = await this.request.get(URL, {
        params: params,
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      const users = responseBody.results || [];
      const usersCount = users.length;

      // Process each user in the current page
      for (const user of users) {
        const userId = user._id;
        const userRole = user.role;
        const roaster = user.roaster;
        const isActive = user.is_active;
        const allowToManageLeads = user.allow_to_manage_leads;
        const assignLeads = user.assign_leads;

        // Skip users that don't need to be processed
        if (
          userRole === "admin" ||
          !isActive ||
          roaster === "a" ||
          (!allowToManageLeads && !assignLeads)
        ) {
          skippedCount++;
          continue;
        }

        // Mark user as available
        try {
          await this.updateUserCallAvailability(userId, true, undefined, undefined);
          processedCount++;
        } catch (error) {
          errorCount++;
          console.error(`Failed to mark user ${userId} as available: ${error}`);
        }
      }

      // Check if this is the last page (less than 15 users means last page)
      if (usersCount < perPage) {
        isLastPage = true;
      } else {
        currentPage++;
      }
    }

    return {
      processed: processedCount,
      skipped: skippedCount,
      errors: errorCount,
    };
  }
}



// # getUserDetailsById >> json reponse >> 
// {
//   "_id": "67da7d8fb0834512cba20c72",
//   "accessible_leads": false,
//   "add_to_default_routing_rule": false,
//   "allow_to_approve_reject_negotiations": false,
//   "allow_to_manage_leads": true,
//   "allowed_client_ids": [],
//   "allowed_ip_addresses": [],
//   "assign_leads": true,
//   "auth_otp_code": null,
//   "auto_roster_management": false,
//   "billable_user": true,
//   "bypass_ip_restriction": false,
//   "calling_enabled": false,
//   "campaign_ids": [
//   "67da7d9ab0834510573b3f6d",
//   "6890a4bdb08345aab8bcc485"
//   ],
//   "circle": null,
//   "client_id": "67da7d8fb0834512cba20c6f",
//   "created_at": "2025-03-19T08:17:29.498Z",
//   "daily_reports": true,
//   "deactivated_at": null,
//   "deactivation_data": {},
//   "default_for_client_id": "67da7d8fb0834512cba20c6f",
//   "default_pre_sales_for_client_id": null,
//   "department": "sales",
//   "device_ids": {
//   "android": [],
//   "ios": []
//   },
//   "email": "aniket.khandizod+sal1@sell.do",
//   "enable_voip": false,
//   "fcm_id": "cjKcuL0MQ1O7JDMqtD89V-:APA91bG1KyjFH-C2x98XXu6KIX2ez8rWLiQpb2icKflphqdKL22MOKT_dNjBSAHw-Fn8EsQhfGxOHWBwDk3H0Kn6vn2ZGh9KRyWo_O1yHLKY6jpvhRLxtUQ",
//   "feedback_submitted": false,
//   "first_name": "Salesuser2main",
//   "full_name": "Salesuser2main .",
//   "google_calendar_details": {},
//   "google_token": {},
//   "gps_tracking_enabled": true,
//   "is_active": true,
//   "last_name": ".",
//   "last_otp_sent_at": null,
//   "last_seen_at_mobile": "2025-08-03T10:45:33.521Z",
//   "last_seen_at_web": "2025-08-06T18:57:47.824Z",
//   "latest_gps_location": {
//   "lat": "18.557959999999998",
//   "long": "73.79278833333333",
//   "location_time": "2025-05-05T11:42:20.000Z",
//   "address": "Hill View Aprt, 1-2, Baner Rd, Baner Bio-Diversity Park, Baner, Pune, Maharashtra 411045, India",
//   "message": null
//   },
//   "manager_id": null,
//   "ms365_calendar_details": {
//   "id": "AAMkAGViYmZiZDEwLWQyMWItNDlhZi1iMDBkLWY1ZjcwZDdmZmY1OQBGAAAAAABbyWH0_MNuQK_f9ICigP19BwDnpN-YSU76QJTa6d3kVcU-AAAAAAEGAADnpN-YSU76QJTa6d3kVcU-AAAAAJ3yAAA=",
//   "name": "Calendar",
//   "color": "auto",
//   "hexColor": "",
//   "groupClassId": "0006f0b7-0000-0000-c000-000000000046",
//   "isDefaultCalendar": true,
//   "changeKey": "56Tf2ElO+kCU2und5FXFPwAAAAACpg==",
//   "canShare": true,
//   "canViewPrivateItems": true,
//   "canEdit": true,
//   "allowedOnlineMeetingProviders": [
//   "teamsForBusiness"
//   ],
//   "defaultOnlineMeetingProvider": "teamsForBusiness",
//   "isTallyingResponses": true,
//   "isRemovable": false,
//   "owner": {
//   "name": "Aniket Khandizod",
//   "address": "aniket.khandizod@sell.do"
//   }
//   },
//   "ms365_token": {},
//   "oauth_accounts": [],
//   "otp_attempt": null,
//   "owner_ids": [],
//   "password_updated_by": {},
//   "pg_synced": true,
//   "phone": "08247470390",
//   "phone_codes": {
//   "primary": "91",
//   "secondary": "91"
//   },
//   "platform": "android",
//   "post_sales_project_ids": [],
//   "pre_sales_project_ids": [],
//   "primary_dashboard_id": "682c26bdb0834505e349def1",
//   "project_ids": [
//   "67dacfedb08345829f477ffa",
//   "67dc181bb08345a70f22d9ae",
//   ],
//   "push_notification_mobile": true,
//   "reactivated_on": "2025-03-19T08:27:10.713+00:00",
//   "relative_team_ids": [],
//   "resend_otp_counter": 0,
//   "roaster": "a",
//   "roaster_sub_state": null,
//   "role": "sales",
//   "role_changed_data": {},
//   "secondary_booking_detail_ids": [],
//   "secondary_phone": "08405935379",
//   "session_token": "7b95b823f9f15a6dbbc9d83f0a014007",
//   "show_accessible_bookings": false,
//   "target_ids": [],
//   "team_id": "67da7edcb0834512cba20e9c",
//   "temporary_reassignment": false,
//   "time_zone": "Asia/Kolkata",
//   "unlimited_calling": false,
//   "updated_at": "2025-08-07T05:31:03.144Z",
//   "user_in_default_routing": false,
//   "using_mobile_app": false,
//   "voip_credentials": {
//   "provider": "",
//   "sub_provider": "",
//   "username": "",
//   "password": "",
//   "domain": "",
//   "agent_key": "",
//   "extention": "",
//   "is_default": "true",
//   "phone": ""
//   },
//   "whatsapp_conversation_ids": [],
//   "work_as_manager": true,
//   "zoomus_configuration": {},
//   "zoomus_token": {}
//   }
