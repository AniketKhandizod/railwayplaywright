import { Page, Locator } from "@playwright/test";

export class sendSMSForm {

    private readonly page: Page;
    private readonly projectDropdown: Locator;
    private readonly closeButton: Locator;
    private readonly sendSMSButton: Locator;
    private readonly clickOnSmsTemplateButton: Locator;
    private readonly smsTemplateOptions: Locator;
    private readonly sendSMSFormButton: Locator;
    private readonly sendSMSMobileButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.projectDropdown = page.locator(".select2-container.form-control.sms_project_id");
        this.closeButton = page.locator("button.close.text-white.lead-index.close_sms");
        this.sendSMSButton = page.locator(".btn.btn-primary.btn-sm.pull-right.send_sms");

        // sending process elements
        this.clickOnSmsTemplateButton = page.locator(".form-group.sms_template_select .select2-chosen");
        this.smsTemplateOptions = page.locator("li.select2-result-selectable");

        // send SMS elements
        this.sendSMSFormButton = page.locator("button.send_sms");
        this.sendSMSMobileButton = page.locator("button.send_via_phone");
    }

    async clickOnProjectDropdown() {
        await this.projectDropdown.click();
    }

    async isProjectDropdownVisible() {
        return await this.projectDropdown.isVisible();
    }

    async clickOnCloseButton() {
        await this.closeButton.click();
    }

    async waitTillCloseButtonVisible() {
        return await this.closeButton.waitFor({ state: "visible" });
    }

    async clickOnSmsTemplate() {
        await this.clickOnSmsTemplateButton.click();
    }

    async selectSmsTemplate(template: string) {
        await this.smsTemplateOptions.filter({ hasText: template }).click();
    }

    async clickOnSendSMSButton() {
        await this.sendSMSFormButton.click();
    }

    async clickOnSendSMSMobileButton() {
        await this.sendSMSMobileButton.click();
    }
}