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

  // Integrations / API test ids (set in env for suites that use them)
  GROW_AASAN: process.env.GROW_AASAN_ID,
  CampeignEmail: process.env.CAMPEIGN_EMAIL,
  Domain: process.env.SELLD_DOMAIN,
  SMS_Template_ID: process.env.SMS_TEMPLATE_ID,
  Sales_id: process.env.SALES_ID,
  Facebook_API_Key: process.env.FACEBOOK_API_KEY,
};
