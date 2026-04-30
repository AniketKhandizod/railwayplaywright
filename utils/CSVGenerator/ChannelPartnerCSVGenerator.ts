import * as path from "path";
import { faker } from "@faker-js/faker";
import { CSVUtils } from "./CSVUtils";
import { Utils } from "../PlaywrightTestUtils";
import { properties } from "../env";
import { CRMAPIUtils } from "../APIUtils/CRMAPIUtils";
import {
  CreateHeaderForChannelPartnerImport_allFields,
  defaultChannelPartnerProjectId,
} from "../XLGenerator/Constants/ChannelPartner.Constants";

function generatePan(): string {
  const letters = faker.string.alpha({ length: 5, casing: "upper" });
  const digits = faker.string.numeric(4);
  const last = faker.string.alpha({ length: 1, casing: "upper" });
  return `${letters}${digits}${last}`;
}

function toDdMmYyyy(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function randomBooleanString(): string {
  return Math.random() < 0.5 ? "true" : "false";
}

export class ChannelPartnerCSVGenerator {
  private readonly utils: Utils;
  private readonly crmAPIUtils: CRMAPIUtils;

  constructor(clientId: string, FullAccess_API: string) {
    this.utils = new Utils();
    this.crmAPIUtils = new CRMAPIUtils(clientId, FullAccess_API);
  }

  /**
   * Generates a channel partner import CSV with fixed headers and random row data.
   * Pattern matches `SRDImportCSVGenerator` / `SitevisitImportCSVGenerator`: explicit size, paths, success log.
   *
   * @param size — number of data rows (same role as `properties.ImportCount` in other import tests)
   * @param projectId — value for `project_ids` column (falls back to `defaultChannelPartnerProjectId()` when empty)
   */
  async FileGeneratorForChannelPartner(
    size: number,
    projectId: string,
    importFolder?: string,
  ): Promise<string> {
    const importDir = importFolder || properties.ImportLocation || "store/imports";
    const fileName = `ChannelPartnerImport ${await this.utils.generateRandomString(10)}.csv`;
    const filePath = path.join(process.cwd(), importDir, fileName);

    const csv = new CSVUtils(filePath);
    csv.createFileWithHeader(CreateHeaderForChannelPartnerImport_allFields);

    const resolvedProjectId = projectId?.trim() || defaultChannelPartnerProjectId();

    const rows: string[][] = [];
    for (let i = 1; i <= size; i++) {
      rows.push(await this.buildRandomChannelPartnerRow(resolvedProjectId));
    }

    csv.appendRows(rows);
    await this.utils.print(
      `Channel partner import file created at: ${filePath} for client "${(await this.crmAPIUtils.getSellDoClientDetails()).name}" with count: ${size}`,
    );
    return filePath;
  }

  private async buildRandomChannelPartnerRow(projectIdsValue: string): Promise<string[]> {
    const minBudget = Number(await this.utils.generateRandomNumber(6));
    const maxBudget = (minBudget + Number(await this.utils.generateRandomNumber(6))).toString();
    const phoneTen = await this.utils.generateRandomPhoneNumber();
    const altPhoneTen = await this.utils.generateRandomPhoneNumber();
    const email = await this.utils.generateRandomEmail();
    const altEmail = await this.utils.generateRandomEmail();
    const past = faker.date.past({ years: 10 });
    const future = faker.date.future({ years: 5 });

    const row: string[] = [];

    for (const hRaw of CreateHeaderForChannelPartnerImport_allFields) {
      const h = (hRaw || "").toString().toLowerCase().trim();
      let v = "";

      if (h.includes("email")) {
        v = h.includes("alternate") ? altEmail : email;
      } else if (h.includes("phone")) {
        v = h.includes("alternate") ? altPhoneTen : phoneTen;
      } else if (h.includes("date_of_joining") || h.includes("birthday") || h.includes("anniversary")) {
        const d = h.includes("date_of_joining") ? past : faker.date.past({ years: 20 });
        v = toDdMmYyyy(d);
      } else if (h.includes("rera_validity")) {
        v = toDdMmYyyy(future);
      } else if (h.startsWith("is_") || h === "primary") {
        v = randomBooleanString();
      } else if (h === "channel_partner_type") {
        v = await this.utils.pickRandomElementFromArray(["local", "national", "international"]);
      } else if (h === "salutation") {
        v = await this.utils.pickRandomElementFromArray(["mr", "mrs", "ms", "dr"]);
      } else if (h === "first_name") {
        v = faker.person.firstName();
      } else if (h === "last_name") {
        v = faker.person.lastName();
      } else if (h === "name") {
        v = faker.company.name();
      } else if (h === "occupation") {
        v = faker.person.jobType();
      } else if (h === "designation") {
        v = faker.person.jobTitle();
      } else if (h === "pan") {
        v = generatePan();
      } else if (h === "location") {
        v = faker.location.city();
      } else if (h === "project_ids") {
        v = projectIdsValue;
      } else if (h === "address1") {
        v = faker.location.streetAddress();
      } else if (h === "address2") {
        v = faker.location.secondaryAddress();
      } else if (h === "city") {
        v = "Pune";
      } else if (h === "state") {
        v = "Maharashtra";
      } else if (h === "country") {
        v = "India";
      } else if (h === "country_code") {
        v = "IN";
      } else if (h === "zip") {
        v = faker.string.numeric(6);
      } else if (h === "address_type") {
        v = await this.utils.pickRandomElementFromArray(["personal", "work"]);
      } else if (h === "rera_number") {
        v = faker.string.numeric(6);
      } else if (h === "property_type") {
        v = await this.utils.pickRandomElementFromArray(["villa", "penthouse", "plot"]);
      } else if (h === "min_budget") {
        v = String(minBudget);
      } else if (h === "max_budget") {
        v = String(maxBudget);
      } else if (h === "channel_partner_code") {
        v = `CP${faker.string.alphanumeric({ length: 6, casing: "upper" })}`;
      } else if (h === "rera_name") {
        v = faker.company.name();
      } else if (h === "source_of_recruitment") {
        v = await this.utils.generateRandomString(8);
      } else {
        v = await this.utils.generateRandomString(8);
      }

      row.push(v);
    }
    return row;
  }
}
