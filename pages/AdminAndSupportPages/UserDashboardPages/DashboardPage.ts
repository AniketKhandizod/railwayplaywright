import { Page, Locator, expect } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils";

export class UserDashboard {
  private readonly page: Page;
  private readonly utils: Utils;
  private readonly refreshButton: Locator;
  private readonly dhaboardTitle: Locator;
  private readonly dashboardRefreshTime: Locator;
  private readonly missedFollowupsCount: Locator;
  private readonly missedFollowupsBucket: Locator;
  private readonly pageMissedFollowupsCount: Locator;
  private readonly firstLeadThreeDots: Locator;
  private readonly detailsButton: Locator;
  private readonly followupThreeDots: Locator;
  private readonly cancelFollowupButton: Locator;
  private readonly missedCallsCount: Locator;
  private readonly todaysAgendaNav: Locator;
  private readonly todaysPerformanceText: Locator;
  private readonly agendaFollowupCount: Locator;
  private readonly performanceFollowupCount: Locator;
  private readonly newEnquiriesCount: Locator;
  private readonly homeButton: Locator;

  // New locators for missed site visits
  private readonly missedSiteVisitsCount: Locator;
  private readonly missedSiteVisitsBucket: Locator;
  private readonly reengagedLeadsCount: Locator;
  private readonly pageLeadCount: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();
    this.refreshButton = page.locator("i[class='ion-refresh refresh-sales-dashboard']");
    this.dhaboardTitle = page.locator(".tile-item.clickable.go_to_leads > div");
    this.dashboardRefreshTime = page.locator("span[class='refresh-time-note mr-2 small']");
    this.todaysAgendaNav = page.locator(".nav-link.active[href='#todays_agenda']");
    this.todaysPerformanceText = page.locator("text=today's performance");
    this.agendaFollowupCount = page.locator("div.card-body.bg-secondary.text-white.fp_count span.label");
    this.performanceFollowupCount = page.locator("div.tile-item:has-text('followup schedule') span.title-item-body-count");
    // New locators for missed followups
    this.missedFollowupsCount = page.locator("div[id='missed_followups'] span[class='title-item-body-count']");
    this.missedFollowupsBucket = page.locator("div[id='missed_followups']");
    this.pageMissedFollowupsCount = page.locator(".leads-count-note");
    this.firstLeadThreeDots = page.locator("tbody tr:nth-child(1) td:nth-child(8) div:nth-child(1) a:nth-child(1)");
    this.detailsButton = page.locator("div[class='dropdown show'] button:nth-child(2)");
    this.followupThreeDots = page.locator(".fa.fa-ellipsis-v.ml-2").first();
    this.cancelFollowupButton = page.locator(".update_followup").first();
    // Add missed calls count locator
    this.missedCallsCount = page.locator("div[id='missed_calls'] span[class='title-item-body-count']");
    // Initialize missed site visits locators
    this.missedSiteVisitsCount = page.locator("div[id='missed_site_visits'] span[class='title-item-body-count']");
    this.missedSiteVisitsBucket = page.locator("div[id='missed_site_visits'] div[class='tile-item-title']");
    // Add new enquiries count locator
    this.newEnquiriesCount = page.locator("#contact_new_leads .title-item-body-count");
    this.reengagedLeadsCount = page.locator("#reengaged_leads .title-item-body-count");
    this.pageLeadCount = page.locator(".leads-count-note");
    this.homeButton = page.getByRole('link', { name: 'Home' });
  }

  async refreshDashboard() {
    for(let i = 0; i < 2; i++){
        await this.refreshButton.waitFor({ state: "visible" });
        await this.dashboardRefreshTime.waitFor({ state: "visible" });
        await this.refreshButton.click();
        await this.dashboardRefreshTime.waitFor({ state: "visible" });
    }
  }

  getDashboardTitle(): Locator {
    return this.dhaboardTitle;
  }

  async isTodaysAgendaVisible(): Promise<boolean> {
    return await this.todaysAgendaNav.isVisible();
  }

  async isTodaysPerformanceVisible(): Promise<boolean> {
    return await this.todaysPerformanceText.isVisible();
  }

  async getTodaysPerformanceText(): Promise<string> {
    return await this.todaysPerformanceText.textContent() || "";
  }

  async getAgendaFollowupCount(): Promise<number> {
    const countText = await this.agendaFollowupCount.textContent();
    const match = countText?.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  async getPerformanceFollowupCount(): Promise<number> {
    const countText = await this.performanceFollowupCount.textContent();
    return parseInt(countText || "0");
  }

  // New methods for missed followups
  async getMissedFollowupsCount(): Promise<number> {
    const countText = await this.missedFollowupsCount.textContent();
    return parseInt(countText || '0');
  }

  async clickMissedFollowupsBucket() {
    await this.missedFollowupsBucket.click();
    await this.utils.waitTillFullPageLoad(this.page);
  }

  async getPageMissedFollowupsCount(): Promise<number> {
    const countText = await this.pageMissedFollowupsCount.textContent();
    const countMatch = countText?.match(/\d+/);
    return countMatch ? parseInt(countMatch[0]) : 0;
  }

  async clickFirstLeadThreeDots() {
    await this.firstLeadThreeDots.click();
    await this.utils.waitTillFullPageLoad(this.page);
  }

  async clickDetailsButton() {
    await this.detailsButton.click();
    await this.utils.waitTillFullPageLoad(this.page);
  }

  async clickFollowupThreeDots() {
    await this.followupThreeDots.waitFor({ state: 'visible', timeout: 10000 });
    await this.followupThreeDots.click();
    await this.utils.waitTillFullPageLoad(this.page);
  }

  async clickCancelFollowupButton() {
    await this.cancelFollowupButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.cancelFollowupButton.click();
    await this.utils.waitTillFullPageLoad(this.page);
  }

  // Updated method for MissedCalls test - returns number instead of string
  async getMissedCallsCount(): Promise<number> {
    const countText = await this.missedCallsCount.textContent();
    return parseInt(countText || '0');
  }

  // New methods for NewEnquiries test
  async getNewEnquiriesCount(): Promise<string> {
    return await this.newEnquiriesCount.textContent() || "0";
  }

  // New method for ReengagedLeads test
  async getReengagedLeadsCount(): Promise<string> {
    return await this.reengagedLeadsCount.textContent() || "0";
  }

  async getPageLeadCount(): Promise<number> {
    const pageLeadCount = await this.pageLeadCount.textContent();
    const pageCount = parseInt(pageLeadCount?.match(/(\d+)/)?.[1] || "0");
    return pageCount;
  }

  // New methods for missed site visits
  async getMissedSiteVisitsCount(): Promise<number> {
    const countText = await this.missedSiteVisitsCount.textContent();
    return parseInt(countText || '0');
  }

  async clickMissedSiteVisitsBucket() {
    await this.missedSiteVisitsBucket.click();
    await this.utils.waitTillFullPageLoad(this.page);
  }
  async clickOnHome() {
    await this.homeButton.click();
    await this.utils.waitTillFullPageLoad(this.page);
  }
}