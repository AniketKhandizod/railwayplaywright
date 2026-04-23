import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils.ts";

export class TowerStagesPage {
    private readonly page: Page;
    private readonly utils: Utils;
    private readonly addStageLink: Locator;
    private readonly stageNameInput: Locator;
    private readonly saveButton: Locator;
    private readonly successUpdateMsg : Locator;

    constructor(page: Page) {
        this.page = page;
        this.utils = new Utils();
        this.addStageLink = page.getByRole('link', { name: 'Add a stage' });
        this.stageNameInput = page.locator('#project_tower_stages input[type="text"]');
        this.saveButton = page.getByRole('button', { name: 'Save' });
        this.successUpdateMsg = page.getByText('Project Tower is successfully updated.');
    }

    async clickAddStage(): Promise<void> {
        await this.addStageLink.click();
        await this.utils.waitTillFullPageLoad(this.page);
    }

    async enterStageName(stageName: string): Promise<void> {
        await this.stageNameInput.click();
        await this.stageNameInput.fill(stageName);
    }

    async clickSave(): Promise<void> {
        await this.saveButton.waitFor();
        await this.saveButton.click();
    }
     async isStageAddedSucessfully(): Promise<boolean> {
        return await this.successUpdateMsg.isVisible(); 
    }
}
