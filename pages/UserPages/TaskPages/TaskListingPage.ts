import { Page, Locator, expect } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils";

export enum TaskStatus{
  All = "All",
  Open = "Open",
  Completed = "Completed",
  Archived = "Archived"
}

export class TaskListingPage {
  private  page: Page;
  private  utils: Utils;
  private  directionBar: Locator;
  private  waitTillDropdownResults: Locator;
  private  filterDropdownResults: Locator;
  private  taskTitleList: Locator;
  private  taskLeadIdList: Locator;
  private  taskAssignedBy: Locator;
  private  taskStatus: Locator;
  private  taskPriority: Locator;
  private  taskcreatedDate: Locator;
  private  taskDueDate: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils();

    // Direction change
    this.directionBar = page.locator(".task-select .select2-chosen");
    this.waitTillDropdownResults = page.locator("li.select2-highlighted");
    this.filterDropdownResults = page.locator("li.select2-result-selectable");

    // Listing elements
    this.taskTitleList = page.locator("#tasks_container td:nth-of-type(1) .td-bold");
    this.taskLeadIdList = page.locator("#tasks_container td:nth-of-type(1) a");
    this.taskAssignedBy = page.locator("#tasks_container td:nth-of-type(2)");
    this.taskStatus = page.locator("#tasks_container td:nth-of-type(3)");
    this.taskPriority = page.locator("#tasks_container td:nth-of-type(4)");
    this.taskcreatedDate = page.locator("#tasks_container td:nth-of-type(5)");
    this.taskDueDate = page.locator("#tasks_container td:nth-of-type(6)");
  }

  async selectTaskStatus(status: TaskStatus){
    await this.directionBar.click();
    await this.waitTillDropdownResults.waitFor({ state: "visible" });
    await this.filterDropdownResults.filter({ hasText: status }).click();
  }

  async getTaskTitleList(){
    return (await this.taskTitleList.first().textContent() ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  async getTaskLeadIdList(){
    return (await this.taskLeadIdList.first().textContent() ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  async getTaskAssignedBy(){
    return (await this.taskAssignedBy.first().textContent() ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  async getTaskStatus(){
    return (await this.taskStatus.first().textContent() ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  async getTaskPriority(){
    return (await this.taskPriority.first().textContent() ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  async getTaskcreatedDate(){
    return (await this.taskcreatedDate.first().textContent() ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  async getTaskDueDate(){
    return (await this.taskDueDate.first().textContent() ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

}