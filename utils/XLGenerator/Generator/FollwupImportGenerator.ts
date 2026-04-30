import { XLUtils } from "../XLUtils";
import { Utils, AheadOf } from "../../PlaywrightTestUtils";
import {faker} from "@faker-js/faker";
import { CreateHeaderForFollowupImport_allFields, FUStatus } from "../Constants/FollowUp.Constants";
import { properties } from "../../env";
import { LeadAPIUtils } from "../../APIUtils/LeadAPIUtils";

export async function importFollowupWithAllColumns(): Promise<string> {
  const sheetName = "sheet 1";
    const utils = new Utils();
    const filePath = await utils.generateExcelFile("FolloupImport", properties.ImportLocation ?? "./store", sheetName);
    const xl = new XLUtils(filePath);
    xl.createFileWithHeader(sheetName, CreateHeaderForFollowupImport_allFields);

    const fileCount = parseInt(String(properties.ImportCount ?? 1), 10);
    for (let i = 1; i <= fileCount; i++) {
      let row = 0;

      const salesid = properties.Sales_id ?? "";
      const email = utils.generateRandomEmail();
      const phone = utils.generateRandomPhoneNumber();
      const projectId = properties.Project_id ?? "";

      
      const FUStatuss = utils.pickRandomElementFromArray(FUStatus);
      const leadId = (
        await new LeadAPIUtils(
          properties.Client_id ?? "",
          properties.FullAccess_API ?? "",
        ).createLeadWithDetails(phone, email)
      ).sell_do_lead_id;

      // Lead_crm_id
      xl.setCellData(sheetName, i, row++, leadId);
      // Lead Email
      xl.setCellData(sheetName, i, row++, email);
      // Lead Phone
      xl.setCellData(sheetName, i, row++, `+91 ${phone}`);
      // Sales ID
      xl.setCellData(sheetName, i, row++, salesid.trim());
      // Scheduled on
      xl.setCellData(sheetName, i, row++, utils.calculateFutureDate(AheadOf.Hour, 1, 'dd/MM/yyyy-HH:mm:ss'));
      // Subject
      xl.setCellData(sheetName, i, row++, faker.lorem.sentence());
      // Followup Type
      const FUType = ['call', 'whatsapp', 'email'];
      xl.setCellData(sheetName, i, row++, utils.pickRandomElementFromArray(FUType));
      // Project Ids
      xl.setCellData(sheetName, i, row++, projectId);
      // Agenda
      xl.setCellData(sheetName, i, row++, faker.lorem.sentence());
      // Followup Status
      xl.setCellData(sheetName, i, row++, FUStatuss);
      // Acted On
      xl.setCellData(sheetName, i, row++, utils.calculateFutureDate(AheadOf.Hour, 0, 'dd/MM/yyyy-HH:mm:ss'));
      // Cancellation Reason
      xl.setCellData(sheetName, i, row++, ' ');

    }
    return filePath;
  }

