import { Page, Locator } from "@playwright/test";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";

export class DatePicker {
  private readonly page: Page;
  private readonly utils: Utils;
  private readonly listOfDates: Locator;
  private readonly shiftToMonthButton: Locator;
  private readonly listOfMonths: Locator;
  private readonly shiftToYearButton: Locator;
  private readonly listOfYears: Locator;
  private readonly increaseMinutesButton: Locator;
  private readonly MinutesText: Locator;
  private readonly getCurrentMinutes: Locator;
  private readonly decreaseHoursButton: Locator;
  private readonly getCurrentHours: Locator;
  private readonly changeAmPmButton: Locator;
  private readonly getCurrentAmPm: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();

    // Date
    this.listOfDates = page.locator("td[class='day']");

    // Month
    this.shiftToMonthButton = page.locator(".datepicker-days .datepicker-switch");
    this.listOfMonths = page.locator("span[class^='month']");

    // Year
    this.shiftToYearButton = page.locator(".datepicker-months .datepicker-switch");
    this.listOfYears = page.locator("span[class^='year']");

    // Time - minutes
    this.increaseMinutesButton = page.locator("a[data-action='incrementMinute']");
    this.getCurrentMinutes = page.locator(".bootstrap-timepicker-minute");
    this.MinutesText = page.locator(".bootstrap-timepicker-minute span");

    // Time - hours
    this.decreaseHoursButton = page.locator("a[data-action='decrementHour']");
    this.getCurrentHours = page.locator(".bootstrap-timepicker-hour");
    // Time - am/pm
    this.changeAmPmButton = page.locator("a[data-action='toggleMeridian']");
    this.getCurrentAmPm = page.locator(".bootstrap-timepicker-meridian");

  }

  async selectDate(date: string) {
    // accepts format example: 20 Jul 2025
    const [day,month,year] = date.split(" ");

    // shift to year and month
    await this.shiftToMonthButton.click();
    await this.shiftToYearButton.click();

    // select year
    await this.listOfYears.filter({ hasText: year.toString() }).click();

    // select month     
    await this.listOfMonths.filter({ hasText: await this.utils.customSubstring(month, 0, 3) }).click();

    // select date
    await this.listOfDates.filter({ hasText: day.toString()}).first().click();
  }

  async selectTime(time: string) {
    // accepts format example: 10:00 AM
    const [hour,minute,amPm] = time.split(" ");

    // select hour
    while(((await this.getCurrentHours.inputValue())?.trim() ?? "0") !== hour) {
      await this.decreaseHoursButton.waitFor({ state: "visible" });
      await this.decreaseHoursButton.click({ force: true });
    }

    // fill minute
    await this.getCurrentMinutes.clear();
    await this.getCurrentMinutes.type(minute);
    

    // select am/pm
    while((await this.getCurrentAmPm.inputValue())?.trim().toLowerCase() !== amPm.toLowerCase()) {
      await this.changeAmPmButton.first().waitFor({ state: "visible" });
      await this.changeAmPmButton.first().click({ force: true });
    }
  }




}