import { test } from "@playwright/test";
import { properties } from "../../properties/v2";

test("Import Unit - Unit Import", async ({ page }) => {
  await page.goto("https://selldo.com/");
  await page.waitForTimeout(10000);

  // print admin emai and password from properties
  console.log(properties.Admin_email);
  console.log(properties.PASSWORD);

  // print full aceess key, clinet id and restricted api
  console.log(properties.FullAccess_API);
  console.log(properties.Client_id);
  console.log(properties.RestrictedAccess_API);
});
