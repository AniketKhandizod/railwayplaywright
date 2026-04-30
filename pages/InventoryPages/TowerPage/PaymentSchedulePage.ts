import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils.ts";

export class PaymentSchedulePage {
    private readonly page: Page;
    private readonly utils: Utils;
    private readonly newScheduleLink: Locator;
    private readonly paymentScheduleNameInput: Locator;
    private readonly selectTemplateLink: Locator;
    private readonly templateOption: Locator;
    private readonly savePaymentScheduleButton: Locator;
    private readonly allPaymentSchedulesLink: Locator;
    private readonly approveLink: Locator;
    private readonly psNameElement: Locator;
    
    constructor(page: Page) {
        this.page = page;
        this.utils = new Utils();
        this.newScheduleLink = page.getByRole('link', { name: 'New Schedule' });
        this.paymentScheduleNameInput = page.locator('#payment_schedule_name');
        this.selectTemplateLink = page.getByRole('link', { name: 'Select template' });
        this.templateOption = page.getByText('Send Demand Letter To A');
        this.savePaymentScheduleButton = page.locator('#save-payment-schedule');
        this.allPaymentSchedulesLink = page.getByRole('link', { name: 'All Payment Schedules' });
        this.approveLink = page.getByRole('link', { name: 'Approve' });
        this.psNameElement = page.locator('.lead');
    }

    async clickNewSchedule(): Promise<void> {
        await this.newScheduleLink.waitFor({ state: 'visible' });
        await this.newScheduleLink.click();
        await this.utils.waitTillFullPageLoad(this.page);
    }

    async enterPaymentScheduleName(scheduleName: string): Promise<void> {
        await this.paymentScheduleNameInput.waitFor({ state: 'visible' });
        await this.paymentScheduleNameInput.fill(scheduleName);
    }

    async selectTemplate(): Promise<void> {
        await this.selectTemplateLink.click();
        await this.templateOption.click();
    }

    async clickSavePaymentSchedule(): Promise<void> {
        await this.savePaymentScheduleButton.click();
    }

    async getPSNameFromPage(): Promise<string> {
        return await this.psNameElement.innerText();
    }

    async clickAllPaymentSchedules(): Promise<void> {
        await this.allPaymentSchedulesLink.click();
        await this.utils.waitTillFullPageLoad(this.page);
    }

    async clickOnPaymentScheduleRow(scheduleName: string): Promise<void> {
        const scheduleRow = this.page.getByRole('row', { name: scheduleName }).getByRole('link');
        await scheduleRow.click();
        await this.utils.waitTillFullPageLoad(this.page);
    }

    async clickApprove(): Promise<void> {
         this.page.once('dialog', dialog => {
         dialog.accept().catch(() => {});
        });
        await this.approveLink.click();
    }
}
