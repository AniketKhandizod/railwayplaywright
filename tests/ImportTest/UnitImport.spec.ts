import { test } from "@playwright/test";

test("Import Unit - Unit Import", async ({ page }) => {
  await page.goto("https://selldo.com/");
  await page.waitForTimeout(10000);
});
