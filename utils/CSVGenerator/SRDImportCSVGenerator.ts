import * as path from "path";
import { faker } from "@faker-js/faker";
import { CSVUtils } from "./CSVUtils";
import { Utils } from "../PlaywrightTestUtils";
import { properties } from "../env";
import { CRMAPIUtils } from "../APIUtils/CRMAPIUtils";

export const CreateHeaderForSRDImport: string[] = [
  "api_client_name", // required
  "campaign_id", // required
  "source",
  "sub_source",
  "sales",
  "project_id",
  "virtual_number",
];

export class SRDImportCSVGenerator {
  private readonly utils: Utils;
  private readonly crmAPIUtils: CRMAPIUtils;

  constructor(clientId: string, FullAccess_API: string) {
    this.utils = new Utils();
    this.crmAPIUtils = new CRMAPIUtils(clientId, FullAccess_API);
  }

  // Java ref: SRDXLSFileGenerator.FileGeneratorForSRD(int iterations,String projectId, String salesId, String campeignID)
  async FileGeneratorForSRD(
    iterations: number,
    projectId: string,
    salesId: string,
    campeignID: string,
    sourceID: string,
    subSourceID: string,
    importFolder?: string,
  ): Promise<string> {
    const importDir = importFolder || properties.ImportLocation || "store/imports";
    const fileName = `SRDImport ${await this.utils.generateRandomString(10)}.csv`;
    const filePath = path.join(process.cwd(), importDir, fileName);

    const csv = new CSVUtils(filePath);
    csv.createFileWithHeader(CreateHeaderForSRDImport);

    const rows: string[][] = [];
    for (let i = 1; i <= iterations; i++) {
      rows.push([
        "website", // api_client_name (Java hard-coded)
        campeignID, // campaign_id
        sourceID, // source (Java used a random first_name here)
        subSourceID, // sub_source
        salesId, // sales
        projectId, // project_id
        "", // virtual_number
      ]);
    }

    csv.appendRows(rows);
    await this.utils.print(`SRD import file created at: ${filePath} for client "${(await this.crmAPIUtils.getSellDoClientDetails()).name}" with count: ${iterations}`);
    return filePath;
  }
}

