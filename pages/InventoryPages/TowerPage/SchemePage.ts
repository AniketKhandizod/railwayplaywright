import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils.ts";

export class SchemePage {
    private readonly page: Page;
    private readonly utils: Utils;
    private readonly defaultSchemeRow: Locator;
    private readonly activateLink: Locator;
    private readonly successMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.utils = new Utils();
        this.defaultSchemeRow = page.getByRole('row', { name: 'Default Scheme' }).getByRole('link');
        this.activateLink = page.getByRole('link', { name: 'Activate', exact: true });
        this.successMessage = page.getByText("Scheme updated successfully.");
    }

    async clickDefaultScheme(): Promise<void> {
        await this.defaultSchemeRow.click();
        await this.utils.waitTillFullPageLoad(this.page);
    }

    async clickActivate(): Promise<void> {
        // Handle dialog for activation
        this.page.once('dialog', dialog => {
            dialog.accept().catch(() => {});
        });
        await this.activateLink.click();
    }

    async isSchemeActivatedSuccessfully(): Promise<boolean> {
        await this.page.waitForSelector(`text="Scheme updated successfully."`);
        return await this.successMessage.isVisible();
    }
}
