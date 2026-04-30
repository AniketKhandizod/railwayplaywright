import { Utils, AheadOf } from "../../PlaywrightTestUtils";
import {faker} from "@faker-js/faker";
import { CreateHeaderForSiteVisitImport, SVStatus } from "../Constants/Sitevisit.Constants";
import { properties } from "../../env";
import { LeadAPIUtils } from "../../APIUtils/LeadAPIUtils";
import { XLUtils } from "../XLUtils";

export async function importSiteVisitWithAllColumns(): Promise<string> {
  const utils = new Utils();
  const filePath = await utils.generateExcelFile("SiteVisitImport", properties.ImportLocation ?? "./store");
  const xl = new XLUtils(filePath);
  xl.createFileWithHeader("Sheet1", CreateHeaderForSiteVisitImport);
  const fileCount = parseInt(String(properties.ImportCount ?? 1), 10);

  for (let i = 1; i <= fileCount; i++) {
    let col = 0;
    const selectedStatus = utils.pickRandomElementFromArray(SVStatus);
    const email = utils.generateRandomEmail();
    const phone = utils.generateRandomPhoneNumber();

    const leadId = (
      await new LeadAPIUtils(
        properties.Client_id ?? "",
        properties.FullAccess_API ?? "",
      ).createLeadWithDetails(phone, email)
    ).sell_do_lead_id;

    // Lead_crm_id
    xl.setCellData("Sheet1", i, col++, leadId);
    // Lead Email
    xl.setCellData("Sheet1", i, col++, utils.generateRandomEmail());
    // Lead Phone
    xl.setCellData("Sheet1", i, col++, `+91 ${utils.generateRandomPhoneNumber()}`);
    // Sales ID
    xl.setCellData("Sheet1", i, col++, properties.Sales_id ?? "");
    // Project Ids
    xl.setCellData("Sheet1", i, col++, properties.Project_id ?? "");

    let scheduledOn: string;
    let endsOn: string;
    if (selectedStatus === "scheduled") {
      scheduledOn = utils.calculateFutureDate(AheadOf.Day, 2, "dd/MM/yyyy-HH:mm:ss");
      endsOn = utils.calculateFutureDate(AheadOf.Day, 3, "dd/MM/yyyy-HH:mm:ss");
    } else {
      scheduledOn = utils.calculateFutureDate(AheadOf.Day, -3, "dd/MM/yyyy-HH:mm:ss");
      endsOn = utils.calculateFutureDate(AheadOf.Day, -2, "dd/MM/yyyy-HH:mm:ss");
    }

    // Scheduled on
    xl.setCellData("Sheet1", i, col++, scheduledOn);
    // Ends on
    xl.setCellData("Sheet1", i, col++, endsOn);
    // Agenda
    xl.setCellData("Sheet1", i, col++, faker.lorem.sentence());
    // Sitevisit status
    xl.setCellData("Sheet1", i, col++, selectedStatus);
    // Conducted on
    xl.setCellData("Sheet1", i, col++, selectedStatus === "conducted" ? scheduledOn : " ");
    // Notes
    xl.setCellData("Sheet1", i, col++, faker.lorem.sentence());
    // Pickup

    const pickup = utils.pickRandomElementFromArray(["yes", "no"]);
    xl.setCellData("Sheet1", i, col++, pickup);

    if (pickup === "yes") {
      const pickUpLocations = [properties.SVPickupLocation_1 ?? "", properties.SVPickupLocation_2 ?? ""];
      // Pickup location
      xl.setCellData("Sheet1", i, col++, utils.pickRandomElementFromArray(pickUpLocations));
      // Pickup time
      xl.setCellData("Sheet1", i, col++, utils.calculateFutureDate(AheadOf.Minute, 1, "dd/MM/yyyy-HH:mm:ss"));
    } else {
      xl.setCellData("Sheet1", i, col++, " ");
      xl.setCellData("Sheet1", i, col++, " ");
    }
    // Conducted by
    xl.setCellData("Sheet1", i, col++, selectedStatus === "conducted" ? (properties.PreSales_id ?? "") : "");
    // Project_Unit_Id
    xl.setCellData("Sheet1", i, col++, " "); // 
    // Site_Visit_Type
    xl.setCellData("Sheet1", i, col++, utils.pickRandomElementFromArray(["physical", "virtual"])); // Site_Visit_Type
  }

  return filePath;
}

