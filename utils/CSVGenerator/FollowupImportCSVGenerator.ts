import * as path from "path";
import { faker } from "@faker-js/faker";
import { CSVUtils } from "./CSVUtils";
import { Utils, AheadOf } from "../PlaywrightTestUtils";
import { properties } from "../../Environment/v2";
import { LeadAPIUtils } from "../APIUtils/LeadAPIUtils";
import { CreateHeaderForFollowupImport_allFields, FUStatus } from "../XLGenerator/Constants/FollowUp.Constants";
import { CRMAPIUtils } from "../APIUtils/CRMAPIUtils";

export class FollowupImportCSVGenerator {
  private readonly utils: Utils;
  private readonly leadApi: LeadAPIUtils;
  private readonly crmAPIUtils: CRMAPIUtils;

  constructor(clientId: string, FullAccess_API: string, RestrictedAccess_API: string) {
    this.utils = new Utils();
    this.leadApi = new LeadAPIUtils(clientId, FullAccess_API, RestrictedAccess_API);
    this.crmAPIUtils = new CRMAPIUtils(clientId, FullAccess_API);
  }

  // Java ref: FollowupXLfileGenerator.fileGenerate(int size, String ProjectID, String salesid, String apis)
  async fileGenerate(
    size: number,
    ProjectID: string,
    salesid: string,
    importFolder?: string,
  ): Promise<string> {
    const importDir = importFolder || properties.ImportLocation || "store/imports";
    const fileName = `FolloupImport ${await this.utils.generateRandomString(10)}.csv`;
    const filePath = path.join(process.cwd(), importDir, fileName);

    const csv = new CSVUtils(filePath);
    csv.createFileWithHeader(CreateHeaderForFollowupImport_allFields);

    const rows: string[][] = [];
    for (let i = 1; i <= size; i++) {
      const email = await this.utils.generateRandomEmail();
      const phone = await this.utils.generateRandomPhoneNumber(); // national 10-digit number

      // In Java: api.createLead(apis, salesid) -> sell_do_lead_id
      // TS equivalent: createLeadWithDetails with explicit projectId + salesid
      // `apis` is accepted to keep signature identical; not needed in current TS API util.
      const leadId = String(
        (await this.leadApi.createLeadWithDetails(phone, email, "Import Followup Lead", undefined, undefined, ProjectID, salesid))
          .sell_do_lead_id || "",
      );
  
      const FUStatuss = await this.utils.pickRandomElementFromArray(FUStatus);
      
      const scheduledOn = await this.utils.calculateFutureDate(AheadOf.Hour, 1, "dd/MM/yyyy-HH:mm:ss");

      const FUType = ["call", "whatsapp", "email"] as const;

      rows.push([
        leadId, // Lead_crm_id
        email, // Lead Email
        `+91 ${phone}`, // Lead Phone
        salesid.trim(), // Sales ID
        scheduledOn, // Scheduled on
        faker.lorem.sentence(), // Subject
        await this.utils.pickRandomElementFromArray([...FUType]), // Followup Type
        ProjectID, // Project Ids
        faker.lorem.sentence(), // Agenda
        FUStatuss, // Followup Status
       // actedOn, // Acted On
        " ", // Cancellation Reason
      ]);
    }

    csv.appendRows(rows);
    await this.utils.print(`Followup import file created at: ${filePath} for client "${(await this.crmAPIUtils.getSellDoClientDetails()).name}" with count: ${size}`);
    return filePath;
  }
}


