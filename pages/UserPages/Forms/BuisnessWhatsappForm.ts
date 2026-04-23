import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils";

export class sendBusinessWhatsappForm {

    private readonly page: Page;
    private readonly utils: Utils;
    private readonly newConversationButton: Locator;
    private readonly selectPhoneAccountTemplate: Locator;
    private readonly selectPrimaryPhone: Locator;
    private readonly selectAccount: Locator;
    private readonly selectTeamplate: Locator;
    private readonly getMessagePreview: Locator;
    private readonly sendMessageButton: Locator;
    private readonly loadingSpinner: Locator;

    constructor(page: Page) {
        this.page = page;
        this.utils = new Utils();

        this.newConversationButton = page.locator('#form_container iframe').contentFrame().getByRole('button', { name: 'New Conversation' });

        // Select account and phone UI
        this.selectPhoneAccountTemplate = page.locator('#form_container iframe').contentFrame().locator("#conversation-form div[class$='control']");
        this.selectPrimaryPhone = page.locator('#form_container iframe').contentFrame().getByRole('option', { name: '7972708841 (Primary)' });//(Primary)
        this.selectAccount = page.locator('#form_container iframe').contentFrame().getByRole('option', { name: 'PNQ Reals' });
        this.selectTeamplate = page.locator('#form_container iframe').contentFrame().getByRole('option', { name: 'Initial Media' });
        this.getMessagePreview = page.locator('#form_container iframe').contentFrame().locator('.message-preview-container');
        this.sendMessageButton = page.locator('#form_container iframe').contentFrame().getByRole('button', { name: 'Send' })

        this.loadingSpinner = page.locator("svg[data-icon='spinner']");
    }

    async clickOnNewConversationButton(): Promise<void> {
        await this.newConversationButton.click();
    }

    async selectPrimaryPhoneForBusinessWhatsApp(): Promise<void> {
        await this.selectPhoneAccountTemplate.first().click();
        await this.selectPrimaryPhone.click();
    }

    async selectAccountForBusinessWhatsApp(): Promise<void> {
        await this.selectPhoneAccountTemplate.nth(1).click();
        await this.selectAccount.click();
    }

    async selectTemplateForBusinessWhatsApp(): Promise<void> {
        await this.selectPhoneAccountTemplate.nth(2).click();
        await this.selectTeamplate.click();
    }

    async getMessagePreviewForBusinessWhatsApp(): Promise<void> {
        if(await this.loadingSpinner.isVisible()) {
            await this.loadingSpinner.waitFor({ state: "hidden" });
        }
    }

    async clickOnSendMessageButton(): Promise<void> {
        await this.sendMessageButton.click();
    }

}