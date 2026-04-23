import { test } from "@playwright/test";

test("Import Unit - Unit Import", async ({ page }) => {
  await page.goto("https://selldo.com/");

  const adminEmail = process.env.ADMIN_EMAIL;
  const password = process.env.PASSWORD;
  const fullAccessApi = process.env.FULL_ACCESS_API;
  const clientId = process.env.CLIENT_ID;
  const restrictedApi = process.env.RESTRICTED_API;

  console.log(adminEmail, password, fullAccessApi, clientId, restrictedApi);

});
