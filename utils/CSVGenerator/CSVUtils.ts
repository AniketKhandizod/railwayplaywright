import * as fs from "fs";
import * as path from "path";

type CsvCell = string | number | boolean | null | undefined;

export class CSVUtils {
  filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  private ensureDirExists(): void {
    const dirPath = path.dirname(this.filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private static escapeCell(value: CsvCell): string {
    if (value === null || value === undefined) return "";
    const str = String(value);
    const mustQuote = /[",\n\r]/.test(str);
    const escaped = str.replace(/"/g, '""');
    return mustQuote ? `"${escaped}"` : escaped;
  }

  private static parseLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          result.push(current);
          current = "";
        } else {
          current += char;
        }
      }
    }
    result.push(current);
    return result;
  }

  private static stringifyRows(rows: CsvCell[][]): string {
    return rows
      .map(row => row.map(CSVUtils.escapeCell).join(","))
      .join("\n");
  }

  createFileWithHeader(headers: string[]): void {
    this.ensureDirExists();
    const content = CSVUtils.stringifyRows([headers]);
    fs.writeFileSync(this.filePath, content, { encoding: "utf8" });
  }

  ensureHeaders(headers: string[]): void {
    if (!fs.existsSync(this.filePath) || fs.statSync(this.filePath).size === 0) {
      this.createFileWithHeader(headers);
      return;
    }
    const existing = this.getHeaders();
    if (existing.join("|") !== headers.join("|")) {
      this.createFileWithHeader(headers);
    }
  }

  appendRows(rows: CsvCell[][]): void {
    this.ensureDirExists();
    const data = CSVUtils.stringifyRows(rows);
    const needsNewline = fs.existsSync(this.filePath) && fs.statSync(this.filePath).size > 0;
    fs.appendFileSync(this.filePath, (needsNewline ? "\n" : "") + data, { encoding: "utf8" });
  }

  readAll(): string[][] {
    if (!fs.existsSync(this.filePath)) return [];
    const raw = fs.readFileSync(this.filePath, { encoding: "utf8" });
    const lines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
    const rows: string[][] = [];
    for (const line of lines) {
      if (line.trim() === "") continue;
      rows.push(CSVUtils.parseLine(line));
    }
    return rows;
  }

  getCell(row: number, column: number): string | undefined {
    if (row < 0 || column < 0) return undefined;
    const rows = this.readAll();
    const cells = rows[row];
    if (!cells) return undefined;
    return cells[column];
  }

  getHeaders(): string[] {
    const rows = this.readAll();
    return rows[0] || [];
  }

  getRequiredColumnNames(requiredRowIndex: number = 2): string[] {
    const rows = this.readAll();
    if (!rows.length) return [];
    const headers = rows[0];
    const requiredRow = rows[requiredRowIndex] || [];
    const requiredColumns: string[] = [];
    for (let i = 0; i < headers.length; i++) {
      const marker = (requiredRow[i] || "").toString().toLowerCase().trim();
      if (marker === "required") requiredColumns.push(headers[i]);
    }
    return requiredColumns;
  }
}

// Generic helper to write a CSV file from headers + row arrays and return full file path.
export function writeCsvFile(options: {
  headers: (string | number)[];
  rows: CsvCell[][];
  fileName: string;
  importFolder?: string;
}): string {
  const importDir = options.importFolder || "./store";
  const filePath = path.join(process.cwd(), importDir, options.fileName);
  const csv = new CSVUtils(filePath);
  csv.createFileWithHeader(options.headers.map(h => String(h)));
  csv.appendRows(options.rows);
  return filePath;
}


