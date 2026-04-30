import * as path from "path";
import { properties } from "../../Environment/v2";
import { CSVUtils } from "./CSVUtils";
import { Utils } from "../PlaywrightTestUtils";
import { LeadAPIUtils } from "../APIUtils/LeadAPIUtils";

/** Mirrors Java `ImportLeadReassingmet.pickFile()` — bulk reassign import CSV. */
export class BulkReassignLeadImportCSVGenerator {
  private readonly utils: Utils;
  private readonly leadApi: LeadAPIUtils;

  constructor(clientId: string, fullAccessApi: string, restrictedAccessApi: string) {
    this.utils = new Utils();
    this.leadApi = new LeadAPIUtils(clientId, fullAccessApi, restrictedAccessApi);
  }

  /**
   * Creates `ReassignLeadImport*.csv` with header
   * `Lead-Id/Email/Phone`, `Sales-Id/sales-email`, creates leads via API, and for each row
   * picks at random among CRM id / email / phone for column 1 (same as Java `getRandomNumber(0, ary.length)`).
   */
  async bulkReassignLeadImportCsvGenerator(options: {
    rowCount: number;
    /** Sales user id when creating leads (Java: BulkReassingUserToCreateLeadId). */
    createLeadSalesId: string;
    /** Second column: target sales id for the import (Java: BulkReassingUserToAssignLeadId). */
    csvSalesIdColumn: string;
    importFolder?: string;
  }): Promise<{
    filePath: string;
    leads: Array<{
      sellDoLeadId: string;
      email: string;
      phone: string;
      /** Value written in column 1 of the CSV for this row. */
      leadIdentifierInFile: string;
    }>;
  }> {
    const importDir = options.importFolder || properties.ImportLocation || "store";
    const fileName = `ReassignLeadImport ${await this.utils.generateRandomString(10)}.csv`;
    const filePath = path.join(process.cwd(), importDir, fileName);

    const csv = new CSVUtils(filePath);
    csv.createFileWithHeader(["Lead-Id/Email/Phone", "Sales-Id/sales-email"]);

    const leads: Array<{
      sellDoLeadId: string;
      email: string;
      phone: string;
      leadIdentifierInFile: string;
    }> = [];

    const rows: string[][] = [];
    for (let i = 0; i < options.rowCount; i++) {
      const phone = await this.utils.generateRandomPhoneNumber();
      const email = await this.utils.generateRandomEmail();
      const created = await this.leadApi.createLeadWithDetails(
        phone,
        email,
        "Bulk reassign import",
        "",
        "",
        "",
        options.createLeadSalesId,
        "",
      );
      const sellDoLeadId = String(created?.sell_do_lead_id ?? "");
      const ary = [sellDoLeadId, email, phone];
      const col1 = await this.utils.pickRandomElementFromArray(ary);
      rows.push([col1, options.csvSalesIdColumn]);
      leads.push({
        sellDoLeadId,
        email,
        phone,
        leadIdentifierInFile: col1,
      });
    }
    csv.appendRows(rows);

    return { filePath, leads };
  }
}
