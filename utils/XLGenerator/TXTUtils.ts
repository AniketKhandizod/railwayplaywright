import * as fs from 'fs';
import * as path from 'path';

export class TextFileHandler {
  private filePath: string;

  constructor(filePath: string) {
    // Ensure .txt extension
    if (!filePath.endsWith('.txt')) {
      filePath += '.txt';
    }
    this.filePath = filePath;
  }

  // Create file (and directories if needed)
  public async createFile(): Promise<void> {
    const dir = await path.dirname(this.filePath);

    // Create directories if they don't exist
    if (!await fs.existsSync(dir)) {
      await fs.mkdirSync(dir, { recursive: true });
      //console.log('Created directories:', dir);
    }

    // Create file if not exists
    if (!await fs.existsSync(this.filePath)) {
      await fs.writeFileSync(this.filePath, '');
      //console.log('File created:', this.filePath);
    } else {
      //console.log('File already exists:', this.filePath);
    }
  }

  // Overwrite file content
  public async writeFile(content: string): Promise<void> {
    try {
      await fs.writeFileSync(this.filePath, content);
      //console.log('File written successfully (overwritten).'+content);
    } catch (error) {
      //console.error('An error occurred while writing to the file:', error);
    }
  }

  // Append content to file
  public async updateFile(contentToAppend: string): Promise<void> {
    try {
      await fs.appendFileSync(this.filePath, contentToAppend);
      //console.log('Content appended successfully.'+contentToAppend);
    } catch (error) {
      //console.error('An error occurred while appending to the file:', error);
    }
  }

  // Read and print file content
  public async readFile(): Promise<string> {
    let data = "";
    try {
       data = await fs.readFileSync(this.filePath, 'utf8');
      //console.log('Reading file content:\n' + data);
    } catch (error) {
      //console.error('An error occurred while reading the file:', error);
    }
    return data;
  }
}
