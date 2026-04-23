import { Page, Locator } from "@playwright/test";

export class addOfflineCallForm {

    private readonly page: Page;
    private readonly offlineCallProjectButton: Locator;
    private readonly closeButton: Locator;
    private readonly saveOfflineCallButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.offlineCallProjectButton = page.locator("div.select2-container.form-control.offline_project_id");
        this.closeButton = page.locator("//h5[text()='Offline Call Details']/parent::div/button");
        this.saveOfflineCallButton = page.locator("button.schedule-offline-call.btn.btn-primary.btn-sm.pull-right.save");
    }

    async isProjectDropdownVisible() {
        return await this.offlineCallProjectButton.isVisible();
    }

    async clickOnCloseButton() {
        await this.closeButton.click({ force: true });
    }

    async waitUntilSaveOfflineCallButtonVisible() {
        return await this.saveOfflineCallButton.waitFor({ state: "visible" });
    }

    async clickOnSaveOfflineCallButton() {
        await this.saveOfflineCallButton.click();
    }

}