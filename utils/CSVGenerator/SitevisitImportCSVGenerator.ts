import * as path from "path";
import { faker } from "@faker-js/faker";
import { CSVUtils } from "./CSVUtils";
import { Utils, AheadOf } from "../PlaywrightTestUtils";
import { properties } from "../../properties/v2";
import { LeadAPIUtils } from "../APIUtils/LeadAPIUtils";
import { CreateHeaderForSiteVisitImport } from "../XLGenerator/constants/Sitevisit.Constants";
import { CRMAPIUtils } from "../APIUtils/CRMAPIUtils";

export class SitevisitImportCSVGenerator {
  private readonly utils: Utils;
  private readonly leadApi: LeadAPIUtils;
  private readonly crmAPIUtils: CRMAPIUtils;

  constructor(clientId: string, FullAccess_API: string, RestrictedAccess_API: string) {
    this.utils = new Utils();
    this.leadApi = new LeadAPIUtils(clientId, FullAccess_API, RestrictedAccess_API);
    this.crmAPIUtils = new CRMAPIUtils(clientId, FullAccess_API);
  }

  // Java ref: SiteVisitXLFileGenerator.FileGeneratorForSiteVisit(int size, String projectID, String salesId, String apis)
  async FileGeneratorForSiteVisit(
    size: number,
    projectID: string,
    salesId: string,
    importFolder?: string,
  ): Promise<string> {
    const importDir = importFolder || properties.ImportLocation || "store/imports";
    const fileName = `SiteVisitImport ${await this.utils.generateRandomString(10)}.csv`;
    const filePath = path.join(process.cwd(), importDir, fileName);

    const csv = new CSVUtils(filePath);
    csv.createFileWithHeader(CreateHeaderForSiteVisitImport);

    // Java hard-codes only "scheduled" in SVStatus[] for this generator
    const selectedStatus = "scheduled";

    const rows: string[][] = [];
    for (let i = 1; i <= size; i++) {
      const email = await this.utils.generateRandomEmail();
      const phone = await this.utils.generateRandomPhoneNumber(); // national 10-digit

      // In Java: api.createLead(apis, salesId) -> sell_do_lead_id
      // TS equivalent: createLeadWithDetails; `apis` is accepted to keep signature identical.
      const leadId = String(
        (await this.leadApi.createLeadWithDetails(phone, email, "Import Site Visit Lead", undefined, undefined, projectID, salesId))
          .sell_do_lead_id || "",
      );

      const scheduledOn = await this.utils.calculateFutureDate(AheadOf.Day, 2, "dd/MM/yyyy-HH:mm:ss");
      const endsOn = await this.utils.calculateFutureDate(AheadOf.Day, 3, "dd/MM/yyyy-HH:mm:ss");

      const pickup = await this.utils.pickRandomElementFromArray(["yes", "no"]);
      let pickupLocation = " ";
      let pickupTime = " ";
      if (pickup === "yes") {
        pickupLocation = await this.utils.pickRandomElementFromArray([properties.SVPickupLocation_1, properties.SVPickupLocation_2]);
        pickupTime = await this.utils.calculateFutureDate(AheadOf.Minute, 1, "dd/MM/yyyy-HH:mm:ss");
      }

      // Java: when scheduled -> conducted_by = ""
      const conductedBy = "";

      const siteVisitType = await this.utils.pickRandomElementFromArray(["visit", "home_visit", "online_walkthrough"]);

      rows.push([
        leadId, // Lead_crm_id
        email, // Lead Email
        `+91 ${phone}`, // Lead Phone
        salesId, // Sales ID
        projectID, // Project Ids
        scheduledOn, // Scheduled on
        endsOn, // Ends on
        faker.lorem.sentence(), // Agenda
        selectedStatus, // Sitevisit status
        " ", // conducted on (scheduled -> blank)
        faker.lorem.sentence(), // Notes
        pickup, // pickup
        pickupLocation, // pickup location
        pickupTime, // pickup time
        conductedBy, // conducted_by
        " ", // Project_Unit_Id
        siteVisitType, // Site_Visit_Type
      ]);
    }

    csv.appendRows(rows);
    await this.utils.print(`Site visit import file created at: ${filePath} for client "${(await this.crmAPIUtils.getSellDoClientDetails()).name}" with count: ${size}`);
    return filePath;
  }
}

