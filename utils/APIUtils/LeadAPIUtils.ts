import { APIRequestContext, APIResponse, expect, request } from "@playwright/test";
import { properties } from "../../Environment/v2";
import { AheadOf, Utils } from "../PlaywrightTestUtils";
import { CRMAPIUtils } from "./CRMAPIUtils";
import { UserManagementAPIUtils } from "./UserManagementAPIUtils";
import { BulkActionAPIUtils } from "./BulkActionAPIUtils";

export enum ActivityType {
  Whatsapp = 'Whatsapp',
  Starred = 'Starred',
  Note = 'Note',
  Call = 'Call',
  SiteVisit = 'SiteVisit',
  Feed = 'Feed',
  Followup = 'Followup',
  Email = 'Email',
  Sms = 'Sms',
  MergeLeads = 'MergeLeads',
}

export enum FollowupType {
  Call = 'call',
  Email = 'email',
  Whatsapp = 'whatsapp',
}

export enum ReassignedDirection {
  To = 'reassigned_to',
  By = 'reassigned_by',
}

export enum SiteVisitAction {
  Conducted = 'conducted',
  Missed = 'missed',
  Dropped = 'dropped',
  Rescheduled = 'rescheduled',
  Pending = 'pending',
}

export class LeadAPIUtils {
  private request!: APIRequestContext;
  private utils!: Utils;

  private readonly clientId: string;
  private readonly apiKey: string;
  private readonly RestrictedAccess_API: string;

  constructor(clientId: string, FullAccess_API: string, RestrictedAccess_API: string = properties.RestrictedAccess_API ?? properties.FullAccess_API ?? ""){
    this.clientId = clientId;
    this.apiKey = FullAccess_API;
    this.RestrictedAccess_API = RestrictedAccess_API;
  }

  private async initializeRequest() {
    if (!this.request) {
      this.utils = new Utils();
      this.request = await request.newContext();
    }
  }

  // >> >> >> >> >> >> >> >> >> >> >> >> >> >> Create Lead APIS >> >> >> >> >> >> >> >> >> >> >> >> >> >>

  // ✅ Create lead with details
  async createLeadWithDetails(
    phone: string,
    email: string,
    name?: string,
    source?: string,
    subSource?: string,
    projectId?: string | string[],
    salesId?: string,
    srd?: string,
    nri?: boolean,
    form_id?: string,
    customFields?: Record<string, string>
  ): Promise<Record<string, any>> {
    await this.initializeRequest();
    // Handle projectId: if string with commas, split into array; if already array, use as is
    let projectIdArray: string[] | undefined;
    if (projectId) {
      if (Array.isArray(projectId)) {
        projectIdArray = projectId;
      } else if (typeof projectId === 'string' && projectId.includes(',')) {
        // If it's a comma-separated string, split it into an array
        projectIdArray = projectId.split(',').map(id => id.trim().replace(/"/g, ''));
      } else {
        // Single project ID as string - convert to array
        projectIdArray = [projectId];
      }
    }
    const payload = {
      sell_do: {
        form: {
          lead: {
            name: name?.replaceAll(/[^a-zA-Z0-9 ]/g, ""),
            phone: phone,
            email: email,
            sub_source: subSource,
            source: source,
            project_id: projectIdArray,
            sales: salesId,
            nri: nri,
            campaign_id: form_id || ""
          },
        },
        custom: {
          ...customFields,
        },
        campaign: {
          srd: srd
        },
      },
      api_key: this.RestrictedAccess_API,
    };

    const maxRetries = 10;
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.request.post(`/api/leads/create`, {
          data: payload,
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 second timeout
        });
        expect(response.ok()).toBeTruthy();
        return await response.json();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to create lead after ${maxRetries} attempts. Last error: ${lastError.message}`);
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    throw lastError!;
  }

  // ✅ Incoming WhatsApp from GrowAasan
  async incomingWhatsapp_GrowAasan(
    randomPhone: string,
    messageText: string,
  ): Promise<string> {
    await this.initializeRequest();
    const url = `/${this.clientId}/${properties.GrowAasan}/whatsapps/whatsapp_handler`;

    const body = {
      customerMobile: `+91${randomPhone}`,
      messageText: messageText,
    };

    const response = await this.request.post(url, {
      data: body,
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status()).toBe(200);

    //console.log(`Incoming WhatsApp Created By GrowAasan >> ${randomPhone}`);
    return randomPhone;
  }

  // ✅ Incoming WhatsApp from ADZ
  async incomingWhatsapp_ADZ(randomPhone: string, messageText: string): Promise<string> {
    await this.initializeRequest();
    const url = `/${this.clientId}/${await this.getAdzWhatsappSettingsId()}/whatsapps/whatsapp_handler`;
    const body = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '',
                  phone_number_id: ''
                },
                contacts: [
                  {
                    profile: {
                      name: 'Playwright'
                    },
                    wa_id: `91${randomPhone}`
                  }
                ],
                messages: [
                  {
                    from: `91${randomPhone}`,
                    id: await this.utils.generateRandomString(100, { casing: 'lower', includeNumbers: true, includeSpecialChars: false }),
                    timestamp: '1736756456',
                    text: {
                      body: messageText
                    },
                    type: 'text'
                  }
                ]
              },
              field: 'messages'
            }
          ]
        }
      ]
    };

    const response = await this.request.post(url, {
      data: body,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    expect(response.status()).toBe(200);
    return randomPhone;
  }

  async sendIncomingMail(randomEmail: string): Promise<void> {
    await this.initializeRequest();

    const randomInt = await this.utils.generateRandomString(20, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
    const randomFileName = await this.utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
    const randomPassword = await this.utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
    const randomParagraph = await this.utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});

    const url = `/client/${this.clientId}/mails/mailgun/incoming_mail`;

    const body = {
      'Message-Id': `<PN0PR01MB${randomInt}F2568FAF9@PN0PR01MB6630.INDPRD01.PROD.OUTLOOK.COM>`,
      'recipient': `${properties.CampeignEmail}${properties.Domain}`,
      'sender': randomEmail,
      'Date': 'Mon, 27 Feb 2023 15:44:35 +0000',
      'To': `${properties.CampeignEmail}${properties.Domain} <${properties.CampeignEmail}${properties.Domain}>`,
      'subject': randomFileName,
      'token': `110e8343fe4c1e$452ec408aaede6b2e8${randomPassword}`,
      'timestamp': '1677512679',
      'from': `<${randomEmail}>`,
      'body-html': `<div>${randomParagraph}</div>`,
      'attachment-count': '0'
    };

    const response = await this.request.post(url, {
      form: body
    });

    expect(response.status()).toBe(200);
    //return await response.json();
  }


  // ✅ Send Email to Lead
  async sendEmailToLead(leadId: string, userEmail: string): Promise<void> {
    await this.initializeRequest();
    const finalLeadId = leadId.length > 10 ? leadId : await this.getLeadId(leadId);
    const url = `/client/leads/${finalLeadId}/emails.json`;
    const crmAPIUtils = new CRMAPIUtils(this.clientId, this.apiKey);
    const userTokenResponse = await crmAPIUtils.getUserToken(userEmail, properties.PASSWORD ?? "");
   
    const payload = {
      email: {
        lead_id: finalLeadId,
        email_template_type: "email_template",
        html_content: "test",
        subject: "test",
        project_id: "",
        asset_ids: ""
      },
      user_token: userTokenResponse,
      user_email: userEmail
    };
    
    const response = await this.request.post(url, {
      headers: {
        "Content-Type": "application/json"
      },
      data: payload,
    });
  
    const resBody = await response.json();
    
    if (!response.ok()) {
      throw new Error(`Failed to send email to lead. Status: ${response.status()}, Response: ${JSON.stringify(resBody)}`);
    }
    
    expect(response.status()).toBe(201);
  }

  // ✅ Send SMS to Lead
  async sendSmsToLead(
    leadId: string, 
    userEmail: string,
    content?: string, 
    templateId?: string, 
    projectId?: string
  ): Promise<void> {
    await this.initializeRequest();
    const finalLeadId = leadId.length > 10 ? leadId : await this.getLeadId(leadId);
    const url = `/client/leads/${finalLeadId}/smss.json`;
    const crmAPIUtils = new CRMAPIUtils(this.clientId, this.apiKey);
    const userTokenResponse = await crmAPIUtils.getUserToken(userEmail, properties.PASSWORD ?? "");
    
    const payload = {
      sms: {
        lead_id: finalLeadId,
        type: "sms",
        content: content,
        template_id: properties.SMS_Template_ID,
        project_id: projectId || ""
      },
      user_token: userTokenResponse,
      user_email: userEmail
    };
    
    const response = await this.request.post(url, {
      headers: {
        "Content-Type": "application/json"
      },
      data: payload,
    });
  
    const resBody = await response.json();
    
    if (!response.ok()) {
      throw new Error(`Failed to send SMS to lead. Status: ${response.status()}, Response: ${JSON.stringify(resBody)}`);
    }
    
    expect(response.status()).toBe(201);
  }

  // >> >> >> >> >> >> >> >> >> >> >> >> >> >> Get Lead Details APIS >> >> >> >> >> >> >> >> >> >> >> >> >> >>
  // ✅ Get Lead Activity
  async getLeadActivity(leadId: string, activityType: ActivityType): Promise<Record<string, any>> {
    await this.initializeRequest();
    const url = `/client/leads/${await this.getLeadId(leadId)}/activities.json`;

    const response = await this.request.get(url, {
      params: {
        'filters[_type]': activityType,
        page: '1',
        per_page: '50',
        client_id: this.clientId,
        api_key: this.apiKey,
      },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    expect(response.status()).toBe(200);
    return await response.json();
  }

  // ✅ Lead Retrieve
  async leadRetrieve(lead: string): Promise<any> {
    await this.initializeRequest();
    const url = `/api/leads/${lead.includes("@")?"email":"phone"}/retrieve_lead`;

    if (!lead.includes("@") && lead.trim().length > 10)
      lead = lead.replace("+", "").trim().slice(-10);

    const res = await this.request.get(url, {
      params: {
        api_key: this.apiKey,
        client_id: this.clientId,
        value: lead,
      },
    });
    return await res.json();
  }

   // ✅ Lead Retrieve
   async leadRetrieve_Phone(lead: string): Promise<any> {
    console.log(`Lead: ${lead}`);
    await this.initializeRequest();
    const url = `/client/support_dashboard/retrieve_leads.json`;
    const res = await this.request.get(url, {
      params: {
        api_key: this.apiKey,
        client_id: this.clientId,
        search: lead,
      },
    });
    return await res.json();
  }

  async leadRetrieveForDummyLead(lead: string, flagForDummyLead: boolean): Promise<any> {
    await this.initializeRequest();
    const url =`/api/leads/${lead.includes("@")?"email":"phone"}/retrieve_lead`;

    if (!lead.includes("@") && lead.trim().length > 10)
      lead = lead.replace("+", "").trim().slice(-10);

    const params = {
      api_key:this.apiKey,
      client_id:this.clientId,
      fetch_all_matching_leads:flagForDummyLead,
      value:lead,
    }
    const res = await this.request.get(url, {
      params: params,
    });
    return await res.json();
  }

  // ✅ Get Lead Details
  async getLeadDetails(leadDBID: string): Promise<any> {
    await this.initializeRequest();
    const id = leadDBID.length > 10 ? leadDBID : await this.getLeadId(leadDBID);
    const url = `/client/leads/${id}.json`;
    const res = await this.request.get(url, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
      },
    });
    return await res.json();
  }

  /** Provider value for ADZ Network Media WhatsApp integration. */
  private static readonly WHATSAPP_PROVIDER_ADZ_NETWORK_MEDIA = "WhatsappNotifier::ADZNetworkMedia";

  /**
   * Fetches WhatsApp settings and returns the `_id` of the ADZ Network Media configuration.
   * @throws Error when no entry has provider WhatsappNotifier::ADZNetworkMedia
   */
  private async getAdzWhatsappSettingsId(): Promise<string> {
    await this.initializeRequest();
    const url = `/client/whatsapp_settings.json`;
    const response = await this.request.get(url, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
      },
    });
    expect(response.status()).toBe(200);
    const settings = (await response.json()) as { _id: string; provider: string }[];
    const adz = settings.find(
      (s) => s.provider === LeadAPIUtils.WHATSAPP_PROVIDER_ADZ_NETWORK_MEDIA,
    );
    if (!adz) {
      throw new Error("adz configuration is not set for client");
    }
    return adz._id;
  }

  // ✅ Get Lead ID
  async getLeadId(leadCRMID: string): Promise<string> {
    await this.initializeRequest();
    if (leadCRMID.length < 9 && !leadCRMID.includes("@")) {
      const res = await this.request.get(`/client/get_db_id`, {
        params: {
          search: `#${leadCRMID.replace(/\D/g, "").trim()}`,
          client_id: this.clientId,
          api_key: this.apiKey,
        },
      });
      const json = await res.json();
      return json.id[0].trim();
    }else if(leadCRMID.includes("@") || (leadCRMID.length > 9 && leadCRMID.length < 12)){
      const res = await this.leadRetrieve(leadCRMID);
      return res.lead._id;
    }else{
      return leadCRMID;
    }
  }

  // ✅ Delete Lead
  async deleteLead(leadID: string): Promise<boolean> {
    await this.initializeRequest();
    const bulkActionAPIUtils = new BulkActionAPIUtils(this.clientId, this.apiKey);
    const url = `/client/support_dashboard/toggle_lead_active.json`;
    const res = await this.request.post(url, {
      multipart: {
        "lead_ids[]": leadID,
        reactivate: "false",
      },
      params: {
        api_key: this.apiKey,
        client_id: this.clientId,
      },
    });
    await bulkActionAPIUtils.waitTillLeadDeleteBulkJobDone();
    return res.ok();
  }

  // >> >> >> >> >> >> >> >> >> >> >> >> >> >> Reporting APIS >> >> >> >> >> >> >> >> >> >> >> >> >> >>

  // ✅ Get Touched Report
  async getTouchedReport(): Promise<Record<string, any>> {
    const DateRange = await this.utils.calculateFutureDate(AheadOf.Day, -6, "dd/MM/yyyy") + " 00:00:00 - "
    + await this.utils.calculateFutureDate(AheadOf.Day, 0, "dd/MM/yyyy") + " 23:59:59";
    //console.log(DateRange);
    const url = `/client/reports/touched-untouched.json`;
    const res = await this.request.post(url, {
      multipart: {
        current_user_id: properties.Sales_id ?? "",
        currently_in: "both",
        group_by: "sales",
        daterange: DateRange,
      },
      params: {
        api_key: this.apiKey,
        client_id: this.clientId,
      },
    });
    const body = await res.json();
    return body[properties.Sales_id ?? ""];
  }


  // // >> >> >> >> >> >> >> >> >> >> >> >> >> >> Update lead APIS >> >> >> >> >> >> >> >> >> >> >> >> >> >>

  async stageChange(leadId: string, stage: string, status: string): Promise<void> {
    const finalLeadId = leadId.length > 10 ? leadId : await this.getLeadId(leadId);
    const url = `/client/leads/${finalLeadId}.json`;

    const body = {
      lead: {
        stage: stage,
        status: status
      },
      last_stage_changed_on: new Date().getTime()
    };

    const response: APIResponse = await this.request.put(url, {
      headers: { 'Content-Type': 'application/json' },
      params: {
        api_key: this.apiKey,
        client_id: this.clientId
      },
      data: body
    });

    if (response.status() !== 200) {
      throw new Error(`Failed to update stage for lead ${leadId}. Status: ${response.status()}`);
    }
  }

  // ✅ Update User Created Tags
  async updateUserCreatedTags(leadId: string, tags: string[]): Promise<void> {
    const finalLeadId = leadId.length > 10 ? leadId : await this.getLeadId(leadId);
    const url = `/client/leads/${finalLeadId}.json`;

    const body = {
      user_created_tags: tags
    };

    const response: APIResponse = await this.request.put(url, {
      headers: { 'Content-Type': 'application/json' },
      params: {
        api_key: this.apiKey,
        client_id: this.clientId
      },
      data: body
    });

    if (response.status() !== 200) {
      throw new Error(`Failed to update user created tags for lead ${leadId}. Status: ${response.status()}`);
    }
  }

  // ✅ Get Leads with Search Criteria
  async getLeadsWithSearchCriteria(
    searchCriteriumId: string,
    userCreatedTags?: string,
    dateRange: string = this.utils.calculateFutureDate(AheadOf.Day, 0, "dd-MM-yyyy") + "to" + this.utils.calculateFutureDate(AheadOf.Day, 0, "dd-MM-yyyy"),
    page: number = 1,
    perPage: number = 50
  ): Promise<Record<string, any>> {
    await this.initializeRequest();
    const url = `/client/leads.json`;
    
    const params: Record<string, any> = {
      'search_criterium[id]': searchCriteriumId,
      'search_criterium[name]': 'all_leads',
      page: page,
      per_page: perPage,
      api_key: this.apiKey,
      client_id: this.clientId
    };

    if (userCreatedTags) {
      params['search_criterium[lead_attributes][user_created_tags]'] = userCreatedTags;
    }

    if (dateRange) {
      params['search_criterium[date_range]'] = `actual=${dateRange}`;
    }

    const response = await this.request.get(url, {
      params: params,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status() !== 200) {
      throw new Error(`Failed to get leads with search criteria. Status: ${response.status()}`);
    }

    return await response.json();
  }

  // ✅ Create Site Visit
  async scheduleSiteVisit(
    leadId: string,
    scheduledOn: string, // Format >> 2025-08-03 14:11 >> yyyy-MM-dd HH:mm
    endsOn: string,
    userEmail: string,
    projectId: string,
    isConducted: boolean ,
    agenda?: string,
    participants?: string,
    siteVisitType: string = "visit",
    teamId?: string,
    channelPartnerId?: string,
    projectUnitId?: string,
    confirmed: boolean = true,
    pickup: boolean = false,
  ): Promise<Record<string, any>> {
    await this.initializeRequest();
    const finalLeadId = leadId.length > 10 ? leadId : await this.getLeadId(leadId);
    const url = `/client/leads/${finalLeadId}/site_visits.json`;
    const crmAPIUtils = new CRMAPIUtils(this.clientId, this.apiKey);
    const userTokenResponse = await crmAPIUtils.getUserToken(userEmail, properties.PASSWORD ?? "");

    const payload = {
      site_visit: {
        lead_crm_id:leadId,
        scheduled_on: scheduledOn,
        ends_on: endsOn,
        participants: participants || "",
        sitevisit_type: siteVisitType,
        team_id: teamId || "",
        agenda: agenda,
        channel_partner_id: channelPartnerId || "",
        project_id: projectId || "",
        project_unit_id: projectUnitId || "",
        confirmed: confirmed.toString(),
        pickup: pickup,
        conducted_on: isConducted?scheduledOn:'',
        status: isConducted? 'conducted':'scheduled',
      },
      user_token: userTokenResponse,
      user_email: userEmail
    };
    const response = await this.request.post(url, {
      headers: {
        "Content-Type": "application/json"
      },
      data: payload
    });

    if (!response.ok()) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`Failed to create site visit. Status: ${response.status()}, Response: ${JSON.stringify(errorBody)}`);
    }

    expect(response.status()).toBe(201);
    return await response.json();
  }

  // ✅ Update Site Visit Status
  async updateSiteVisitStatus(
    siteVisitId: string,
    leadId: string,
    userEmail: string,
    action: SiteVisitAction
  ): Promise<Record<string, any>> {
    await this.initializeRequest();
    const finalLeadId = leadId.length > 10 ? leadId : await this.getLeadId(leadId);
    
    // First, get the existing site visit data
    const leadActivities = await this.getLeadActivity(finalLeadId, ActivityType.SiteVisit);
    const existingSiteVisit = leadActivities.results?.find(
      (activity: any) => activity.site_visit?._id === siteVisitId
    );

    if (!existingSiteVisit || !existingSiteVisit.site_visit) {
      throw new Error(`Site visit with ID ${siteVisitId} not found for lead ${leadId}`);
    }

    const existingSV = existingSiteVisit.site_visit;
    const crmAPIUtils = new CRMAPIUtils(this.clientId, this.apiKey);
    const userTokenResponse = await crmAPIUtils.getUserToken(userEmail, properties.PASSWORD ?? "");

    // Prepare the updated site visit object
    let updatedSiteVisit: Record<string, any> = {
      lead_id: finalLeadId,
      _id: siteVisitId,
      scheduled_on: existingSV.scheduled_on,
      ends_on: existingSV.ends_on,
      participants: existingSV.participants || "",
      sitevisit_type: existingSV.sitevisit_type || "visit",
      team_id: existingSV.team_id || "",
      agenda: existingSV.agenda || "",
      channel_partner_id: existingSV.channel_partner_id || "",
      project_id: existingSV.project_id || "",
      project_unit_id: existingSV.project_unit_id || "",
      confirmed: existingSV.confirmed?.toString() || "true",
      pickup: existingSV.pickup || false,
      booking_detail_id: existingSV.booking_detail_id || null,
      campaign_info: existingSV.campaign_info || {},
      created_at: existingSV.created_at,
      duplicate_lead_crm_id: existingSV.duplicate_lead_crm_id || null,
      duplicate_lead_id: existingSV.duplicate_lead_id || null,
      external_calendar_reference: existingSV.external_calendar_reference || {},
      external_participants: existingSV.external_participants || [],
      gps_tracking: existingSV.gps_tracking || {},
      initiated_by: existingSV.initiated_by || "",
      interested_property_id: existingSV.interested_property_id || null,
      is_starred: existingSV.is_starred || false,
      lead_crm_id: existingSV.lead_crm_id || leadId,
      notes: existingSV.notes || null,
      pickup_location: existingSV.pickup_location || null,
      pickup_time: existingSV.pickup_time || null,
      sales_id: existingSV.sales_id || "",
      google_calendar_invite: existingSV.google_calendar_invite || "",
      ms365_calendar_invite: existingSV.ms365_calendar_invite || "",
      zoom_calendar_invite: existingSV.zoom_calendar_invite || "",
      allow_calendar_resync: existingSV.allow_calendar_resync || null,
      starred_by_name: existingSV.starred_by_name || "",
      type: "site_visit"
    };

    // Update based on action
    switch (action) {
      case SiteVisitAction.Conducted:
        updatedSiteVisit.status = "conducted";
        updatedSiteVisit.conducted_on = new Date().toISOString();
        break;
      
      case SiteVisitAction.Missed:
        updatedSiteVisit.status = "missed";
        break;
      
      case SiteVisitAction.Dropped:
        updatedSiteVisit.status = "dropped";
        break;
      
      case SiteVisitAction.Rescheduled:
        updatedSiteVisit.status = "scheduled";
        // Calculate dates 5 days in future
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 5);
        
        // Parse existing scheduled_on to preserve time
        const existingScheduledOn = existingSV.scheduled_on;
        let scheduledTime = "19:00"; // Default time
        
        if (existingScheduledOn && typeof existingScheduledOn === 'string') {
          // Extract time from existing scheduled_on (format: "2025-11-12 19:51" or ISO)
          const timeMatch = existingScheduledOn.match(/(\d{2}):(\d{2})/);
          if (timeMatch) {
            scheduledTime = `${timeMatch[1]}:${timeMatch[2]}`;
          }
        }
        
        // Format as yyyy-MM-dd HH:mm
        const year = futureDate.getFullYear();
        const month = String(futureDate.getMonth() + 1).padStart(2, '0');
        const day = String(futureDate.getDate()).padStart(2, '0');
        updatedSiteVisit.scheduled_on = `${year}-${month}-${day} ${scheduledTime}`;
        
        // Calculate ends_on - preserve the duration between scheduled_on and ends_on
        const existingEndsOn = existingSV.ends_on;
        let endsOnTime: string;
        
        if (existingEndsOn && typeof existingEndsOn === 'string') {
          // Extract time from existing ends_on
          const endsOnTimeMatch = existingEndsOn.match(/(\d{2}):(\d{2})/);
          if (endsOnTimeMatch) {
            endsOnTime = `${endsOnTimeMatch[1]}:${endsOnTimeMatch[2]}`;
          } else {
            // Default: 15 minutes after scheduled time
            const [hours, minutes] = scheduledTime.split(':').map(Number);
            const endTime = new Date(futureDate);
            endTime.setHours(hours, minutes + 15, 0, 0);
            const endHours = String(endTime.getHours()).padStart(2, '0');
            const endMinutes = String(endTime.getMinutes()).padStart(2, '0');
            endsOnTime = `${endHours}:${endMinutes}`;
          }
        } else {
          // Default: 15 minutes after scheduled time
          const [hours, minutes] = scheduledTime.split(':').map(Number);
          const endTime = new Date(futureDate);
          endTime.setHours(hours, minutes + 15, 0, 0);
          const endHours = String(endTime.getHours()).padStart(2, '0');
          const endMinutes = String(endTime.getMinutes()).padStart(2, '0');
          endsOnTime = `${endHours}:${endMinutes}`;
        }
        
        updatedSiteVisit.ends_on = `${year}-${month}-${day} ${endsOnTime}`;
        break;
    }

    const url = `/client/leads/${finalLeadId}/site_visits/${siteVisitId}`;
    const payload = {
      site_visit: updatedSiteVisit,
      user_token: userTokenResponse,
      user_email: userEmail
    };

    const response = await this.request.put(url, {
      headers: {
        "Content-Type": "application/json"
      },
      data: payload
    });

    if (!response.ok()) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`Failed to update site visit status. Status: ${response.status()}, Response: ${JSON.stringify(errorBody)}`);
    }

    expect(response.status()).toBe(200);
    return await response.json();
  }

  // ✅ Schedule Followup
  async scheduleFollowup(
    leadId: string,
    scheduledOn: string, // Format >> 2025-08-04 11:26 >> yyyy-MM-dd HH:mm
    userEmail: string,
    followupType: FollowupType ,
    subject?: string,
    agenda?: string,
    fpAssignOption: string = "self"
  ): Promise<Record<string, any>> {
    await this.initializeRequest();
    const finalLeadId = leadId.length > 10 ? leadId : await this.getLeadId(leadId);
    const url = `/client/leads/${finalLeadId}/followups.json`;
    const crmAPIUtils = new CRMAPIUtils(this.clientId, this.apiKey);
    const userTokenResponse = await crmAPIUtils.getUserToken(userEmail, properties.PASSWORD ?? "");

    const payload = {
      followup: {
        lead_id: finalLeadId,
        status: "scheduled",
        subject: subject || "",
        agenda: agenda || "",
        scheduled_on: scheduledOn,
        followup_type: followupType
      },
      fp_assign_option: fpAssignOption,
      user_token: userTokenResponse,
      user_email: userEmail
    };

    const response = await this.request.post(url, {
      headers: {
        "Content-Type": "application/json"
      },
      data: payload
    });

    if (!response.ok()) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`Failed to schedule followup. Status: ${response.status()}, Response: ${JSON.stringify(errorBody)}`);
    }

    expect(response.status()).toBe(201);
    return await response.json();
  }

  // ✅ Conduct Followup
  async conductFollowup(
    leadId: string,
    followupId: string,
    userEmail: string,
    conductWithoutActivity: boolean = true
  ): Promise<Record<string, any>> {
    await this.initializeRequest();
    const finalLeadId = leadId.length > 10 ? leadId : await this.getLeadId(leadId);
    const url = `/client/leads/${finalLeadId}/followups/${followupId}.json`;
    const crmAPIUtils = new CRMAPIUtils(this.clientId, this.apiKey);
    const userTokenResponse = await crmAPIUtils.getUserToken(userEmail, properties.PASSWORD ?? "");

    const response = await this.request.put(url, {
      multipart: {
        conduct_without_activity: conductWithoutActivity.toString()
      },
      params: {
        user_token: userTokenResponse,
        user_email: userEmail
      }
    });

    if (!response.ok()) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`Failed to conduct followup. Status: ${response.status()}, Response: ${JSON.stringify(errorBody)}`);
    }

    expect(response.status()).toBe(200);
    return await response.json();
  }

  // ✅ Push to Sales
  async pushToSales(
    leadId: string,
    salesId: string,
    teamId: string,
  ): Promise<Record<string, any>> {
    await this.initializeRequest();
    const finalLeadId = leadId.length > 10 ? leadId : await this.getLeadId(leadId);
    const url = `/client/leads/${finalLeadId}/push_to_sales.json`;

    const response = await this.request.post(url, {
      multipart: {
        sales_id: salesId,
        team_id: teamId
      },
      params: {
        api_key: this.apiKey,
        client_id: this.clientId
      }
    });

    if (!response.ok()) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`Failed to push lead to sales. Status: ${response.status()}, Response: ${JSON.stringify(errorBody)}`);
    }

    await this.utils.print(`Lead ${leadId} pushed to sales ${salesId} and team ${teamId}`);
    expect(response.status()).toBe(200);
    return await response.json();
  }

  // ✅ Reassign Lead
  async reassignLead(
    leadId: string,
    teamId: string,
    salesId: string,
  ): Promise<Record<string, any>> {
    await this.initializeRequest();
    const finalLeadId = leadId.length > 10 ? leadId : await this.getLeadId(leadId);
    const url = `/client/leads/${finalLeadId}/reassign.json`;

    const response = await this.request.put(url, {
      multipart: {
        team_id: teamId,
        sales_id: salesId
      },
      params: {
        api_key: this.apiKey,
        client_id: this.clientId
      }
    });

    if (!response.ok()) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`Failed to reassign lead. Status: ${response.status()}, Response: ${JSON.stringify(errorBody)}`);
    }

    await this.utils.print(`Lead ${leadId} reassigned to team ${teamId} and sales ${salesId}`);
    expect(response.status()).toBe(200);
    return await response.json();
  }

  // ✅ Update Client Configuration - Score Increasable Flag
  async updateIncrementUserScoreFlag(
    isScoreIncreasable: boolean,
  ): Promise<Record<string, any>> {
    await this.initializeRequest();
    const url = `/client/configuration.json`;

    const response = await this.request.post(url, {
      multipart: {
        utf8: "✓",
        _method: "put",
        client_id: this.clientId,
        commit: "Save",
        "client_configuration[is_score_increasable]": isScoreIncreasable.toString()
      },
      params: {
        api_key: this.apiKey
      }
    });

    if (!response.ok()) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`Failed to update score increasable flag. Status: ${response.status()}, Response: ${JSON.stringify(errorBody)}`);
    }

    expect(response.status()).toBe(200);
    return await response.json();
  }

  // ✅ Add Secondary Sales Access
  async addSecondarySalesAccess(
    leadId: string,
    secondarySaleIds: string,
  ): Promise<Record<string, any>> {
    await this.initializeRequest();
    const finalLeadId = leadId.length > 10 ? leadId : await this.getLeadId(leadId);
    const url = `/client/leads/${finalLeadId}/add_secondary_sales`;

    const response = await this.request.patch(url, {
      data: `secondary_sale_ids[]=${secondarySaleIds}`,
      params: {
        api_key: this.apiKey,
        client_id: this.clientId
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok()) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`Failed to add secondary sales access. Status: ${response.status()}, Response: ${JSON.stringify(errorBody)}`);
    }

    expect(response.status()).toBe(200);
    return await response.json();
  }

  // ✅ Remove Secondary Sales Access
  // Sends empty array to clear all secondary sales access
  async removeSecondarySalesAccess(
    leadId: string,
  ): Promise<Record<string, any>> {
    await this.initializeRequest();
    const finalLeadId = leadId.length > 10 ? leadId : await this.getLeadId(leadId);
    const url = `/client/leads/${finalLeadId}/add_secondary_sales`;

    // Send empty array by not including any secondary_sale_ids values
    // Rails will interpret this as an empty array
    const response = await this.request.patch(url, {
      data: `secondary_sale_ids[]=`,
      params: {
        api_key: this.apiKey,
        client_id: this.clientId
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok()) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`Failed to remove secondary sales access. Status: ${response.status()}, Response: ${JSON.stringify(errorBody)}`);
    }

    expect(response.status()).toBe(200);
    return await response.json();
  }

  // ✅ Add Task to Lead with Custom API Key
  async addTaskToLeadWithAPIKey(
    leadCRMId: string,
    userEmail: string,
  ): Promise<void> {
    await this.initializeRequest();
    const crmAPIUtils = new CRMAPIUtils(this.clientId, this.apiKey);
    const userId = await crmAPIUtils.getUserId(userEmail);
    const token = await crmAPIUtils.getUserToken(userEmail, properties.PASSWORD ?? ""); 
    const leadDatabaseId = await this.getLeadId(leadCRMId);
    const dueOn = await this.utils.calculateFutureDate(AheadOf.Day,1,"yyyy-MM-dd HH:mm")+" IST" // yyyy-MM-dd'T'HH:mm:ss.SSS'Z' // 
    const url = `/client/users/${userId}/tasks/`;

    const payload = {
      title: 'Title',
      description: 'Description',
      assignee_id: userId,
      creator_id: userId,
      status: 'open',
      priority: 'medium',
      due_on: dueOn,
      taskable_id: leadDatabaseId,
      taskable_type: 'Lead',
      remark: 'rem',
      user_token: token,
      user_email: userEmail
    }

    try{
    const response = await this.request.post(url, {
      data:payload,
      headers: {
        "Content-Type": "application/json"
      },
    });

    if (!response.ok()) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`Failed to add task to lead. Status: ${response.status()}, Response: ${JSON.stringify(errorBody)}`);
    }
    expect(response.status()).toBe(201);
  }catch(error){}
  }

  // ✅ Add Booking on Lead
  async addBookingOnLead(
    leadId: string,
    leadEmail: string,
    projectID: string,
    unitID: string,
    bookingName: string,
    paymentScheduleId: string,
    schemeId: string,
  ): Promise<Record<string, any>> {
    await this.initializeRequest();
    const url = `/api/leads/add_booking.json`;

    const payload = {
      project_id: projectID,
      unit_id: unitID,
      booking_name: bookingName,
      lead_id: leadId,
      payment_schedule_id: paymentScheduleId,
      scheme_id: schemeId,
      unit_status: "booked",
      booking_date: await this.utils.calculateFutureDate(AheadOf.Day, 0, "dd/MM/yyyy hh:mm:ss"),
      stage: "tentative",
      email: leadEmail,
      api_key: this.apiKey,
      client_id: this.clientId
    };

    const response = await this.request.post(url, {
      data: payload,
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok()) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`Failed to add booking on lead. Status: ${response.status()}, Response: ${JSON.stringify(errorBody)}`);
    }

    expect(response.status()).toBe(201);
    return await response.json();
  }

  // To get reassigned to users count
  async getReassignedToUsersCount(sales: string, reassignedDirection: ReassignedDirection): Promise<number> {
    const URL = `/client/reports/reassigned-to.json`;
    await this.initializeRequest();
    const dateRange = await this.utils.calculateFutureDate(AheadOf.Day, -365, "dd/MM/yyyy")+" 00:00:00 - "+await this.utils.calculateFutureDate(AheadOf.Day, 0, "dd/MM/yyyy")+" 23:59:59";

    const req = await request.newContext();
    const response = await req.post(URL, {
      form: {
        reassigned_direction:reassignedDirection,
        "sales_ids[]": sales,
        daterange:dateRange,
        api_key:this.apiKey,
        client_id:this.clientId,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok()) {
      throw new Error(
        `Get reassigned to users count request failed: ${response.status()} - ${response.statusText()}`,
      );
    }

    expect(response.status()).toBe(200);
    const body = await response.json();
    return body[sales];
  }

  // ✅ Add Interested Projects to Lead
  async addInterestedProjectsToLead(
    leadCRMId: string,
    projectIds: string | string[],
    userEmail: string
  ): Promise<Record<string, any>> {
    await this.initializeRequest();
    const finalLeadId = leadCRMId.length > 10 ? leadCRMId : await this.getLeadId(leadCRMId);
    const url = `/client/leads/${finalLeadId}/interested_properties.json`;
    const crmAPIUtils = new CRMAPIUtils(this.clientId, this.apiKey);
    const userTokenResponse = await crmAPIUtils.getUserToken(userEmail, properties.PASSWORD ?? "");

    // Handle projectIds: convert to array if single string
    let projectIdsArray: string[];
    if (Array.isArray(projectIds)) {
      projectIdsArray = projectIds;
    } else {
      projectIdsArray = [projectIds];
    }

    // Build form data with array notation
    const formData: Record<string, any> = {
      user_token: userTokenResponse,
      user_email: userEmail,
      "interested_property_ids[]": projectIdsArray
    };

    const response = await this.request.post(url, {
      form: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok()) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`Failed to add interested projects to lead. Status: ${response.status()}, Response: ${JSON.stringify(errorBody)}`);
    }

    expect(response.status()).toBe(200);
    return await response.json();
  }

  // Property portal

  // ✅ Create Lead via Housing Pusher
  async createLeadViaHousingPusher(
    apiKey: string,
    email: string,
    phoneExtension: string,
    phoneNumber: string,
    projectName: string
  ): Promise<void> {
    await this.initializeRequest();
    
    // Generate random values
    const randomName = "Housing Pusher";
    const propertyPurpose = await this.utils.getRandomSubsetFromArray(["sale", "resale", "rental"]);
    const bedroomNum = await this.utils.getRandomSubsetFromArray(["2.5", "3.5", "4.5"]);
    const randomCity = await this.utils.pickRandomElementFromArray(["Pune", "Mumbai", "Delhi", "Bangalore", "Hyderabad"]);

    const payload = {
      name: randomName,
      email: email,
      isd: phoneExtension,
      mobile: phoneNumber,
      project: projectName,
      propertyPurpose: propertyPurpose,
      bedroomNum: bedroomNum,
      city: randomCity
    };

    const response = await this.request.post(`/api/leads/create.json`, {
      params: {
        api_key: apiKey
      },
      data: payload,
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status()).toBe(200);
  }

  // ✅ Create Lead via Roof and Floor
  async createLeadViaRoofAndFloor(
    apiKey: string,
    email: string,
    phone: string,
    projectName: string
  ): Promise<void> {
    await this.initializeRequest();
    
    // Generate random values
    const randomResponderName = "Roof and Floor";
    const randomComments = await this.utils.generateRandomString(20, { casing: 'mixed', includeNumbers: true, includeSpecialChars: false });
    const propertyPurpose = await this.utils.getRandomSubsetFromArray(["sale", "resale", "rental"]);
    const bedroomNum = await this.utils.getRandomSubsetFromArray(["2.5", "3.5", "4.5"]);

    const response = await this.request.post(`/api/leads/create.json`, {
      params: {
        api_key: apiKey,
        responderPhone: phone,
        responderEmail: email,
        projectName: projectName,
        responderName: randomResponderName,
        comments: randomComments,
        bedroomNum: bedroomNum,
        propertyPurpose: propertyPurpose
      },
    });

    expect(response.status()).toBe(200);
  }

  // ✅ Create Lead via MagicBricks
  async createLeadViaMagicBricks(
    apiKey: string,
    email: string,
    phoneExtension: string,
    phoneNumber: string,
    projectName: string
  ): Promise<void> {
    await this.initializeRequest();
    
    // Generate random values
    const randomName = "MagicBricks";
    const randomTime = `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
    const randomMsg = await this.utils.generateRandomString(15, { casing: 'mixed', includeNumbers: true, includeSpecialChars: false });
    const propertyPurpose = await this.utils.getRandomSubsetFromArray(["sale", "resale", "rental"]);
    const bedroomNum = await this.utils.getRandomSubsetFromArray(["2.5", "3.5", "4.5"]);

    const response = await this.request.post(`/api/leads/create`, {
      params: {
        api_key: apiKey,
        source: "MagicBricks",
        mobile: phoneNumber,
        email: email,
        time: randomTime,
        isd: phoneExtension,
        name: randomName,
        msg: randomMsg,
        project: projectName,
        propertyPurpose: propertyPurpose,
        bedroomNum: bedroomNum
      },
    });

    expect(response.status()).toBe(200);
  }

  // ✅ Create Lead via Commonfloor Pusher
  async createLeadViaCommonfloorPusher(
    apiKey: string,
    email: string,
    phone: string,
    projectName: string
  ): Promise<void> {
    await this.initializeRequest();
    
    // Generate random values
    const randomContactName = "Commonfloor";
    const randomCity = await this.utils.pickRandomElementFromArray(["pune", "mumbai", "delhi", "bangalore", "hyderabad"]);
    const randomDetails = await this.utils.generateRandomString(25, { casing: 'mixed', includeNumbers: true, includeSpecialChars: false });
    const propertyPurpose = await this.utils.getRandomSubsetFromArray(["sale", "resale", "rental"]);
    const bedroomNum = await this.utils.getRandomSubsetFromArray(["2.5", "3.5", "4.5"]);

    const payload = {
      contact_name: randomContactName,
      contact_mobile: phone,
      contact_email: email,
      city: randomCity,
      project_or_locality_name: projectName,
      details: randomDetails,
      propertyPurpose: propertyPurpose,
      bedroomNum: bedroomNum,
      api_key: apiKey
    };

    const response = await this.request.post(`/api/leads/create`, {
      data: payload,
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status()).toBe(200);
  }

  // ✅ Create Lead via 99acres
  async createLeadVia99Acres(
    apiKey: string,
    email: string,
    phone: string,
    projectName: string
  ): Promise<void> {
    await this.initializeRequest();
    
    // Generate random values
    const randomName = "99acres";
    const randomProdId = await this.utils.generateRandomString(8, { casing: 'upper', includeNumbers: true, includeSpecialChars: false });
    const randomProjectCode = await this.utils.generateRandomString(6, { casing: 'upper', includeNumbers: true, includeSpecialChars: false });
    const randomSubUserName = await this.utils.generateRandomString(15, { casing: 'mixed', includeNumbers: false, includeSpecialChars: false });
    const randomListingUrl = `www.99acres.com/${await this.utils.generateRandomString(7, { casing: 'lower', includeNumbers: true, includeSpecialChars: false })}`;
    const randomPreference = await this.utils.pickRandomElementFromArray(["S", "R"]);
    const randomResCom = await this.utils.pickRandomElementFromArray(["R", "C"]);
    const randomBedroomNum = await this.utils.pickRandomElementFromArray(["0", "1", "2", "3", "4", "5"]);
    const randomCityName = await this.utils.pickRandomElementFromArray(["Coimbatore", "Pune", "Mumbai", "Delhi", "Bangalore"]);
    
    // Format phone for XML (91-XXXXXXXXXX)
    const formattedPhone = phone;//phone.length === 10 ? `91-${phone}` : phone;
    
    // Get current date in format: YYYY-MM-DD HH:mm:ss
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const receivedOn = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    const xmlContent = `<Xml><Qry><QryType><![CDATA[]]></QryType><QryId><![CDATA[]]></QryId><CmpctLabl><![CDATA[]]></CmpctLabl><QryInfo><![CDATA[]]></QryInfo><RcvdOn><![CDATA[${receivedOn}]]></RcvdOn><ProdType><![CDATA[CS]]></ProdType><ProdId><![CDATA[${randomProdId}]]></ProdId><Name><![CDATA[${randomName}]]></Name><Email><![CDATA[${email}]]></Email><Phone><![CDATA[${formattedPhone}]]></Phone><PhoneVerificationStatus><![CDATA[VERIFIED]]></PhoneVerificationStatus><Identity><![CDATA[I]]></Identity><EmailVerificationStatus><![CDATA[UNVALIDATED]]></EmailVerificationStatus><ProjectCode><![CDATA[${randomProjectCode}]]></ProjectCode><ProjectName><![CDATA[${projectName}]]></ProjectName><SubUserName><![CDATA[${randomSubUserName}]]></SubUserName><listingurl><![CDATA[${randomListingUrl}]]></listingurl> <preference><![CDATA[${randomPreference}]]></preference> <resCom><![CDATA[${randomResCom}]]></resCom> <bedroomNum><![CDATA[${randomBedroomNum}]]></bedroomNum> <cityName><![CDATA[${randomCityName}]]></cityName> </Qry></Xml>`;

    const payload = {
      Xml: xmlContent,
      api_key: apiKey
    };

    const response = await this.request.post(`/api/leads/create_leads.json`, {
      data: payload,
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status()).toBe(200);
  }

  // ✅ Create Lead via Facebook
  async createLeadViaFacebook(
    email: string,
    phone: string
  ): Promise<void> {
    await this.initializeRequest();
    
    // Generate random values
    const randomUtmCampaign = await this.utils.generateRandomString(30, { casing: 'mixed', includeNumbers: true, includeSpecialChars: true });
    const randomUtmContent = await this.utils.generateRandomString(40, { casing: 'mixed', includeNumbers: true, includeSpecialChars: true });
    const randomUtmFormId = await this.utils.generateRandomString(16, { casing: 'lower', includeNumbers: true, includeSpecialChars: false });
    const randomUtmLeadId = await this.utils.generateRandomString(15, { casing: 'lower', includeNumbers: true, includeSpecialChars: false });
    const randomUtmGroupId = await this.utils.generateRandomString(18, { casing: 'lower', includeNumbers: true, includeSpecialChars: false });
    const randomUtmCampaignId = await this.utils.generateRandomString(18, { casing: 'lower', includeNumbers: true, includeSpecialChars: false });
    const randomBhk = await this.utils.pickRandomElementFromArray(["1bhk_-_50_lakh_onwards", "2bhk_-_80_lakh_onwards", "3bhk_-_1.20_cr_onwards", "4bhk_-_1.80_cr_onwards", "5bhk_-_2.50_cr_onwards"]);
    const randomPurpose = await this.utils.pickRandomElementFromArray(["within_1_month", "within_3-6_months", "within_6-12_months", "within_1-2_years", "beyond_2_years"]);
    const randomFirstName = await this.utils.generateRandomString(10, { casing: 'mixed', includeNumbers: false, includeSpecialChars: false });
    const randomCity = await this.utils.pickRandomElementFromArray(["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai", "Kolkata", "Dubai"]);
    const randomUtmId = await this.utils.generateRandomString(18, { casing: 'lower', includeNumbers: true, includeSpecialChars: false });
    const randomUtmTerm = await this.utils.generateRandomString(30, { casing: 'mixed', includeNumbers: true, includeSpecialChars: true });
    
    // Generate timestamp in format: 2025-06-16T06:31:40+0000
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const randomAddress2 = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+0000`;

    const payload = {
      client_id: this.clientId,
      api_key: properties.Facebook_API_Key,
      raw_data: {
        source: "",
        campaign_id: "",
        sub_source: "",
        name: null,
        email: email,
        phone: phone,
        utm_campaign: randomUtmCampaign,
        utm_source: "",
        utm_medium: null,
        utm_content: randomUtmContent,
        utm_page_id: null,
        utm_form_id: randomUtmFormId,
        utm_lead_id: randomUtmLeadId,
        utm_group_id: randomUtmGroupId,
        utm_campaign_id: randomUtmCampaignId,
        bhk: randomBhk,
        purpose: randomPurpose,
        first_name: randomFirstName,
        city: randomCity,
        utm_id: randomUtmId,
        utm_term: randomUtmTerm,
        address2: randomAddress2,
        zip: null,
        allow_reengagement: true
      }
    };

    const response = await this.request.post(`/api/leads/create.json`, {
      data: payload,
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status()).toBe(200);
  }

  /**
   * GET /client/configuration/ds/promotional_sms_mask.json — returns an array of `{ id, text }` masks.
   */
  private async getFirstPromotionalSmsMaskId(): Promise<string> {
    await this.initializeRequest();
    const url = `/client/configuration/ds/promotional_sms_mask.json`;
    const response = await this.request.get(url, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
      },
    });
    expect(response.status()).toBe(200);
    const masks = (await response.json()) as { id: string; text?: string }[];
    if (!Array.isArray(masks) || masks.length === 0 || !masks[0]?.id) {
      throw new Error(
        "promotional_sms_mask.json returned no entries or first entry has no id",
      );
    }
    return masks[0].id;
  }

  /**
   * Creates a lead by simulating an inbound SMS to the Oxygen short code for this client.
   * Loads the first promotional SMS mask id, then POSTs form data to `/short_code/oxygen/{maskId}`.
   * @param phone — sender number (e.g. country code + number, spaces allowed; they are stripped)
   * @returns response body text (expected to include "Thank you for your interest")
   */
  async createLeadViaIncomingSms(phone: string): Promise<string> {
    await this.initializeRequest();
    const maskId = await this.getFirstPromotionalSmsMaskId();
    const from = phone.replace(/\s+/g, "").trim();
    const url = `/short_code/oxygen/${encodeURIComponent(maskId)}`;
    const body = new URLSearchParams();
    body.set("from", from);
    body.set("message", "acme extra details about the enquiry");

    const response = await this.request.post(url, {
      data: body.toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain("Thank you for your interest");
    return text;
  }

}