import * as XLSX from "xlsx";
import * as fs from "fs";
 
export class XLUtils {
  filePath: string;
 
  constructor(filePath: string) {
    this.filePath = filePath;
  }
 
  // To load workbook
  private loadWorkbook(): XLSX.WorkBook {
    const fileBuffer = fs.readFileSync(this.filePath);
    return XLSX.read(fileBuffer, { type: "buffer" });
  }
 
  // To save workbook
  private saveWorkbook(workbook: XLSX.WorkBook) {
 
    workbook.Props = {
      Title: "CRM Import Data",
      Subject: "Import File",
      Author: "CRM System",
      CreatedDate: new Date(),
    };
 
    // Save with proper Excel format
    XLSX.writeFile(workbook, this.filePath, {
      bookType: "xls",
      bookSST: false,
      type: "file",
      cellStyles: true
    });
  }
 
  // To get row count
  getRowCount(sheetName: string): number {
    const workbook = this.loadWorkbook();
    const sheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(sheet["!ref"] || "");
    return range.e.r;
  }
 
  // To get cell count
  getCellCount(sheetName: string, rowNum: number): number {
    const workbook = this.loadWorkbook();
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[];
    const row = data[rowNum] || [];
    return row.length;
  }
 
  // To get cell data
  getCellData(sheetName: string, rowNum: number, colNum: number): string {
    const workbook = this.loadWorkbook();
    const sheet = workbook.Sheets[sheetName];
    const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colNum });
    const cell = sheet[cellAddress];
    return cell ? cell.v.toString() : "";
  }
 
  // To set cell data with proper formatting
  setCellData(
    sheetName: string,
    rowNum: number,
    colNum: number,
    value: string,
  ): void {
    const workbook = fs.existsSync(this.filePath)
      ? this.loadWorkbook()
      : XLSX.utils.book_new();
 
    if (!workbook.Sheets[sheetName]) {
      workbook.Sheets[sheetName] = XLSX.utils.aoa_to_sheet([]);
      workbook.SheetNames.push(sheetName);
    }
 
    const sheet = workbook.Sheets[sheetName];
 
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
    while (data.length <= rowNum) data.push([]);
    while (data[rowNum].length <= colNum) data[rowNum].push("");
    data[rowNum][colNum] = value;
 
    workbook.Sheets[sheetName] = XLSX.utils.aoa_to_sheet(data);
  
    
    this.saveWorkbook(workbook);
  }
 
  // To create file with header and proper formatting
  createFileWithHeader(sheetName: string, headers: string[]) {
    const sheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();
  
    
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    this.saveWorkbook(workbook);
  }
 
  // Apply proper Excel formatting to make the file compatible
  private applySheetFormatting(sheet: XLSX.WorkSheet, data: any[][]) {
    // Set column widths based on content
    if (!sheet['!cols']) {
      sheet['!cols'] = [];
    }
 
    // Calculate column widths based on data
    const maxCols = Math.max(...data.map(row => row.length));
    for (let col = 0; col < maxCols; col++) {
      let maxWidth = 10; // Minimum width
      
      // Find the maximum content length in this column
      for (let row = 0; row < data.length; row++) {
        if (data[row] && data[row][col]) {
          const cellValue = String(data[row][col]);
          maxWidth = Math.max(maxWidth, cellValue.length + 2);
        }
      }
      
      // Cap the width at a reasonable maximum
      maxWidth = Math.min(maxWidth, 50);
      
      sheet['!cols'][col] = { width: maxWidth };
    }
 
    // Set row heights for better formatting
    if (!sheet['!rows']) {
      sheet['!rows'] = [];
    }
 
    for (let row = 0; row < data.length; row++) {
      sheet['!rows'][row] = { hpt: 20 }; // Set row height to 20 points
    }
 
    // Apply cell formatting for better compatibility
    for (let row = 0; row < data.length; row++) {
      for (let col = 0; col < (data[row]?.length || 0); col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!sheet[cellAddress]) {
          sheet[cellAddress] = { v: data[row][col] || "" };
        }
        
        // Apply basic cell formatting
        if (!sheet[cellAddress].s) {
          sheet[cellAddress].s = {
            font: { name: 'Calibri', sz: 11 },
            alignment: { horizontal: 'left', vertical: 'center' },
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' }
            }
          };
        }
      }
    }
 
    // Set sheet properties for better compatibility
    sheet['!ref'] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: Math.max(0, data.length - 1), c: Math.max(0, maxCols - 1) }
    });
  }
 
  // Ensure Excel file has proper structure and metadata
  private ensureExcelCompatibility(workbook: XLSX.WorkBook) {
    // Set workbook properties
    workbook.Props = {
      Title: "CRM Import Data",
      Subject: "Import File",
      Author: "CRM System",
      CreatedDate: new Date(),
      ModifiedDate: new Date(),
      Application: "Microsoft Excel",
      Company: "CRM System",
      Category: "Import File",
      Keywords: "CRM Import Data",
      Comments: "Import File",
      LastAuthor: "CRM System",
      Manager: "CRM System",
    };
 
    // Ensure each sheet has proper structure
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      if (sheet) {
        // Ensure sheet has a proper range
        if (!sheet['!ref']) {
          sheet['!ref'] = 'A1:A1';
        }
        
        // Set default column widths if not set
        if (!sheet['!cols']) {
          sheet['!cols'] = [{ width: 15 }];
        }
        
        // Set default row heights if not set
        if (!sheet['!rows']) {
          sheet['!rows'] = [{ hpt: 20 }];
        }
      }
    }
  }
 
  // Create a properly formatted Excel file with data
  createFormattedFile(sheetName: string, data: any[][]) {
    const sheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
 
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    this.saveWorkbook(workbook);
  }
 
  // Add data to existing sheet with proper formatting
  addDataToSheet(sheetName: string, data: any[][], startRow: number = 0) {
    const workbook = fs.existsSync(this.filePath)
      ? this.loadWorkbook()
      : XLSX.utils.book_new();
 
    if (!workbook.Sheets[sheetName]) {
      workbook.Sheets[sheetName] = XLSX.utils.aoa_to_sheet([]);
      workbook.SheetNames.push(sheetName);
    }
 
    const sheet = workbook.Sheets[sheetName];
    const existingData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    // Ensure we have enough rows
    while (existingData.length <= startRow + data.length - 1) {
      existingData.push([]);
    }
 
    // Add new data
    for (let i = 0; i < data.length; i++) {
      const targetRow = startRow + i;
      for (let j = 0; j < data[i].length; j++) {
        while (existingData[targetRow].length <= j) {
          existingData[targetRow].push("");
        }
        existingData[targetRow][j] = data[i][j];
      }
    }
 
    workbook.Sheets[sheetName] = XLSX.utils.aoa_to_sheet(existingData);
 
    this.saveWorkbook(workbook);
  }
 
  // Create a more compatible Excel file that works directly
  createCompatibleExcelFile(sheetName: string, data: any[][]) {
    const workbook = XLSX.utils.book_new();
    
    // Create sheet with data
    const sheet = XLSX.utils.aoa_to_sheet(data);
    
    
    // Add sheet to workbook
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    
    // Ensure compatibility and save
    this.ensureExcelCompatibility(workbook);
    
    // Save with specific options for maximum compatibility
    XLSX.writeFile(workbook, this.filePath, {
      bookType: "xlsx",
      bookSST: false,
      type: "file",
      compression: true
    });
  }
}