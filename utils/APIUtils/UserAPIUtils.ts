import { expect, APIRequestContext, test, request } from "@playwright/test";
import { properties } from "../env";
import { Utils } from "../PlaywrightTestUtils";

export interface DayAvailability {
  sunday?: boolean;
  monday?: boolean;
  tuesday?: boolean;
  wednesday?: boolean;
  thursday?: boolean;
  friday?: boolean;
  saturday?: boolean;
}

/** Result of resolving a user's team from user details + teams list. */
export interface UserTeamResolution {
  teamId: string | null;
  teamName: string | null;
}

export class UserAPIUtils {
    private readonly clientId: string;
    private readonly apiKey: string;
    private readonly utils: Utils;

    constructor(clientId: string, apiKey: string){
        this.clientId = clientId;
        this.apiKey = apiKey;
        this.utils = new Utils();
    }

    // To get user details by user ID
  async getUserDetails(userId: string): Promise<any> {
    const URL = `/client/users/${userId}.json`;

    const req = await request.newContext();
    const response = await req.get(URL, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok()) {
      throw new Error(
        `Get user details request failed: ${response.status()} - ${response.statusText()}`,
      );
    }

    expect(response.status()).toBe(200);
    return await response.json();
  }

  /**
   * Resolves the user's `team_id` from GET /client/users/:userId.json (not from the teams list).
   */
  async getUserTeamId(userId: string): Promise<string | null> {
    const details = await this.getUserDetails(userId);
    const teamId = details?.user?.team_id ?? details?.team_id;
    if (teamId === undefined || teamId === null || teamId === "") {
      return null;
    }
    return String(teamId);
  }

  /**
   * GET /client/teams.json is paginated (`per_page`, typically 15). Loads every page until all teams are collected.
   */
  private async fetchAllTeams(): Promise<{ _id: string; name: string }[]> {
    const URL = `/client/teams.json`;
    const req = await request.newContext();
    const perPageFallback = 15;
    let page = 1;
    const allTeams: { _id: string; name: string }[] = [];

    while (true) {
      const response = await req.get(URL, {
        params: {
          client_id: this.clientId,
          api_key: this.apiKey,
          page,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok()) {
        throw new Error(
          `Get teams request failed: ${response.status()} - ${response.statusText()}`,
        );
      }

      expect(response.status()).toBe(200);
      const body = await response.json();
      const results = body.results ?? [];
      const perPage = typeof body.per_page === "number" ? body.per_page : perPageFallback;
      const total = typeof body.total === "number" ? body.total : null;

      for (const row of results) {
        if (row?._id) {
          allTeams.push({ _id: String(row._id), name: row.name != null ? String(row.name) : "" });
        }
      }

      if (results.length === 0) {
        break;
      }
      if (results.length < perPage) {
        break;
      }
      if (total !== null && allTeams.length >= total) {
        break;
      }
      page++;
    }

    return allTeams;
  }

  /**
   * Returns the user's `team_id` from user details and the matching team `name` from GET /client/teams.json (all pages).
   */
  async getUserTeamIdAndName(userId: string): Promise<UserTeamResolution> {
    const teamId = await this.getUserTeamId(userId);
    if (!teamId) {
      return { teamId: null, teamName: null };
    }
    const teams = await this.fetchAllTeams();
    const match = teams.find((t) => t._id === teamId);
    return {
      teamId,
      teamName: match?.name ?? null,
    };
  }

  async isEsEnabled(email: string): Promise<boolean> {
    const userDetails = await this.getUserDetails(email);
    return userDetails.user.es_enabled;
  }

  /**
   * Get user availability from edit.json endpoint
   * @param userToken - User authentication token
   * @param userEmail - User email address (required for authentication)
   * @param userId - User ID to get availability for (the user whose availability is being retrieved)
   * @returns JSON response containing user details including call_availabilities with day IDs
   */
  async getUserAvailability(userToken: string, userEmail: string, userId: string): Promise<any> {
    const URL = `/client/users/${userId}/edit.json`;
    const req = await request.newContext();
    // GET request with JSON body (non-standard but required by API)
    const response = await req.get(URL, {
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        user_email: userEmail,
        user_token: userToken,
      },
    });

    if (!response.ok()) {
      throw new Error(
        `Get user availability request failed: ${response.status()} - ${response.statusText()}`,
      );
    }

    expect(response.status()).toBe(200);
    return await response.json();
  }

  /**
   * Get user call availabilities
   * @param userToken - User authentication token
   * @param userEmail - User email address (required for authentication)
   * @param userId - User ID to get call availabilities for (the user whose availability is being retrieved)
   * @returns JSON response containing call_availabilities array with day IDs
   */
  async getUserCallAvailabilities(userToken: string, userEmail: string, userId: string): Promise<any> {
    const URL = `/client/users/${userId}/call-availabilities.json`;

    const req = await request.newContext();
    // GET request with JSON body (non-standard but required by API)
    const response = await req.get(URL, {
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        user_email: userEmail,
        user_token: userToken,
      },
    });

    if (!response.ok()) {
      throw new Error(
        `Get user call availabilities request failed: ${response.status()} - ${response.statusText()}`,
      );
    }

    expect(response.status()).toBe(200);
    return await response.json();
  }

  /**
   * Update user availability
   * @param userToken - User authentication token
   * @param userEmail - User email address (required for authentication)
   * @param userId - User ID to update availability for (the user whose availability is being updated)
   * @param availabilityResponse - JSON response from getUserAvailability or getUserCallAvailabilities (to extract day IDs)
   * @param dayAvailability - Object with day availability flags (e.g., {sunday: true, monday: false}) - only specified days will be updated
   * @returns JSON response with updated user details
   */
  async updateUserAvailability(
    userToken: string,
    userEmail: string,
    userId: string,
    fallbackUserId: string,
    availabilityResponse: any,
    dayAvailability: DayAvailability
  ): Promise<any> {

    // Extract call_availabilities from response
    const callAvailabilities = availabilityResponse.call_availabilities || availabilityResponse.user?.call_availabilities || [];
    
    // Create a map of day to availability object for easy lookup
    const availabilityMap: Record<string, any> = {};
    callAvailabilities.forEach((availability: any) => {
      availabilityMap[availability.day] = availability;
    });

    // Build call_availabilities_attributes object - MUST include ALL days (Monday to Sunday)
    const callAvailabilitiesAttributes: Record<string, any> = {};
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    days.forEach((day) => {
      const availability = availabilityMap[day];
      if (availability) {
        // Check if day is explicitly specified in dayAvailability
        const dayKey = day as keyof DayAvailability;
        const hasDayProperty = Object.prototype.hasOwnProperty.call(dayAvailability, dayKey);
        
        // If day is specified in dayAvailability, use that value directly; otherwise use existing value
        let availableValue: boolean;
        if (hasDayProperty) {
          // Get the value directly from dayAvailability
          const specifiedValue = dayAvailability[dayKey];
          
          // Explicitly check for boolean false and true
          if (specifiedValue === false) {
            availableValue = false;
          } else if (specifiedValue === true) {
            availableValue = true;
          } else {
            // Fallback to existing if somehow undefined or null
            availableValue = availability.available === true || availability.available === "true";
          }
        } else {
          // Use existing value from availability response
          availableValue = availability.available === true || availability.available === "true";
        }
        
        // Set fallback_user_ids based on availability
        // If availability is false, use the specified fallback user ID
        // If availability is true, keep it empty
        let fallbackUserIds = "";
        if (availableValue === false) {
          fallbackUserIds = fallbackUserId;
        } else {
          fallbackUserIds = "";
        }
        
        callAvailabilitiesAttributes[day] = {
          id: availability._id,
          available: availableValue, // Send as boolean (API expects boolean, not string)
          start_hour: availability.start_hour?.toString() || "9",
          start_minute: availability.start_minute?.toString() || "0",
          end_hour: availability.end_hour?.toString() || "18",
          end_minute: availability.end_minute?.toString() || "0",
          fallback_user_ids: fallbackUserIds,
        };
      }
    });

    const URL = `/client/users/${userId}.json`;

    const payload = {
      user_email: userEmail,
      user_token: userToken,
      user: {
        call_availabilities_attributes: callAvailabilitiesAttributes,
      },
    };

    const req = await request.newContext();
    const response = await req.put(URL, {
      headers: {
        "Content-Type": "application/json",
      },
      data: payload,
    });

    if (!response.ok()) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `Update user availability request failed: ${response.status()} - ${response.statusText()}. Response: ${JSON.stringify(errorBody)}`,
      );
    }

    expect(response.status()).toBe(200);
    return await response.json();
  }

  /**
   * Enable or disable user availability control feature
   * @param userToken - User authentication token
   * @param userEmail - User email address (required for authentication)
   * @param enabled - true to enable, false to disable user availability control
   * @returns JSON response with updated configuration
   */
  async updateUserAvailabilityControl(userToken: string, userEmail: string, enabled: boolean): Promise<any> {
    const URL = `/client/configuration.json`;

    const req = await request.newContext();
    const response = await req.post(URL, {
      params: {
        api_key: this.apiKey,
        client_id: this.clientId,
      },
      multipart: {
        utf8: "✓",
        _method: "put",
        client_id: this.clientId,
        "client_configuration[features_enabled][user_availability_control]": enabled.toString(),
        commit: "Save",
        user_email: userEmail,
        user_token: userToken,
      },
    });

    if (!response.ok()) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `Update user availability control request failed: ${response.status()} - ${response.statusText()}. Response: ${JSON.stringify(errorBody)}`,
      );
    }

    expect(response.status()).toBe(200);
    return await response.json();
  }

  /**
   * Sets allied user access on a team (same contract as the teams edit UI: PATCH via `_method=patch` + form body).
   * Pass an empty `alliedUserIds` to remove all allied users from the team.
   *
   * @param teamId - Team `_id` (e.g. `69e22a86b08345971a09d7a7`)
   * @param alliedUserIds - User `_id`s granted allied access (comma-separated on the wire, e.g. `["69e22edbb08345971a09d80a","69e22edfb08345971a09d80b"]`)
   */
  async setTeamAlliedUsers(teamId: string, alliedUserIds: string[], accessibleTeams: string[]): Promise<any> {
    const alliedCsv = alliedUserIds
      .map((id) => String(id).trim())
      .filter((id) => id.length > 0)
      .join(",");

    const accessibleTeamsCsv = accessibleTeams
      .map((id) => String(id).trim())
      .filter((id) => id.length > 0)
      .join(",");

    const URL = `/client/teams/${teamId}.json`;
    const req = await request.newContext();
    const response = await req.post(URL, {
      params: {
        api_key: this.apiKey,
        client_id: this.clientId,
      },
      form: {
        utf8: "✓",
        _method: "patch",
        "team[accessible_teams]": accessibleTeamsCsv,
        "team[allied_user_ids]": alliedCsv,
        commit: "Save",
      },
    });

    if (!response.ok()) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(
        `Update team allied users failed: ${response.status()} - ${response.statusText()}. Body: ${errorBody.slice(0, 500)}`,
      );
    }

    this.utils.print(`Set team allied users for team ${teamId} with allied user ids: ${alliedCsv} and accessible teams: ${accessibleTeamsCsv}`);
    expect(response.status()).toBe(200);
    return await response.json().catch(() => ({}));
  }
}