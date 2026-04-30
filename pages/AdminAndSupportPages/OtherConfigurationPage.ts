import { Page, Locator } from "@playwright/test";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";

export enum ReassignLeadStrategy {
    Project = "Project",
    Team = "Team",
}

export class OtherConfigurationPage {

    private readonly page: Page;
    private readonly ReassignLeadStrategy: Locator;
    private readonly ReassignLeadStrategyValue: Locator;
    private readonly ReassignLeadStrategyValueHighlighted: Locator;
    private readonly saveOtherConfiguration: Locator;

    constructor(page: Page) {
        this.page = page;
        this.ReassignLeadStrategy = page.locator("#s2id_client_configuration_reassign_lead_strategy a");
        this.ReassignLeadStrategyValue = page.locator("#select2-drop input");
        this.ReassignLeadStrategyValueHighlighted = page.locator("li.select2-highlighted");

        // save other configuration
        this.saveOtherConfiguration = page.locator("input.btn.btn-primary.save");
    }

    async clickOnReassignLeadStrategy(strategy: ReassignLeadStrategy) {
        await this.ReassignLeadStrategy.click();
        await this.ReassignLeadStrategyValue.fill(strategy);
        await this.ReassignLeadStrategyValueHighlighted.first().click();
    }

    async clickOnSaveOtherConfiguration() {
        await this.saveOtherConfiguration.click();
    }

}