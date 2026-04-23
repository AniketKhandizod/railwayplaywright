import { test, expect } from "@playwright/test";
import { properties } from "../../properties/v2.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { SettingPage } from "../../pages/AdminAndSupportPages/SettingsPages/SettingPage.ts";
import { ImportPage } from "../../pages/AdminAndSupportPages/ImportPages/ImportPage.ts";
import { ImportListingPage } from "../../pages/AdminAndSupportPages/ImportPages/ImportListingPage.ts";
import { ImportFilePage } from "../../pages/AdminAndSupportPages/ImportPages/ImportFilePage.ts";
import { ImportConfigurationPage } from "../../pages/AdminAndSupportPages/ImportPages/ImportConfigurationPage.ts";
import { BulkActionAPIUtils } from "../../utils/APIUtils/BulkActionAPIUtils.ts";

test.describe.configure({ mode: "serial"});
test.fixme('Import Payment Schedule Test', async ({ page }) => {

  
  });

