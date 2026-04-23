import { Page, Locator, expect } from "@playwright/test";

export class SupportDashboard {
  private readonly page: Page;
  private readonly moreButton: Locator;
  private readonly leadDetils: Locator;
  private readonly leadDelete: Locator;
  private readonly blockLead: Locator;

  // Delete lead dashboard
  private readonly deleteLeadDashboard: Locator;
  private readonly deleteLeadDashboardButton: Locator;
  private readonly enterDeleteLeadId: Locator;
  private readonly highlightedLeadId: Locator;

  constructor(page: Page) {
    this.page = page;
    this.moreButton = page.locator("#activity_tabs_more_lead_profile");
    this.leadDetils = page.getByRole('tab', { name: 'Lead Details' });
    this.leadDelete = page.getByRole('tab', { name: 'Lead Delete' });
    this.blockLead = page.getByRole('tab', { name: 'Block Lead' });

    // Delete lead dashboard
    this.deleteLeadDashboard = page.locator('#s2id_lead_delete_ids').getByRole('list');
    this.enterDeleteLeadId = page.locator("input[class='select2-input select2-focused']");
    this.highlightedLeadId = page.locator("li.select2-highlighted");
    this.deleteLeadDashboardButton = page.getByRole('button', { name: 'Delete Leads' });
 }

    async clickOnMoreButton() {
        await this.moreButton.waitFor({state: 'visible'});
        await this.moreButton.click();
    }

    async clickOnLeadDetails() {
        await this.leadDetils.click();
    }

    async clickOnLeadDelete() {
        await this.leadDelete.click();
    }

    // Delete lead dashboard
    async enterLeadIdForDelete(leadId: string) {
        await this.deleteLeadDashboard.click();
        await this.enterDeleteLeadId.fill(leadId);
        await this.highlightedLeadId.waitFor({state: 'visible'});
        await this.enterDeleteLeadId.press('Enter');
    }

    async clickOnDeleteLeadDashboardButton() {
        await Promise.all([
            this.deleteLeadDashboardButton.click(),
            this.page.on('dialog', async (dialog) => {
                dialog.accept();
            })
        ]);
    }

}