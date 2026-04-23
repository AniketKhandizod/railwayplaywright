import { Page, Locator } from "@playwright/test";
import { Utils } from "../../../utils/PlaywrightTestUtils";

export enum TaskPriority {
    Low = "Low",
    Medium = "Medium",
    High = "High"
}
export class TaskForm {

    private readonly page: Page;
    private readonly utils: Utils;
    private readonly projectDropdown: Locator;
    private readonly taskTitle: Locator;
    private readonly taskDescription: Locator;
    private readonly taskDueDate: Locator;
    private readonly taskTime: Locator;
    private readonly taskRemark: Locator;
    private readonly taskPriority: Locator;
    private readonly taskSave: Locator;

    constructor(page: Page) {
        this.page = page;
        this.utils = new Utils();
        this.taskTitle = page.locator("input[name='task[title]']");
        this.taskDescription = page.locator("textarea[name='task[description]']");
        this.taskDueDate = page.locator("input[name='task[due_date]']");
        this.taskTime = page.locator("input[name='task[due_time]']");
        this.taskRemark = page.locator("[name='task[remark]']");
        this.taskPriority = page.locator("select[name='task[priority]']");
        this.taskSave = page.locator("button.btn.btn-primary.btn-sm.pull-right.save");

    }

    async enterTaskTitle(title: string) {
        await this.taskTitle.fill(title);
    }

    async enterTaskDescription(description: string) {
        await this.taskDescription.fill(description);
    }

    async enterTaskDueDate() {
        await this.taskDueDate.click();
    }

    async enterTaskTime() {
        await this.taskTime.click();
    }

    async enterTaskRemark(remark: string) {
        await this.taskRemark.fill(remark);
    }

    async selectTaskPriority(priority: TaskPriority) {
        await this.taskPriority.selectOption(priority);
    }

    async clickOnTaskSave() {
        await this.taskSave.click();
    }
}