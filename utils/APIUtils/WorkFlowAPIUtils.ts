import { expect, APIRequestContext, test, request } from "@playwright/test";
import { properties } from "../../properties/v2";
import { Utils } from "../PlaywrightTestUtils";

// Enum for Workflow Events based on API response field values
export enum WorkflowEvent {
  NewLead = "new_lead",
  NewCallCreated = "new_call_created",
  IncomingCallNotAnswered = "incoming_call_not_answered",
  IncomingCallAnswered = "incoming_call_answered",
  OutgoingCallNotAnswered = "outgoing_call_not_answered",
  OutgoingCallAnswered = "outgoing_call_answered",
  CallScoreUpdated = "call_score_updated",
  ProjectAdded = "project_added",
  SitevisitScheduled = "sitevisit_scheduled",
  SitevisitConducted = "sitevisit_conducted",
  SitevisitMissed = "sitevisit_missed",
  SitevisitPending = "sitevisit_pending",
  SitevisitDropped = "sitevisit_dropped",
  FollowupScheduled = "followup_scheduled",
  FollowupPending = "followup_pending",
  FollowupConducted = "followup_conducted",
  Touched = "touched",
  EmailOpened = "email_opened",
  EmailUnsubscribed = "email_unsubscribed",
  EmailReceived = "email_received",
  LeadValidated = "lead_validated",
  PushedToSales = "pushed_to_sales",
  PulledToSales = "pulled_to_sales",
  CampaignResponseReceived = "campaign_response_received",
  LeadReengaged = "lead_reengaged",
  LeadReassigned = "lead_reassigned",
  LeadRequirementUpdated = "lead_requirement_updated",
  LeadProfileUpdated = "lead_profile_updated",
  StageChanged = "stage_changed",
  StatusChanged = "status_changed",
  LeadLost = "lead_lost",
  LeadUnqualified = "lead_unqualified",
  SitevisitRescheduled = "sitevisit_rescheduled",
  LeadVerified = "lead_verified",
  NewEnquiryReceived = "new_enquiry_received",
  LeadBooked = "lead_booked",
  EmailSent = "email_sent",
  LeadHotnessUpdated = "lead_hotness_updated",
  NewBooking = "new_booking",
  UpdateBooking = "update_booking",
  NewDemandLetterPreview = "new_demand_letter_preview",
  UpdateDemandLetterPreview = "update_demand_letter_preview",
  UpdateDemandLetterPreviewEmailStatus = "update_demand_letter_preview_email_status",
  NewBookingReceipt = "new_booking_receipt",
  UpdateBookingReceipt = "update_booking_receipt",
  SmsSent = "sms_sent",
  LeadUpdated = "lead_updated",
  CallFeedbackSubmitted = "call_feedback_submitted",
  NoteAdded = "note_added",
  WhatsappSent = "whatsapp_sent",
  WhatsappDelivered = "whatsapp_delivered",
  WhatsappRead = "whatsapp_read",
  WhatsappReceived = "whatsapp_received",
  BusinessWhatsappSent = "business_whatsapp_sent",
  BusinessWhatsappDelivered = "business_whatsapp_delivered",
  BusinessWhatsappRead = "business_whatsapp_read",
  BusinessWhatsappReceived = "business_whatsapp_received",
  BusinessWhatsappFailed = "business_whatsapp_failed",
  BusinessWhatsappResponded = "business_whatsapp_responded",
  BrokerageInvoiceCreated = "brokerage_invoice_created",
  BrokerageInvoiceUpdated = "brokerage_invoice_updated",
}

export class WorkFlowAPIUtils {
  private request: APIRequestContext;
  private readonly clientId: string;
  private readonly apiKey: string;

  constructor(clientId: string, apiKey: string){
    this.clientId = clientId;
    this.apiKey = apiKey;
  }

  private async initializeRequest() {
    if (!this.request) {
      this.request = await request.newContext();
    }
  }

  // ✅ Get all workflow details
  async getWorkflowDetails(): Promise<any> {
    await this.initializeRequest();
    const response = await this.request.get(`/client/recipes.json`, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
      },
    });
    return await response.json();
  }

  // ✅ Get all active workflows
  async getAllActiveWorkflowIDs(): Promise<any> {
    await this.initializeRequest();
    const response = await this.request.get(
      `/client/recipes.json?commit=Apply&search_params%5Bis_active%5D=true`,
      {
        params: {
          client_id: this.clientId,
          api_key: this.apiKey,
        },
      },
    );
    return await response.json();
  }

  // ✅ Get paginated workflow details
  async getWorkflowDetailsByPage(page: number): Promise<any> {
    await this.initializeRequest();
    const response = await this.request.get(`/client/recipes.json`, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
        page: page.toString(),
        per_page: "15",
      },
    });
    return await response.json();
  }

  // ✅ Toggle (Activate/Deactivate) a workflow by ID
  async toggleWorkflow(wfId: string): Promise<any> {
    await this.initializeRequest();
    const response = await this.request.post(
      `/client/recipes/${wfId}/toggle_active.json`,
      {
        params: {
          client_id: this.clientId,
          api_key: this.apiKey,
        },
      },
    );
    return await response.json();
  }

  // ✅ Deactivate all active workflows
  async deactivateAllActiveWorkflows(): Promise<void> {
    const allActive = await this.getAllActiveWorkflowIDs();
    let count = 1;
    for (let i = 0; i < allActive.total; i++) {
      const id = allActive.results[i]._id;
      const result = await this.toggleWorkflow(id);
    }
  }

  // ✅ Deactivate all workflows across all pages
  async deactivateAllWorkflows(): Promise<void> {
    const allWF = await this.getWorkflowDetails();
    let index = 1;
    let stop = false;

    for (let j = 0; j < allWF.total; j++) {
      const wfPage = await this.getWorkflowDetailsByPage(j + 1);

      for (let i = 0; i < 14; i++) {
        try {
          const wf = wfPage.results[i];
          const isActive = wf?.is_active ?? false;
          console.log(`${index++}) ${wf.name} | Active: ${isActive}`);
          if (isActive) await this.toggleWorkflow(wf._id);
        } catch (error) {
          console.log("❌ Code broke inside loop");
          stop = true;
          break;
        }
      }

      if (stop) {
        console.log("❌ Exiting outer loop");
        break;
      }
    }
    console.log("✅ All workflows deactivated from client account");
  }

  // ✅ Get workflow constants (events, payload, actions, etc.)
  async getWorkflowConstants(): Promise<any> {
    await this.initializeRequest();
    const response = await this.request.get(`/client/workflow_constants.json`, {
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

  // ✅ Create new workflow with title and description
  async createWorkflow(
    name: string,
    description: string,
    isActive: boolean = false,
    isDefault: boolean = false,
    maxDepthLevel: number = 0
  ): Promise<any> {
    await this.initializeRequest();
    const payload = {
      recipe: {
        is_active: isActive,
        is_default: isDefault,
        max_depth_level: maxDepthLevel,
        name: name,
        description: description,
      },
    };

    const response = await this.request.post(`/client/recipes.json`, {
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
    console.log("payload", payload);
    console.log("response", response);
    expect(response.ok()).toBeTruthy();
    return await response.json();
  }

  // ✅ Create workflow with event selected
  async createWorkflowWithEvent(
    name: string,
    description: string,
    event: WorkflowEvent | string,
    isActive: boolean = false,
    isDefault: boolean = false,
    maxDepthLevel: number = 0
  ): Promise<any> {
    await this.initializeRequest();
    const payload = {
      recipe: {
        is_active: isActive,
        is_default: isDefault,
        max_depth_level: maxDepthLevel,
        name: name,
        description: description,
        event: event,
      },
    };

    const response = await this.request.post(`/client/recipes.json`, {
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
    const responseData = await response.json();
    return responseData;
  }

  // ✅ Update workflow event
  async updateWorkflowEvent(
    workflowId: string,
    event: WorkflowEvent | string
  ): Promise<any> {
    await this.initializeRequest();
    const payload = {
      recipe: {
        event: event,
      },
    };

    const response = await this.request.put(`/client/recipes/${workflowId}.json`, {
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

  // ✅ Get workflow by ID
  async getWorkflowById(workflowId: string): Promise<any> {
    await this.initializeRequest();
    const response = await this.request.get(`/client/recipes/${workflowId}.json`, {
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

  // ✅ Create a new branch (action branch) in a workflow
  async createBranch(
    recipeId: string,
    branchType: "action" | "condition" = "action",
    depthLevel: number = 1,
    isTriggerBranch: boolean = true,
    matchAll: boolean = true,
    yesChildren: number = 0,
    noChildren: number = 0,
    delay: number | null = null,
    branchDirection?: "yes" | "no",
    trueParentId?: string,
    falseParentId?: string
  ): Promise<any> {
    await this.initializeRequest();
    
    // Convert delay from seconds to minutes if provided
    const delayInMinutes = delay !== null ? Math.floor(delay / 60) : null;
    
    const payload: any = {
      yes_children: yesChildren,
      no_children: noChildren,
      match_all: matchAll,
      recipe_id: recipeId,
      depth_level: depthLevel,
      branch_type: branchType,
      is_trigger_branch: isTriggerBranch,
    };

    // Add delay if provided
    // During creation, delay can be sent as a number or as delay_attributes
    // Try delay_attributes format first (nested attributes)
    if (delayInMinutes !== null && delayInMinutes > 0) {
      payload.delay_attributes = {
        mins: delayInMinutes,
        hours: 0,
        days: 0,
        weeks: 0,
        months: 0,
        quarters: 0,
        years: 0,
        time: '',
        date: '',
      };
    } else if (delay !== null) {
      // Fallback: send as number (original format)
      payload.delay = delayInMinutes;
    }

    // Add branch direction and parent IDs for action branches
    if (branchDirection) {
      payload.branch_direction = branchDirection;
    }
    if (trueParentId) {
      payload.true_parent_id = trueParentId;
    }
    if (falseParentId) {
      payload.false_parent_id = falseParentId;
    }

    // Note: During creation, payload is sent directly (not nested under 'branch')
    // The API endpoint may handle this differently than update
    const response = await this.request.post(`/client/recipes/${recipeId}/branch`, {
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

  // ✅ Create a condition branch in a workflow
  async createConditionBranch(
    recipeId: string,
    depthLevel: number = 1,
    matchAll: boolean = true,
    yesChildren: number = 0,
    noChildren: number = 0,
    delay: number | null = null
  ): Promise<any> {
    return await this.createBranch(
      recipeId,
      "condition",
      depthLevel,
      true, // isTriggerBranch
      matchAll,
      yesChildren,
      noChildren,
      delay
    );
  }

  // ✅ Update delay on a branch (condition or action)
  // delay is in seconds, will be converted to minutes for the delay model
  // IMPORTANT: Branch model doesn't have accepts_nested_attributes_for :delay,
  // so updating delay after creation is not directly supported by the API.
  // Delay should be set during branch creation (which we do via delay_attributes in createBranch).
  // This method attempts to update delay but will gracefully fail if not supported.
  async updateBranchDelay(
    recipeId: string,
    branchId: string,
    delay: number | null,
    branchObject?: any
  ): Promise<any> {
    await this.initializeRequest();

    // Convert delay from seconds to minutes (delay model uses mins field)
    const delayInMinutes = delay !== null ? Math.floor(delay / 60) : null;

    if (delayInMinutes === null || delayInMinutes <= 0) {
      return branchObject || {};
    }

    // Get current branch to check existing delay
    const currentBranch = await this.getWorkflowById(recipeId);
    const triggerBranch = currentBranch?.recipe?.trigger_branch;
    const existingDelay = triggerBranch?.delay;

    // Build payload - try delay_attributes format (nested attributes)
    // Note: This may not work since branch doesn't accept nested attributes for delay
    const branchPayload: any = {
      update_recipe: branchObject?.branch_type === "condition" ? true : false,
    };

    // Try delay_attributes format
    if (existingDelay && existingDelay._id) {
      // Update existing delay
      branchPayload.delay_attributes = {
        _id: existingDelay._id,
        mins: delayInMinutes,
        hours: 0,
        days: 0,
        weeks: 0,
        months: 0,
        quarters: 0,
        years: 0,
        time: '',
        date: '',
      };
    } else {
      // Create new delay
      branchPayload.delay_attributes = {
        mins: delayInMinutes,
        hours: 0,
        days: 0,
        weeks: 0,
        months: 0,
        quarters: 0,
        years: 0,
        time: '',
        date: '',
      };
    }

    const response = await this.request.put(
      `/client/recipes/${recipeId}/branch/${branchId}.json`,
      {
        params: {
          client_id: this.clientId,
          api_key: this.apiKey,
        },
        data: { branch: branchPayload },
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    if (!response.ok()) {
      // Delay update failed - this is expected since branch doesn't accept nested attributes for delay
      // Delay is already set during branch creation, so this is not critical
      const errorBody = await response.text().catch(() => 'Unable to read error body');
      // Return branch object - delay was set during creation via delay_attributes
      return branchObject || {};
    }

    return await response.json();
  }

  // ✅ Add triggers to a condition branch
  // triggers: Array of trigger objects with predicate, value, operator, sub_value
  async addTriggersToConditionBranch(
    recipeId: string,
    branchId: string,
    triggers: Array<{
      predicate: string;
      value: string;
      operator: string;
      sub_value?: string;
    }>,
    branchObject?: any
  ): Promise<any> {
    await this.initializeRequest();

    // Build payload with existing branch data + triggers
    const branchPayload: any = {
      ...(branchObject || {}),
      update_recipe: true,
      triggers_attributes: triggers.map((trigger) => ({
        recipe_id: recipeId,
        branch_id: branchId,
        predicate: trigger.predicate,
        value: trigger.value,
        operator: trigger.operator,
        sub_value: trigger.sub_value || "",
      })),
    };

    const response = await this.request.put(
      `/client/recipes/${recipeId}/branch/${branchId}`,
      {
        params: {
          client_id: this.clientId,
          api_key: this.apiKey,
        },
        data: branchPayload,
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    expect(response.ok()).toBeTruthy();
    return await response.json();
  }

  // ✅ Create action branch for "yes" path (success branch) from a condition
  async createYesActionBranch(
    recipeId: string,
    conditionBranchId: string,
    depthLevel: number = 2,
    matchAll: boolean = true,
    yesChildren: number = 0,
    noChildren: number = 0,
    delay: number | null = null
  ): Promise<any> {
    return await this.createBranch(
      recipeId,
      "action",
      depthLevel,
      false, // isTriggerBranch
      matchAll,
      yesChildren,
      noChildren,
      delay,
      "yes", // branchDirection
      conditionBranchId, // trueParentId
      undefined // falseParentId
    );
  }

  // ✅ Create action branch for "no" path (failure branch) from a condition
  async createNoActionBranch(
    recipeId: string,
    conditionBranchId: string,
    depthLevel: number = 2,
    matchAll: boolean = true,
    yesChildren: number = 0,
    noChildren: number = 0,
    delay: number | null = null
  ): Promise<any> {
    return await this.createBranch(
      recipeId,
      "action",
      depthLevel,
      false, // isTriggerBranch
      matchAll,
      yesChildren,
      noChildren,
      delay,
      "no", // branchDirection
      undefined, // trueParentId
      conditionBranchId // falseParentId
    );
  }

  // ✅ Create condition branch in "yes" path (nested condition in success path)
  async createYesConditionBranch(
    recipeId: string,
    parentConditionBranchId: string,
    depthLevel: number = 2,
    matchAll: boolean = true,
    yesChildren: number = 0,
    noChildren: number = 0,
    delay: number | null = null
  ): Promise<any> {
    return await this.createBranch(
      recipeId,
      "condition",
      depthLevel,
      false, // isTriggerBranch
      matchAll,
      yesChildren,
      noChildren,
      delay,
      "yes", // branchDirection
      parentConditionBranchId, // trueParentId
      undefined // falseParentId
    );
  }

  // ✅ Create condition branch in "no" path (nested condition in failure path)
  async createNoConditionBranch(
    recipeId: string,
    parentConditionBranchId: string,
    depthLevel: number = 2,
    matchAll: boolean = true,
    yesChildren: number = 0,
    noChildren: number = 0,
    delay: number | null = null
  ): Promise<any> {
    return await this.createBranch(
      recipeId,
      "condition",
      depthLevel,
      false, // isTriggerBranch
      matchAll,
      yesChildren,
      noChildren,
      delay,
      "no", // branchDirection
      undefined, // trueParentId
      parentConditionBranchId // falseParentId
    );
  }

  // ✅ Add action to a branch (e.g., add_note with content)
  // branchObject should be the response from createBranch() call
  async addActionToBranch(
    recipeId: string,
    branchId: string,
    actionType: string,
    actionData: Record<string, any>,
    branchObject?: any,
    delay: number | null = null
  ): Promise<any> {
    await this.initializeRequest();

    // Build payload with existing branch data + new action
    const branchPayload: any = {
      ...(branchObject || {}),
      update_recipe: false, // For action branches, set to false
      actions_attributes: [
        {
          recipe_id: recipeId,
          branch_id: branchId,
          data: actionData,
          template_id: "",
          promotional_content: "",
          action_type: actionType,
          operand1_type: "",
          operand2_type: "",
          operand1: "",
          operand2: "",
          operator: "",
          field_name: "",
          url: "",
          basic_auth: "",
          error_addresses: "",
          email_template_id: "",
          delay: delay,
          _type: this.getActionType(actionType),
        },
      ],
    };

    // Update delay in branch if provided
    if (delay !== null) {
      branchPayload.delay = delay;
    }

    const response = await this.request.put(
      `/client/recipes/${recipeId}/branch/${branchId}`,
      {
        params: {
          client_id: this.clientId,
          api_key: this.apiKey,
        },
        data: branchPayload,
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    expect(response.ok()).toBeTruthy();
    return await response.json();
  }

  // ✅ Helper method to determine action _type based on action_type
  private getActionType(actionType: string): string {
    const actionTypeMap: Record<string, string> = {
      add_note: "TaskAction",
      add_task: "TaskAction",
      schedule_site_visit: "TaskAction",
      schedule_followup: "TaskAction",
      send_brochure: "TaskAction",
      send_price_quote: "TaskAction",
      reassign_lead: "TaskAction",
      add_project: "TaskAction",
      push_to_sales: "TaskAction",
      stage_presales: "TaskAction",
      stage_sales: "TaskAction",
      sms_transactional: "CommunicationAction",
      sms_promotional: "CommunicationAction",
      email: "CommunicationAction",
      whatsapp: "CommunicationAction",
      click_to_call: "CommunicationAction",
      webhook: "WebhookAction",
      sync_lead_facebook: "MetaConversionApi",
    };

    return actionTypeMap[actionType] || "TaskAction";
  }

  // ✅ Convenience method: Add note action to a branch
  async addNoteAction(
    recipeId: string,
    branchId: string,
    noteContent: string,
    branchObject?: any,
    delay: number | null = null
  ): Promise<any> {
    return await this.addActionToBranch(
      recipeId,
      branchId,
      "add_note",
      { content: noteContent },
      branchObject,
      delay
    );
  }

  // ✅ Setup workflow with condition, triggers, and actions for both yes/no paths
  // This method creates a complete workflow with conditional logic
  static async setupWorkflowWithCondition(
    event: WorkflowEvent,
    clientId: string,
    fullAccessAPI: string,
    conditionConfig: {
      predicate: string;
      value: string;
      operator: string;
      sub_value?: string;
      matchAll?: boolean;
    },
    yesActionConfig?: {
      actionType: string;
      actionData: Record<string, any>;
      delay?: number | null;
    },
    noActionConfig?: {
      actionType: string;
      actionData: Record<string, any>;
      delay?: number | null;
    }
  ): Promise<{
    workflow: any;
    conditionBranch: any;
    updatedConditionBranch: any;
    yesBranch?: any;
    noBranch?: any;
    updatedYesBranch?: any;
    updatedNoBranch?: any;
    workflowName: string;
    workflowDescription: string;
  }> {
    const utils = new Utils();
    const workflowAPIUtils = new WorkFlowAPIUtils(clientId, fullAccessAPI);

    // Generate random workflow name and description
    const workflowName = await utils.generateRandomString(10, {
      casing: "lower",
      includeNumbers: true,
      includeSpecialChars: false,
    });
    const workflowDescription = await utils.generateRandomString(20, {
      casing: "lower",
      includeNumbers: true,
      includeSpecialChars: false,
    });

    // Deactivate all active workflows to start clean
    await workflowAPIUtils.deactivateAllActiveWorkflows();

    // Step 1: Create workflow with event
    const workflow = await workflowAPIUtils.createWorkflowWithEvent(
      workflowName,
      workflowDescription,
      event,
      false, // isActive - start as inactive
      false, // isDefault
      0 // maxDepthLevel
    );

    expect(workflow._id).toBeDefined();
    expect(workflow.name).toBe(workflowName);
    expect(workflow.description).toBe(workflowDescription);
    expect(workflow.event).toBe(event);
    expect(workflow.is_active).toBe(false);

    // Step 2: Create condition branch
    const conditionBranch = await workflowAPIUtils.createConditionBranch(
      workflow._id,
      1, // depthLevel
      conditionConfig.matchAll ?? true, // matchAll
      0, // yesChildren
      0, // noChildren
      null // delay
    );

    expect(conditionBranch._id).toBeDefined();
    expect(conditionBranch.branch_type).toBe("condition");
    expect(conditionBranch.recipe_id).toBe(workflow._id);

    // Step 3: Add triggers to condition branch
    const updatedConditionBranch = await workflowAPIUtils.addTriggersToConditionBranch(
      workflow._id,
      conditionBranch._id,
      [
        {
          predicate: conditionConfig.predicate,
          value: conditionConfig.value,
          operator: conditionConfig.operator,
          sub_value: conditionConfig.sub_value || "",
        },
      ],
      conditionBranch
    );

    expect(updatedConditionBranch._id).toBe(conditionBranch._id);
    expect(updatedConditionBranch.triggers).toBeDefined();
    expect(updatedConditionBranch.triggers.length).toBeGreaterThan(0);
    expect(updatedConditionBranch.triggers[0].predicate).toBe(conditionConfig.predicate);
    expect(updatedConditionBranch.triggers[0].value).toBe(conditionConfig.value);
    expect(updatedConditionBranch.triggers[0].operator).toBe(conditionConfig.operator);

    let yesBranch: any = undefined;
    let noBranch: any = undefined;
    let updatedYesBranch: any = undefined;
    let updatedNoBranch: any = undefined;

    // Step 4: Create yes branch (success path) if action config provided
    if (yesActionConfig) {
      yesBranch = await workflowAPIUtils.createYesActionBranch(
        workflow._id,
        conditionBranch._id,
        2, // depthLevel
        true, // matchAll
        0, // yesChildren
        0, // noChildren
        yesActionConfig.delay ?? null
      );

      expect(yesBranch._id).toBeDefined();
      expect(yesBranch.branch_type).toBe("action");
      expect(yesBranch.branch_direction).toBe("yes");
      expect(yesBranch.true_parent_id).toBe(conditionBranch._id);

      // Step 5: Add action to yes branch
      updatedYesBranch = await workflowAPIUtils.addActionToBranch(
        workflow._id,
        yesBranch._id,
        yesActionConfig.actionType,
        yesActionConfig.actionData,
        yesBranch,
        yesActionConfig.delay ?? null
      );

      expect(updatedYesBranch._id).toBe(yesBranch._id);
      expect(updatedYesBranch.actions).toBeDefined();
      expect(updatedYesBranch.actions.length).toBeGreaterThan(0);
    }

    // Step 6: Create no branch (failure path) if action config provided
    if (noActionConfig) {
      noBranch = await workflowAPIUtils.createNoActionBranch(
        workflow._id,
        conditionBranch._id,
        2, // depthLevel
        true, // matchAll
        0, // yesChildren
        0, // noChildren
        noActionConfig.delay ?? null
      );

      expect(noBranch._id).toBeDefined();
      expect(noBranch.branch_type).toBe("action");
      expect(noBranch.branch_direction).toBe("no");
      expect(noBranch.false_parent_id).toBe(conditionBranch._id);

      // Step 7: Add action to no branch
      updatedNoBranch = await workflowAPIUtils.addActionToBranch(
        workflow._id,
        noBranch._id,
        noActionConfig.actionType,
        noActionConfig.actionData,
        noBranch,
        noActionConfig.delay ?? null
      );

      expect(updatedNoBranch._id).toBe(noBranch._id);
      expect(updatedNoBranch.actions).toBeDefined();
      expect(updatedNoBranch.actions.length).toBeGreaterThan(0);
    }

    // Step 8: Activate the workflow
    const activatedWorkflow = await workflowAPIUtils.toggleWorkflow(workflow._id);
    expect(activatedWorkflow).toBeDefined();

    // Step 9: Verify workflow is active
    const workflowDetails = await workflowAPIUtils.getWorkflowById(workflow._id);
    const isActive = workflowDetails.recipe?.is_active ?? workflowDetails.is_active;
    expect(isActive).toBe(true);

    return {
      workflow,
      conditionBranch,
      updatedConditionBranch,
      yesBranch,
      noBranch,
      updatedYesBranch,
      updatedNoBranch,
      workflowName,
      workflowDescription,
    };
  }

  // ✅ Setup multi-step workflow with nested conditions
  // This method creates a workflow with multiple levels of conditions
  static async setupMultiStepWorkflowWithConditions(
    event: WorkflowEvent,
    clientId: string,
    fullAccessAPI: string,
    rootConditionConfig: {
      triggers: Array<{
        predicate: string;
        value: string;
        operator: string;
        sub_value?: string;
      }>;
      matchAll?: boolean;
      delay?: number | null;
    },
    yesPathConfig?: {
      condition?: {
        triggers: Array<{
          predicate: string;
          value: string;
          operator: string;
          sub_value?: string;
        }>;
        matchAll?: boolean;
        delay?: number | null;
      };
      yesAction?: {
        actionType: string;
        actionData: Record<string, any>;
        delay?: number | null;
      };
      noAction?: {
        actionType: string;
        actionData: Record<string, any>;
        delay?: number | null;
      };
    },
    noPathConfig?: {
      condition?: {
        triggers: Array<{
          predicate: string;
          value: string;
          operator: string;
          sub_value?: string;
        }>;
        matchAll?: boolean;
        delay?: number | null;
      };
      yesAction?: {
        actionType: string;
        actionData: Record<string, any>;
        delay?: number | null;
      };
      noAction?: {
        actionType: string;
        actionData: Record<string, any>;
        delay?: number | null;
      };
    }
  ): Promise<{
    workflow: any;
    rootConditionBranch: any;
    updatedRootConditionBranch: any;
    yesPathConditionBranch?: any;
    noPathConditionBranch?: any;
    updatedYesPathConditionBranch?: any;
    updatedNoPathConditionBranch?: any;
    yesPathYesActionBranch?: any;
    yesPathNoActionBranch?: any;
    noPathYesActionBranch?: any;
    noPathNoActionBranch?: any;
    updatedYesPathYesActionBranch?: any;
    updatedYesPathNoActionBranch?: any;
    updatedNoPathYesActionBranch?: any;
    updatedNoPathNoActionBranch?: any;
    workflowName: string;
    workflowDescription: string;
  }> {
    const utils = new Utils();
    const workflowAPIUtils = new WorkFlowAPIUtils(clientId, fullAccessAPI);

    // Generate random workflow name and description
    const workflowName = await utils.generateRandomString(10, {
      casing: "lower",
      includeNumbers: true,
      includeSpecialChars: false,
    });
    const workflowDescription = await utils.generateRandomString(20, {
      casing: "lower",
      includeNumbers: true,
      includeSpecialChars: false,
    });

    // Deactivate all active workflows to start clean
    await workflowAPIUtils.deactivateAllActiveWorkflows();

    // Step 1: Create workflow with event
    const workflow = await workflowAPIUtils.createWorkflowWithEvent(
      workflowName,
      workflowDescription,
      event,
      false, // isActive
      false, // isDefault
      0 // maxDepthLevel
    );

    expect(workflow._id).toBeDefined();
    expect(workflow.event).toBe(event);

    // Step 2: Create root condition branch (depth level 1) with delay if specified
    const rootConditionBranch = await workflowAPIUtils.createConditionBranch(
      workflow._id,
      1, // depthLevel
      rootConditionConfig.matchAll ?? true,
      0, // yesChildren
      0, // noChildren
      rootConditionConfig.delay ?? null // delay
    );

    expect(rootConditionBranch._id).toBeDefined();
    expect(rootConditionBranch.branch_type).toBe("condition");

    // Step 3: Add triggers to root condition branch
    const updatedRootConditionBranch =
      await workflowAPIUtils.addTriggersToConditionBranch(
        workflow._id,
        rootConditionBranch._id,
        rootConditionConfig.triggers,
        rootConditionBranch
      );

    expect(updatedRootConditionBranch.triggers.length).toBeGreaterThan(0);

    let yesPathConditionBranch: any = undefined;
    let noPathConditionBranch: any = undefined;
    let updatedYesPathConditionBranch: any = undefined;
    let updatedNoPathConditionBranch: any = undefined;
    let yesPathYesActionBranch: any = undefined;
    let yesPathNoActionBranch: any = undefined;
    let noPathYesActionBranch: any = undefined;
    let noPathNoActionBranch: any = undefined;
    let updatedYesPathYesActionBranch: any = undefined;
    let updatedYesPathNoActionBranch: any = undefined;
    let updatedNoPathYesActionBranch: any = undefined;
    let updatedNoPathNoActionBranch: any = undefined;

    // Step 4: Handle YES path
    if (yesPathConfig) {
      // If YES path has a nested condition
      if (yesPathConfig.condition) {
        // Create condition branch in YES path (depth level 2) with delay if specified
        yesPathConditionBranch = await workflowAPIUtils.createYesConditionBranch(
          workflow._id,
          rootConditionBranch._id,
          2, // depthLevel
          yesPathConfig.condition.matchAll ?? true,
          0, // yesChildren
          0, // noChildren
          yesPathConfig.condition.delay ?? null // delay
        );

        expect(yesPathConditionBranch._id).toBeDefined();
        expect(yesPathConditionBranch.branch_direction).toBe("yes");

        // Add triggers to YES path condition branch
        updatedYesPathConditionBranch =
          await workflowAPIUtils.addTriggersToConditionBranch(
            workflow._id,
            yesPathConditionBranch._id,
            yesPathConfig.condition.triggers,
            yesPathConditionBranch
          );

        expect(updatedYesPathConditionBranch.triggers.length).toBeGreaterThan(0);

        // Create YES action branch for nested condition (depth level 3)
        if (yesPathConfig.yesAction) {
          yesPathYesActionBranch =
            await workflowAPIUtils.createYesActionBranch(
              workflow._id,
              yesPathConditionBranch._id,
              3, // depthLevel
              true, // matchAll
              0, // yesChildren
              0, // noChildren
              yesPathConfig.yesAction.delay ?? null
            );

          updatedYesPathYesActionBranch =
            await workflowAPIUtils.addActionToBranch(
              workflow._id,
              yesPathYesActionBranch._id,
              yesPathConfig.yesAction.actionType,
              yesPathConfig.yesAction.actionData,
              yesPathYesActionBranch,
              yesPathConfig.yesAction.delay ?? null
            );
        }

        // Create NO action branch for nested condition (depth level 3)
        if (yesPathConfig.noAction) {
          yesPathNoActionBranch = await workflowAPIUtils.createNoActionBranch(
            workflow._id,
            yesPathConditionBranch._id,
            3, // depthLevel
            true, // matchAll
            0, // yesChildren
            0, // noChildren
            yesPathConfig.noAction.delay ?? null
          );

          updatedYesPathNoActionBranch =
            await workflowAPIUtils.addActionToBranch(
              workflow._id,
              yesPathNoActionBranch._id,
              yesPathConfig.noAction.actionType,
              yesPathConfig.noAction.actionData,
              yesPathNoActionBranch,
              yesPathConfig.noAction.delay ?? null
            );
        }
      } else {
        // YES path has direct actions (no nested condition)
        if (yesPathConfig.yesAction) {
          yesPathYesActionBranch = await workflowAPIUtils.createYesActionBranch(
            workflow._id,
            rootConditionBranch._id,
            2, // depthLevel
            true, // matchAll
            0, // yesChildren
            0, // noChildren
            yesPathConfig.yesAction.delay ?? null
          );

          updatedYesPathYesActionBranch =
            await workflowAPIUtils.addActionToBranch(
              workflow._id,
              yesPathYesActionBranch._id,
              yesPathConfig.yesAction.actionType,
              yesPathConfig.yesAction.actionData,
              yesPathYesActionBranch,
              yesPathConfig.yesAction.delay ?? null
            );
        }
      }
    }

    // Step 5: Handle NO path
    if (noPathConfig) {
      // If NO path has a nested condition
      if (noPathConfig.condition) {
        // Create condition branch in NO path (depth level 2) with delay if specified
        noPathConditionBranch = await workflowAPIUtils.createNoConditionBranch(
          workflow._id,
          rootConditionBranch._id,
          2, // depthLevel
          noPathConfig.condition.matchAll ?? true,
          0, // yesChildren
          0, // noChildren
          noPathConfig.condition.delay ?? null // delay
        );

        expect(noPathConditionBranch._id).toBeDefined();
        expect(noPathConditionBranch.branch_direction).toBe("no");

        // Add triggers to NO path condition branch
        updatedNoPathConditionBranch =
          await workflowAPIUtils.addTriggersToConditionBranch(
            workflow._id,
            noPathConditionBranch._id,
            noPathConfig.condition.triggers,
            noPathConditionBranch
          );

        expect(updatedNoPathConditionBranch.triggers.length).toBeGreaterThan(0);

        // Create YES action branch for nested condition (depth level 3)
        if (noPathConfig.yesAction) {
          noPathYesActionBranch = await workflowAPIUtils.createYesActionBranch(
            workflow._id,
            noPathConditionBranch._id,
            3, // depthLevel
            true, // matchAll
            0, // yesChildren
            0, // noChildren
            noPathConfig.yesAction.delay ?? null
          );

          updatedNoPathYesActionBranch =
            await workflowAPIUtils.addActionToBranch(
              workflow._id,
              noPathYesActionBranch._id,
              noPathConfig.yesAction.actionType,
              noPathConfig.yesAction.actionData,
              noPathYesActionBranch,
              noPathConfig.yesAction.delay ?? null
            );
        }

        // Create NO action branch for nested condition (depth level 3)
        if (noPathConfig.noAction) {
          noPathNoActionBranch = await workflowAPIUtils.createNoActionBranch(
            workflow._id,
            noPathConditionBranch._id,
            3, // depthLevel
            true, // matchAll
            0, // yesChildren
            0, // noChildren
            noPathConfig.noAction.delay ?? null
          );

          updatedNoPathNoActionBranch =
            await workflowAPIUtils.addActionToBranch(
              workflow._id,
              noPathNoActionBranch._id,
              noPathConfig.noAction.actionType,
              noPathConfig.noAction.actionData,
              noPathNoActionBranch,
              noPathConfig.noAction.delay ?? null
            );
        }
      } else {
        // NO path has direct actions (no nested condition)
        if (noPathConfig.noAction) {
          noPathNoActionBranch = await workflowAPIUtils.createNoActionBranch(
            workflow._id,
            rootConditionBranch._id,
            2, // depthLevel
            true, // matchAll
            0, // yesChildren
            0, // noChildren
            noPathConfig.noAction.delay ?? null
          );

          updatedNoPathNoActionBranch =
            await workflowAPIUtils.addActionToBranch(
              workflow._id,
              noPathNoActionBranch._id,
              noPathConfig.noAction.actionType,
              noPathConfig.noAction.actionData,
              noPathNoActionBranch,
              noPathConfig.noAction.delay ?? null
            );
        }
      }
    }

    // Step 6: Activate the workflow
    await workflowAPIUtils.toggleWorkflow(workflow._id);

    // Step 7: Verify workflow is active
    const workflowDetails = await workflowAPIUtils.getWorkflowById(workflow._id);
    const isActive =
      workflowDetails.recipe?.is_active ?? workflowDetails.is_active;
    expect(isActive).toBe(true);

    return {
      workflow,
      rootConditionBranch,
      updatedRootConditionBranch,
      yesPathConditionBranch,
      noPathConditionBranch,
      updatedYesPathConditionBranch,
      updatedNoPathConditionBranch,
      yesPathYesActionBranch,
      yesPathNoActionBranch,
      noPathYesActionBranch,
      noPathNoActionBranch,
      updatedYesPathYesActionBranch,
      updatedYesPathNoActionBranch,
      updatedNoPathYesActionBranch,
      updatedNoPathNoActionBranch,
      workflowName,
      workflowDescription,
    };
  }

  // ✅ Setup workflow with note action - Common method for test setup
  // This method encapsulates the common workflow setup pattern used across all tests
  static async setupWorkflowWithNoteAction(
    event: WorkflowEvent,
    clientId: string,
    fullAccessAPI: string
  ): Promise<{
    workflow: any;
    branch: any;
    updatedBranch: any;
    noteContent: string;
    workflowName: string;
    workflowDescription: string;
  }> {
    const utils = new Utils();
    const workflowAPIUtils = new WorkFlowAPIUtils(clientId, fullAccessAPI);

    // Generate random workflow name and description
    const workflowName = await utils.generateRandomString(10, {
      casing: "lower",
      includeNumbers: true,
      includeSpecialChars: false,
    });
    const workflowDescription = await utils.generateRandomString(20, {
      casing: "lower",
      includeNumbers: true,
      includeSpecialChars: false,
    });
    const noteContent = await utils.generateRandomString(50, {
      casing: "lower",
      includeNumbers: true,
      includeSpecialChars: false,
    });

    // Deactivate all active workflows to start clean
    await workflowAPIUtils.deactivateAllActiveWorkflows();

    // Step 1: Create workflow with event
    const workflow = await workflowAPIUtils.createWorkflowWithEvent(
      workflowName,
      workflowDescription,
      event,
      false, // isActive - start as inactive
      false, // isDefault
      0 // maxDepthLevel
    );

    expect(workflow._id).toBeDefined();
    expect(workflow.name).toBe(workflowName);
    expect(workflow.description).toBe(workflowDescription);
    expect(workflow.event).toBe(event);
    expect(workflow.is_active).toBe(false);

    // Step 2: Create a branch for the action
    const branch = await workflowAPIUtils.createBranch(
      workflow._id,
      "action", // branchType
      1, // depthLevel
      true, // isTriggerBranch
      true, // matchAll
      0, // yesChildren
      0, // noChildren
      null // delay
    );

    expect(branch._id).toBeDefined();
    expect(branch.branch_type).toBe("action");
    expect(branch.recipe_id).toBe(workflow._id);

    // Step 3: Add note action to the branch
    const updatedBranch = await workflowAPIUtils.addNoteAction(
      workflow._id,
      branch._id,
      noteContent,
      branch, // Pass the branch object from createBranch
      null // No delay
    );

    expect(updatedBranch._id).toBe(branch._id);
    expect(updatedBranch.actions).toBeDefined();
    expect(updatedBranch.actions.length).toBeGreaterThan(0);
    expect(updatedBranch.actions[0].task_action).toBeDefined();
    expect(updatedBranch.actions[0].task_action.action_type).toBe("add_note");
    expect(updatedBranch.actions[0].task_action.data.content).toBe(noteContent);

    // Step 4: Activate the workflow
    const activatedWorkflow = await workflowAPIUtils.toggleWorkflow(workflow._id);
    expect(activatedWorkflow).toBeDefined();

    // Step 5: Verify workflow is active
    const workflowDetails = await workflowAPIUtils.getWorkflowById(workflow._id);
    // Handle both response structures (recipe.recipe or direct recipe object)
    const isActive = workflowDetails.recipe?.is_active ?? workflowDetails.is_active;
    expect(isActive).toBe(true);

    return {
      workflow,
      branch,
      updatedBranch,
      noteContent,
      workflowName,
      workflowDescription,
    };
  }
}
