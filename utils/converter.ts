import * as fs from "fs";
import * as path from "path";
import { execFileSync } from "child_process";
import * as XLSX from "xlsx";

function parseCsvPreserveEmpties(csvText: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell);
    cell = "";
  };
  const pushRow = () => {
    // keep even empty trailing cells (already pushed)
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];

    if (inQuotes) {
      if (ch === "\"") {
        const next = csvText[i + 1];
        if (next === "\"") {
          cell += "\"";
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === "\"") {
      inQuotes = true;
      continue;
    }

    if (ch === ",") {
      pushCell();
      continue;
    }

    if (ch === "\r") continue;
    if (ch === "\n") {
      pushCell();
      pushRow();
      continue;
    }

    cell += ch;
  }

  // last cell/row
  pushCell();
  if (row.length > 1 || row.some((c) => c !== "")) pushRow();

  return rows;
}

/**
 * Sell.do lead/sitevisit/followup bulk uploads expect an Excel "XLS" sheet.
 * This helper converts an existing CSV file into a compatible `.xls` file.
 *
 * - Accepts: absolute/relative CSV file path
 * - Returns: generated `.xls` file path
 */
export function convertCsvToXls(csvFilePath: string): string {
  if (!csvFilePath || typeof csvFilePath !== "string") {
    throw new Error("convertCsvToXls: csvFilePath is required.");
  }

  const resolvedCsvPath = path.resolve(csvFilePath);
  if (!fs.existsSync(resolvedCsvPath)) {
    throw new Error(`convertCsvToXls: CSV file not found at ${resolvedCsvPath}`);
  }

  const ext = path.extname(resolvedCsvPath).toLowerCase();
  if (ext !== ".csv") {
    throw new Error(`convertCsvToXls: expected a .csv file, got "${ext}"`);
  }

  // Output path
  const dir = path.dirname(resolvedCsvPath);
  const base = path.basename(resolvedCsvPath, ext);
  const xlsPath = path.join(dir, `${base}_${Date.now()}.xls`);

  // Best-compat path: generate XLS using the same Ruby library Sell.do uses (`spreadsheet` gem).
  // This reliably produces ROW records, which Sell.do preview depends on for `column_count`.
  try {
    execFileSync(
      "ruby",
      [
        "-e",
        [
          "require 'csv'; require 'spreadsheet';",
          "Spreadsheet.client_encoding = 'UTF-8';",
          "csv_path = ARGV[0]; out_path = ARGV[1];",
          "rows = CSV.read(csv_path, encoding: 'bom|utf-8');",
          "book = Spreadsheet::Workbook.new;",
          "sheet = book.create_worksheet(name: 'Sheet1');",
          "rows.each_with_index do |r, ri|",
          "  r = [] if r.nil?;",
          "  r.each_with_index do |v, ci|",
          "    sheet[ri, ci] = v.to_s;",
          "  end;",
          "end;",
          "book.write(out_path);",
        ].join(" "),
        resolvedCsvPath,
        xlsPath,
      ],
      { stdio: "ignore" },
    );

    if (!fs.existsSync(xlsPath)) {
      throw new Error("Ruby conversion did not produce an output file.");
    }
    return xlsPath;
  } catch {
    // Fall back to JS-based conversion below.
  }

  // Important for Sell.do (Rails) imports:
  // - Backend uses Ruby `Spreadsheet.open(file)` ("spreadsheet" gem) which reads legacy BIFF8 `.xls`
  // - Preview code relies on correct worksheet dimensions (row_count/column_count)
  // - CSV readers often drop trailing empty columns; we preserve them explicitly
  const csvText = fs.readFileSync(resolvedCsvPath, "utf8");
  const aoa = parseCsvPreserveEmpties(csvText);
  if (!aoa.length || aoa.every((r) => r.every((c) => c === ""))) {
    throw new Error("convertCsvToXls: CSV appears empty.");
  }

  // Normalize all rows to header length (keeps column_count stable in XLS DIMENSION record)
  const maxCols = Math.max(...aoa.map((r) => r.length));
  const normalized = aoa.map((r) => (r.length < maxCols ? [...r, ...Array(maxCols - r.length).fill("")] : r));

  const sheet = XLSX.utils.aoa_to_sheet(normalized, { cellDates: true });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");

  XLSX.writeFile(workbook, xlsPath, { bookType: "biff8", bookSST: true });

  if (!fs.existsSync(xlsPath)) {
    throw new Error(`convertCsvToXls: failed to write XLS file at ${xlsPath}`);
  }

  return xlsPath;
}

