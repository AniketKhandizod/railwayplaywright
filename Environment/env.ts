
export const properties = {
  // File Paths
  filePath: "/SampleFiles/selldo.gif",
  SampleFilePath: "/SampleFiles/selldo.jpg",
  printLogsToConsole: true,
  /** When false, `Utils.safeDeleteFile` / `safeDeleteFiles` skip deletion (e.g. keep generated import files for debugging). */
  delete_files: false,

  // Credentials
  PASSWORD: process.env.SELLD_PASSWORD,
  Admin_email: process.env.SELLD_ADMIN_EMAIL,

  CLIENT_ID: process.env.SELLD_CLIENT_ID,
  FULL_ACCESS_API: process.env.SELLD_FULL_ACCESS_API,
  RESTRICTED_ACCESS_API: process.env.SELLD_RESTRICTED_ACCESS_API,

};
