import { Page, Locator } from "@playwright/test";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";

export class FeaturesPage {

    private readonly page: Page;
    private readonly dealManagement: Locator;
    private readonly savePage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.dealManagement = page.locator(".deal_management");
        this.savePage = page.locator("input[class='btn btn-primary save']");
    }

    async clickOnDealManagement(enable: boolean) {
        await this.dealManagement.scrollIntoViewIfNeeded();
        if(enable) {
            await this.dealManagement.check();
        } else {
            await this.dealManagement.uncheck();
        }
    }

    async clickOnSave() {
        await this.savePage.click();
    }

}