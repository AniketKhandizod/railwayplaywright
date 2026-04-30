import { expect, APIRequestContext, test, request } from "@playwright/test";
import { properties } from "../../Environment/v2";
import { AheadOf, Utils } from "../PlaywrightTestUtils";
import { CRMAPIUtils } from "./CRMAPIUtils";
import { LeadAPIUtils } from "./LeadAPIUtils";

export enum CallDirection {
    Incoming = "1",
    Outgoing = "2",
}
  
export enum CallStatus {
    Answered = "ANSWERED",
    NotAnswered = "MISSED",
}

export enum OfflineCallStrategy {
    OnlyOnlineCalls = 0, // Only online calls (calls via Sell.Do)
    SellDoAndMobileOffline = 1, // Sell.Do calls + Mobile offline calls
    AllTypesOfCalls = 2, // All types of calls (including manually logged offline calls)
}

export class CalligAPIUtils {

    private readonly crmAPIUtils :CRMAPIUtils;
    private readonly clientId: string;
    private readonly apiKey: string;
    private request!: APIRequestContext;
    private utils!: Utils;

    constructor(clientId: string, apiKey: string){
        this.crmAPIUtils = new CRMAPIUtils(clientId, apiKey);
        this.clientId = clientId;
        this.apiKey = apiKey;
    }
    
  private async initializeRequest() {
    if (!this.request) {
      this.utils = new Utils();
      this.request = await request.newContext();
    }
  }

    async AddOfflineCall(leadId: string, cd:CallDirection, cs:CallStatus, duration: number, userEmail: string, isMobile: boolean): Promise<void> {
        await this.initializeRequest();
        const url = `/offlinecall/create.json`;
        const leadAPIUtils = new LeadAPIUtils(this.clientId, this.apiKey);
        const userTokenResponse = await this.crmAPIUtils.getUserToken(userEmail, properties.PASSWORD ?? "");
        const leadDebId = await leadAPIUtils.getLeadId(leadId);
        const notes = await this.utils.generateRandomString(10, { casing: "upper", includeNumbers: false, includeSpecialChars: false});
        const time = await this.utils.calculateFutureDate(AheadOf.Day, 0, "EEE MMM dd yyyy HH:mm:ss 'GMT'+0530 (zzzz)");

        const  multiparts = {
            project_id:"",
            duration:duration,
            duration_seconds:duration , // renamed key for clarity
            recording:"",
            offline:"true",
            direction:cd,
            status:cs,
            notes:notes,
            lead_id:""+leadDebId,
            created_at:time,
            user_email:userEmail,
            user_token:""+`${userTokenResponse}`,
          };

          const  multipartsMobile = {
            client_id: this.clientId,
            sid: properties.SID ?? "",
            status: cs,
            originator:"916241899943",
            duration:duration,
            called_on: properties.salesPhone ?? "",
            created_at:time,
            direction: cd,
            appVersion: "1.0.5",
            is_new_offline_app: true,
            user_email:userEmail,
            user_token:String(userTokenResponse),
          };

          const mobile = {
            user_email:userEmail,
            user_token:String(userTokenResponse),
            client_id:this.clientId,
            appVersion:"1.0.5",
            is_new_offline_app:true,
            sid:properties.SID ?? "",
            status:cs,
            originator:"916241899943",
            duration:"1",
            total_duration:"1",
            called_on:properties.salesPhone ?? "",
            created_at:time,
            direction:cd,
            is_new_dialer:true
          }
        const response = await this.request.post(url, {
          multipart: isMobile ? mobile : multiparts,
        });
        expect(response.status()).toBe(200);
      }  

        // ✅ Incoming Call from Doocti
  async incomingCallDoocti(
    customerPhone: string,
    answeredBy: string,
    calledOn: string,
  ): Promise<void> {
    await this.initializeRequest();
    const url = `/ivr/generic/doocti/${this.clientId}`;
    const remoteId = await this.utils.generateRandomString(20, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
    const body = {
      remote_id: remoteId,
      answered_by: answeredBy,
      customer_phone: customerPhone,
      called_on: calledOn,
      direction: "incoming",
      event: "hangup",
      status: "answered", // not_answered // answered
      message: "Playwright incoming call from Doocti",
      duration: "1",
      total_duration: "1",
      pick_duration: "1",
      recording_url: "",
      agent: "",
      sub_provider: "doocti",
      client_id: this.clientId
    };

    const response = await this.request.post(url, {
      data: body,
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok()) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`Failed to handle incoming call from Doocti. Status: ${response.status()}, Response: ${JSON.stringify(errorBody)}`);
    }

    expect(response.status()).toBe(200);
  }

  // ✅ Update offline call strategy configuration
  async updateOfflineCallStrategy(strategy: OfflineCallStrategy): Promise<void> {
    await this.initializeRequest();
    const URL = `/client/configuration.json?api_key=${this.apiKey}&client_id=${this.clientId}`;

    const formData = new URLSearchParams();
    formData.append("utf8", "✓");
    formData.append("_method", "put");
    formData.append("client_id", this.clientId);
    formData.append("client_configuration[offline_call_strategy]", strategy.toString());
    formData.append("commit", "Save");

    const response = await this.request.put(URL, {
      data: formData.toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    expect(response.status()).toBe(200);
  }
}