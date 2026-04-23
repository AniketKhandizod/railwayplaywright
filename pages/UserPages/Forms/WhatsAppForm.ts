import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils.ts";

export class sendWhatsAppForm {

    private readonly page: Page;
    private readonly utils: Utils;
    private readonly projectDropdown: Locator;
    private readonly closeButton: Locator;
    private readonly sendWhatsAppMessageButton: Locator;
    private readonly sendWhatsAppButton: Locator;
    private readonly selectWhatsAppAccountButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.utils = new Utils();
        this.projectDropdown = page.locator(".select2-container.form-control.whatsapp_project_id");
        this.closeButton = page.locator(".close_whatsapp");
        this.sendWhatsAppButton = page.locator(".send_whatsapp");
        this.selectWhatsAppAccountButton = page.locator(".select2-container.form-control.whatsapp_account_input");
        this.sendWhatsAppMessageButton = page.locator(".lead-send-whatsapp.dropdown-item ");
    }

    async isProjectDropdownVisible() {
        return await this.projectDropdown.isVisible();
    }

    async clickOnCloseButton() {
        while(await this.closeButton.isVisible()){
            await this.closeButton.click({ force: true });
            this.page.on('dialog', async (dialog) => {
                try{
                    await dialog.accept();
                }catch(error){
                }
            });
        }
    }

    async waitTillSelectWhatsAppAccountButtonVisible() {
        return await this.selectWhatsAppAccountButton.waitFor({ state: "visible" });
    }

    async clickOnSendWhatsAppMessageButton() {
        await this.sendWhatsAppMessageButton.click();
    }

    async navigateViaUrl(){
        const url = await this.page.url();
        const newUrl = url.split("/f/")[0]+"/f/AddNote";
        await this.page.goto(newUrl);
    }

}