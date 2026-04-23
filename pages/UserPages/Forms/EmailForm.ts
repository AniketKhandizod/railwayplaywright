import { Page, Locator } from "@playwright/test";

export class sendEmailForm {

    private readonly page: Page;
    private readonly composeEmailButton: Locator;
    private readonly sendEmailFormButton: Locator;
    private readonly projectDropdown: Locator;
    private readonly subjectInput: Locator;
    private readonly closeEmailFormButton: Locator;
    private readonly emailTypeDropdown: Locator;
    private readonly emailTypeDropdownOptions: Locator;
    private readonly templateDropdown: Locator;
    private readonly templateDropdownOptions: Locator;
    private readonly emailSubject: Locator;
    private readonly emailBody: Locator;

    constructor(page: Page) {
        this.page = page;
        this.composeEmailButton = page.locator("#compose_email_lead_profile");
        this.sendEmailFormButton = page.locator(".btn.btn-primary.btn-sm.pull-right.send_email");
        this.projectDropdown = page.locator(".select2-container.form-control.project");
        this.closeEmailFormButton = page.locator("//h5[text()='Email']//following-sibling::button");

        // Compose Email 
        this.subjectInput = page.locator("input[placeholder='Subject']");

        // select Email type
        this.emailTypeDropdown = page.locator("div[class='select2-container form-control'][id^='s2id_a'] .select2-chosen");
        this.emailTypeDropdownOptions = page.locator(".select2-result-label");

        // select template
        this.templateDropdown = page.locator("div[class='select2-container email_template_select form-control'][id^='s2id_a'] .select2-chosen");
        this.templateDropdownOptions = page.locator(".select2-result-label");

        // select email
        this.emailSubject = page.locator("input[name='subject']");
        this.emailBody = page.locator(".note-editable.card-block");
    }

    async clickOnComposeEmailButton() {
        await this.composeEmailButton.click();
    }

    async clickOnSendEmailFormButton() {
        await this.sendEmailFormButton.click();
    }

    async isSendEmailFormButtonVisible() {
        return await this.sendEmailFormButton.isVisible();
    }

    async isProjectDropdownVisible() {
        await this.subjectInput.waitFor({ state: "visible" });
        return await this.projectDropdown.isVisible();
    }

    async clickOnCloseEmailFormButton() {
        await this.closeEmailFormButton.click();
    }

    async selectEmailType(emailType: string) {
        await this.emailTypeDropdown.click();
        await this.emailTypeDropdownOptions.filter({ hasText: emailType }).click();
    }

    async selectTemplate(template: string) {
        await this.templateDropdown.click();
        await this.templateDropdownOptions.filter({ hasText: template }).click();
    }

    async enterEmailSubject(subject: string) {
        await this.emailSubject.fill(subject);
    }

    async enterEmailBody(body: string) {
        await this.emailBody.fill(body);
    }
}