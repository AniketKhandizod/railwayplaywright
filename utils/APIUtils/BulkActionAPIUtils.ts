import { expect, APIRequestContext, test } from "@playwright/test";
import { properties } from "../../properties/v2";
import { Utils } from "../PlaywrightTestUtils";
import { CRMAPIUtils } from "./CRMAPIUtils";
import { newPlaywrightApiContext } from "./newPlaywrightApiContext";

export class BulkActionAPIUtils {

  private readonly clientId: string;
  private readonly apiKey: string;
  private utils: Utils;
  private request: APIRequestContext;

  constructor(clientId: string, apiKey: string){
    this.clientId = clientId;
    this.apiKey = apiKey;
  }

  private async initializeRequest() {
    if (!this.request) {
      this.utils = new Utils();
      this.request = await newPlaywrightApiContext();
    }
  }

  async getImportIdForUnitImport(n: number = 0): Promise<string> {
    await this.initializeRequest();
  
    const response = await this.request.get(
      `/client/bulk_jobs.json?utf8=%E2%9C%93&commit=Apply&filters%5Bcreated_by%5D=&filters%5Bcreated_at%5D=&filters%5Bstatus%5D=&filters%5Bjob_type%5D=bulk_import_project_units&filters%5Bjob_id%5D=`,
      {
        params: {
          client_id: this.clientId,
          api_key: this.apiKey,
        },
      }
    );
  
    expect(response.ok()).toBeTruthy();
  
    const body = await response.json();
    this.utils.print(`Unit import status: ${JSON.stringify(body[n]?.status, null, 2)}`);
  
    return body[n]?.status?.trim() || "";
  }

  async getImportIdForUnitModifyImport(n: number = 0): Promise<string> {
    await this.initializeRequest();
  
    const response = await this.request.get(
      `/client/bulk_jobs.json?utf8=✓&commit=Apply&filters%5Bcreated_by%5D=&filters%5Bcreated_at%5D=&filters%5Bstatus%5D=&filters%5Bjob_type%5D=bulk_modify_project_units&filters%5Bjob_id%5D=`,
      {
        params: {
          client_id: this.clientId,
          api_key: this.apiKey,
        },
      }
    );
  
    expect(response.ok()).toBeTruthy();
  
    const body = await response.json();
    this.utils.print(`Unit import status: ${JSON.stringify(body[n]?.status, null, 2)}`);
  
    return body[n]?.status?.trim() || "";
  }

  async getLeadDeleteBulkJobStatus(n: number = 0): Promise<string> {
    await this.initializeRequest();
  
    const response = await this.request.get(
      `/client/bulk_jobs.json?utf8=✓&commit=Apply&filters%5Bcreated_by%5D=&filters%5Bcreated_at%5D=&filters%5Bstatus%5D=&filters%5Bjob_type%5D=lead_bulk_deletion&filters%5Bjob_id%5D=`,
      {
        params: {
          client_id: this.clientId,
          api_key: this.apiKey,
        },
      }
    );
  
    expect(response.ok()).toBeTruthy();
  
    const body = await response.json();
    this.utils.print(`Lead delete bulk job id: ${JSON.stringify(body[n]?.status, null, 2)}`);
  
    return body[n]?.status?.trim() || "";
  }

  // ✅ Get lead import status only
  async getImportStatus(): Promise<any> {
    await this.initializeRequest();
    const response = await this.request.get(`/client/bulk_uploads/leads.json`, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
      },
    });
    expect(response.ok()).toBeTruthy();
    return response.json();
  }

  // ✅ Get follow-up import status
  async getFollowupImportStatus(): Promise<any> {
    await this.initializeRequest();
    const response = await this.request.get(`/client/bulk_uploads/followups.json`, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
      },
    });
    expect(response.ok()).toBeTruthy();
    return response.json();
  }

  // ✅ Get SRD import status (latest bulk upload is first in `results`)
  async getSRDImportStatus(): Promise<any> {
    await this.initializeRequest();

    const response = await this.request.get(`/client/bulk_uploads/srds.json`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
      },
    });
    console.log("SRD Import Status Response:", await response);
    expect(response.ok()).toBeTruthy();
    return response.json();
  }

  // ✅ Get site visit import status
  async getSiteVisitImportStatus(): Promise<any> {
    await this.initializeRequest();
    const response = await this.request.get(`/client/bulk_uploads/site_visits.json`, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
      },
    });
    expect(response.ok()).toBeTruthy();
    return response.json();
  }

  // ✅ Get reassign lead import status >> Bulk Jobs
  async getReassignLeadImportStatus(): Promise<any> {
    await this.initializeRequest();
    const response = await this.request.get(`/client/bulk_jobs.json`, {
      params: {
        client_id: this.clientId,
        api_key: this.apiKey,
      },
    });
    expect(response.ok()).toBeTruthy();
    return response.json();
  }

  // ✅ Get import status by id >> Bulk Jobs
  async getImportStatusById(importID: string): Promise<any> {
    await this.initializeRequest();
    const response = await this.request.get(
     `/client/bulk_jobs/${importID}/fetch_bulk_job_progress.json`,
      {
        params: {
          client_id: this.clientId,
          api_key: this.apiKey,
        },
      },
    );
    expect(response.ok()).toBeTruthy();
    return await response.json();
  }

 // ✅ Wait till bulk reassign import done >> Bulk Jobs
 async waitTillBulkReassignImportDone(): Promise<string> {
  const inProgress = ["queue", "in_progress"];
  const completed = "completed";
  const timeout = 1 * 60 * 1000;
  const startTime = Date.now();
  let leadId = "";

  while (true) {
    const elapsed = Date.now() - startTime;
    if (elapsed > timeout)
      throw new Error("Timeout: Bulk reassign did not complete in time.");

    const data = await this.getReassignLeadImportStatus();
    const status = data[0].status.trim();

    if (inProgress.includes(status)) {
      await new Promise((res) => setTimeout(res, 2000));
      continue;
    } else if (status === completed) {
      await new Promise((res) => setTimeout(res, 2000));
      leadId = data[0].rc;

      break;
    } else {
      throw new Error(`❌ Invalid status: ${status}`);
    }
  }

  return leadId;
}

  // ✅ Wait till lead import done
  async waitTillLeadImportDone(): Promise<string> {
    test.setTimeout(2 * 60 * 1000);
    const inProgress = "in_progress";
    const uploaded = "uploaded";
    let leadId = "";

    while (true) {
      const data = await this.getImportStatus();
      const status = data.results[0].bulk_upload_status;

      if (status === inProgress) {
        await new Promise((res) => setTimeout(res, 2000));
        continue;
      } else if (status === uploaded) {
        await new Promise((res) => setTimeout(res, 2000));
        leadId = data.results[0].lead_ids[0];

        break;
      } else {
        throw new Error(`❌ Invalid status: ${status}`);
      }
    }

    return leadId;
  }

  // ✅ Wait till follow-up import done
  async waitTillFollowupImportDone(): Promise<string> {
    test.setTimeout(2 * 60 * 1000);
    const inProgress = "in_progress";
    const uploaded = "uploaded";
    let followupId = "";

    while (true) {
      const data = await this.getFollowupImportStatus();
      const status = data.results[0].bulk_upload_status;

      if (status === inProgress) {
        await new Promise((res) => setTimeout(res, 2000));
        continue;
      } else if (status === uploaded) {
        await new Promise((res) => setTimeout(res, 2000));
        followupId = data.results[0]._id;

        break;
      } else {
        throw new Error(`❌ Invalid follow-up import status: ${status}`);
      }
    }

    return followupId;
  }

  /**
   * Polls `GET /client/bulk_uploads/srds.json`, uses the first `results[0]` row (latest upload).
   * - Resolves when `bulk_upload_status === "uploaded"`.
   * - Throws if status is terminal failure (`error`, `failed`, `completed_with_error`, etc.).
   * - Stops with timeout after 2 minutes if `uploaded` is never reached.
   */
  async waitTillSRDImportDone(): Promise<string> {
    test.setTimeout(2 * 60 * 1000);
    const pollMs = 2000;
    const maxMs = 2 * 60 * 1000;
    const start = Date.now();

    const uploaded = "uploaded";
    const inProgress = "in_progress";
    const failureStatuses = new Set([
      "error",
      "failed",
      "completed_with_error",
      "completed with error",
    ]);

    let bulkUploadId = "";

    while (true) {
      if (Date.now() - start > maxMs) {
        throw new Error(
          "Timeout: SRD bulk import did not reach bulk_upload_status \"uploaded\" within 2 minutes.",
        );
      }

      const data = await this.getSRDImportStatus();
      const results = data?.results;
      if (!Array.isArray(results) || results.length === 0) {
        await new Promise((res) => setTimeout(res, pollMs));
        continue;
      }

      const first = results[0];
      const status = String(first?.bulk_upload_status ?? "").trim();
      const lower = status.toLowerCase();

      if (lower === uploaded) {
        await new Promise((res) => setTimeout(res, pollMs));
        bulkUploadId = String(first._id ?? "").trim();
        break;
      }

      if (failureStatuses.has(lower)) {
        throw new Error(`SRD bulk import failed: bulk_upload_status="${status}"`);
      }

      if (lower === inProgress || lower === "" || lower === "queued" || lower === "pending") {
        await new Promise((res) => setTimeout(res, pollMs));
        continue;
      }

      // Unknown intermediate status — keep polling until uploaded, failure, or timeout
      await new Promise((res) => setTimeout(res, pollMs));
    }

    await this.utils.print(`SRD bulk import done: bulk_upload_status="${status}"`);
    return bulkUploadId;
  }

  // ✅ Wait till site visit import done
  async waitTillSiteVisitImportDone(): Promise<string> {
    test.setTimeout(2 * 60 * 1000);
    const inProgress = "in_progress";
    const uploaded = "uploaded";
    let siteVisitId = "";

    while (true) {
      const data = await this.getSiteVisitImportStatus();
      const status = data.results[0].bulk_upload_status;

      if (status === inProgress) {
        await new Promise((res) => setTimeout(res, 2000));
        continue;
      } else if (status === uploaded) {
        await new Promise((res) => setTimeout(res, 2000));
        siteVisitId = data.results[0]._id;

        break;
      } else {
        throw new Error(`❌ Invalid site visit import status: ${status}`);
      }
    }

    return siteVisitId;
  }

    // ✅ Wait till unit import done
    async waitTillUnitImportDone(): Promise<string> {
      test.setTimeout(2 * 60 * 1000);
      const inProgress = "in_progress";
      const uploaded = "completed";
      const queued = "queue";
      let unitId = "";
  
      while (true) {
        const data = await this.getImportIdForUnitImport(0);
        const status = data;
  
        if (status === inProgress || status === queued) {
          await new Promise((res) => setTimeout(res, 2000));
          continue;
        } else if (status === uploaded) {
          await new Promise((res) => setTimeout(res, 2000));
          unitId = data;
  
          break;
        } else {
          throw new Error(`❌ Invalid status: ${status}`);
        }
      }
  
      return unitId;
    }

    async waitTillUnitModifyImportDone(): Promise<string> {
      test.setTimeout(2 * 60 * 1000);
      const inProgress = "in_progress";
      const uploaded = "completed";
      const queued = "queue";
      let unitId = "";
  
      while (true) {
        const data = await this.getImportIdForUnitModifyImport(0);
        const status = data;
  
        if (status === inProgress || status === queued) {
          await new Promise((res) => setTimeout(res, 2000));
          continue;
        } else if (status === uploaded) {
          await new Promise((res) => setTimeout(res, 2000));
          unitId = data;
  
          break;
        } else {
          throw new Error(`❌ Invalid status: ${status}`);
        }
      }
  
      return unitId;
    }

    async waitTillLeadDeleteBulkJobDone(): Promise<string> {
      test.setTimeout(2 * 60 * 1000);
      const inProgress = "in_progress";
      const uploaded = "completed";
      const queued = "queue";
      let leadId = "";
  
      while (true) {
        const data = await this.getLeadDeleteBulkJobStatus(0);
        const status = data;
  
        if (status === inProgress || status === queued) {
          await new Promise((res) => setTimeout(res, 2000));
          continue;
        } else if (status === uploaded) {
          await new Promise((res) => setTimeout(res, 2000));
          leadId = data;
  
          break;
        } else {
          throw new Error(`❌ Invalid status: ${status}`);
        }
      }
  
      return leadId;
    }

}
