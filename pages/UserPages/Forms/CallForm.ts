import { Page, Locator } from "@playwright/test";

export class triggerCallForm {

    private readonly page: Page;
    private readonly callProjectButton: Locator;
    private readonly closeButton: Locator;
    private readonly placeCallButton: Locator;
    private readonly phoneNumber: Locator;

    constructor(page: Page) {
        this.page = page;
        this.callProjectButton = page.locator(".select2-container.form-control.c2c_project_id span[class='select2-chosen']");
        this.closeButton = page.locator("button.close.close-call-to-call");
        this.placeCallButton = page.locator(".btn.btn-primary.call-to-lead");
        this.phoneNumber = page.locator("a.lead-call.lead-phone.primary-phone");
    }

    async clickOnCallProjectButton() {
        await this.callProjectButton.click();
    }

    async isCallProjectButtonVisible() {
        return await this.callProjectButton.isVisible();
    }

    async clickOnCloseButton() {
        await this.closeButton.click();
    }

    async waitTillPlaceCallButtonVisible() {
        return await this.placeCallButton.waitFor({ state: "visible" });
    }

    async clickOnPhoneNumber() {
        await this.phoneNumber.click();
    }

}