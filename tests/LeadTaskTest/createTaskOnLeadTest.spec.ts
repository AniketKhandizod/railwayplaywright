import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { AheadOf, Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { LeadAPIUtils } from '../../utils/APIUtils/LeadAPIUtils.ts';
import { GlobalSearchPage } from '../../pages/AdminAndSupportPages/GlobalSearchPage.ts';
import { LeadProfilePage, TaskDetailsOnLeadProfile, TaskType } from '../../pages/UserPages/leadProfilePage.ts';
import { NotyMessage } from '../../pages/AdminAndSupportPages/NotyMessage.ts';
import { DatePicker } from '../../pages/UserPages/DatePicker.ts';
import { TaskForm, TaskPriority } from '../../pages/UserPages/Forms/TaskForm.ts';
import { SidePanal } from '../../pages/AdminAndSupportPages/SidePanal.ts';
import { TaskListingPage, TaskStatus } from '../../pages/UserPages/TaskPages/TaskListingPage.ts';
import { UserManagementAPIUtils } from '../../utils/APIUtils/UserManagementAPIUtils.ts';

test.describe.configure({ mode: "parallel"});
test('Validate send email to lead', async ({ page }) => {

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const globalSearchPage = new GlobalSearchPage(page);
    const leadPage = new LeadProfilePage(page);
    const notyMessage = new NotyMessage(page);
    const datePicker = new DatePicker(page);
    const taskForm = new TaskForm(page);
    const sidePanal = new SidePanal(page);
    const taskListingPage = new TaskListingPage(page);

    const leadName = "test lead for task "+ await utils.generateRandomString(5,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const taskTitle = "test task for lead "+ await utils.generateRandomString(50,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const taskDescription = "test description for lead "+ await utils.generateRandomString(50,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const taskRemark = "test remark for lead "+ await utils.generateRandomString(50,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const dueDate = await utils.calculateFutureDate(AheadOf.Day, 1, 'DD');
    const emailTo = await utils.generateRandomEmail();

    await loginPage.login(properties.Sales_email, properties.PASSWORD);

    let LeadId = (await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), emailTo,leadName,"","","",properties.Sales_id,"")).sell_do_lead_id;
    await globalSearchPage.globalSearch("#"+LeadId);

    await leadPage.clickOnPendingTaskButton();
    await leadPage.clickOnAddTaskButtonList(TaskType.Open);
    await leadPage.clickOnAddTaskButton();

    await taskForm.enterTaskTitle(taskTitle);
    await taskForm.enterTaskDescription(taskDescription);
    await taskForm.enterTaskDueDate();
    await datePicker.selectDate(dueDate);
    await taskForm.enterTaskTime();
    await datePicker.selectTime(await utils.calculateFutureDate(AheadOf.Hour, 1, 'h mm a'));
    await taskForm.enterTaskRemark(taskRemark);
    await taskForm.selectTaskPriority(TaskPriority.Medium);
    await taskForm.clickOnTaskSave();
    expect(await notyMessage.getNotyMessage(false)).toContain("Task saved successfully.");
    expect(await leadPage.getPendingTaskCount()).toEqual("1 tasks");

    await sidePanal.clickOnAllTask();

    await taskListingPage.selectTaskStatus(TaskStatus.All);
    expect(await taskListingPage.getTaskTitleList()).toContain(taskTitle);
    expect(await taskListingPage.getTaskLeadIdList()).toEqual("#"+LeadId);
    expect(await taskListingPage.getTaskAssignedBy()).toContain(properties.Sales_name.toLowerCase() +" . by "+properties.Sales_name.toLowerCase()+" .");
    expect(await taskListingPage.getTaskStatus()).toContain("open");
    expect(await taskListingPage.getTaskPriority()).toContain(TaskPriority.Medium.toLowerCase());
    expect(await taskListingPage.getTaskcreatedDate()).toContain((await utils.calculateFutureDate(AheadOf.Day, 0, 'MMM d, yyyy')).toLowerCase());
    expect(await taskListingPage.getTaskDueDate()).toContain((await utils.calculateFutureDate(AheadOf.Day, 1, 'MMM d, yyyy')).toLowerCase());
});

test('Validate edit task on lead', async ({ page }) => {

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const globalSearchPage = new GlobalSearchPage(page);
    const leadPage = new LeadProfilePage(page);
    const notyMessage = new NotyMessage(page);
    const taskForm = new TaskForm(page);
    const sidePanal = new SidePanal(page);
    const taskListingPage = new TaskListingPage(page);

    const leadName = "test lead for task "+ await utils.generateRandomString(5,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const taskTitle = "test task for lead "+ await utils.generateRandomString(50,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const taskRemark = "test description for lead "+ await utils.generateRandomString(50,{casing:'lower',includeNumbers:false,includeSpecialChars:false});

    await loginPage.login(properties.PreSales_email, properties.PASSWORD);

    const lead = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),leadName,"","","",properties.PreSales_id,"");
    await leadAPIUtils.addTaskToLeadWithAPIKey(lead.sell_do_lead_id, properties.PreSales_email);

    await globalSearchPage.globalSearch("#"+lead.sell_do_lead_id);

    await leadPage.clickOnTaskEllipsisButtonAndSelectOption("Edit");
    await taskForm.enterTaskTitle(taskTitle);
    await taskForm.enterTaskRemark(taskRemark);
    await taskForm.selectTaskPriority(TaskPriority.Medium);
    await taskForm.clickOnTaskSave();
    expect(await notyMessage.getNotyMessage(false)).toContain("Task saved successfully.");
    expect(await leadPage.getPendingTaskCount()).toEqual("1 tasks");

    await sidePanal.clickOnAllTask();

    await taskListingPage.selectTaskStatus(TaskStatus.All);
    expect(await taskListingPage.getTaskTitleList()).toContain(taskTitle);
    expect(await taskListingPage.getTaskLeadIdList()).toEqual("#"+lead.sell_do_lead_id);
});

test('Validate mark task as completed', async ({ page }) => {

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const globalSearchPage = new GlobalSearchPage(page);
    const leadPage = new LeadProfilePage(page);
    const notyMessage = new NotyMessage(page);
    const datePicker = new DatePicker(page);
    const taskForm = new TaskForm(page);
    const sidePanal = new SidePanal(page);
    const taskListingPage = new TaskListingPage(page);
    const userManagementAPIUtils = new UserManagementAPIUtils(properties.Client_id, properties.FullAccess_API);

    const leadName = "test lead for task "+ await utils.generateRandomString(5,{casing:'lower',includeNumbers:false,includeSpecialChars:false});

    await loginPage.login(properties.PreSalesManager_email, properties.PASSWORD);

    const lead = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),leadName,"","","",properties.PreSales_id_Manager,"");
    await leadAPIUtils.addTaskToLeadWithAPIKey(lead.sell_do_lead_id, properties.PreSalesManager_email);

    await globalSearchPage.globalSearch("#"+lead.sell_do_lead_id);


    //await leadPage.clickOnTaskActivityEllipsisButton();
    await leadPage.clickOnMarkTaskCompletedOption();
    expect(await notyMessage.getNotyMessage(false)).toContain("Task status updated successfully.");
    await utils.waitTillFullPageLoad(page);

    expect(await leadPage.getTaskDetailsOnLeadProgile(TaskDetailsOnLeadProfile.TaskDescription)).toContain("description");
    expect(await leadPage.getTaskDetailsOnLeadProgile(TaskDetailsOnLeadProfile.TaskPriority)).toContain(TaskPriority.Medium.toLowerCase());
    expect(await leadPage.getTaskDetailsOnLeadProgile(TaskDetailsOnLeadProfile.TaskCompletedOn)).toContain("today at "+(await utils.calculateFutureDate(AheadOf.Day, 0, 'h:')).toLowerCase()); // >> output >> Today at 4:32 PM
    expect(await leadPage.getTaskDetailsOnLeadProgile(TaskDetailsOnLeadProfile.TaskCreator)).toContain((await userManagementAPIUtils.getUserFullName(properties.PreSales_id_Manager)).toLowerCase());
    expect(await leadPage.getTaskDetailsOnLeadProgile(TaskDetailsOnLeadProfile.TaskAssigned)).toContain((await userManagementAPIUtils.getUserFullName(properties.PreSales_id_Manager)).toLowerCase());
    expect(await leadPage.getTaskDetailsOnLeadProgile(TaskDetailsOnLeadProfile.TaskRemark)).toContain("rem");

    await sidePanal.clickOnAllTask();
    await taskListingPage.selectTaskStatus(TaskStatus.Completed);
    expect(await taskListingPage.getTaskTitleList()).toContain("title");
    expect(await taskListingPage.getTaskLeadIdList()).toEqual("#"+lead.sell_do_lead_id);
    expect(await taskListingPage.getTaskStatus()).toContain("completed");
    expect(await taskListingPage.getTaskPriority()).toContain(TaskPriority.Medium.toLowerCase());
    expect(await taskListingPage.getTaskcreatedDate()).toContain((await utils.calculateFutureDate(AheadOf.Day, 0, 'MMM d, yyyy')).toLowerCase());
    expect(await taskListingPage.getTaskDueDate()).toContain((await utils.calculateFutureDate(AheadOf.Day, 1, 'MMM d, yyyy')).toLowerCase());

});

test('Validate mark task as archived', async ({ page }) => {

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const globalSearchPage = new GlobalSearchPage(page);
    const leadPage = new LeadProfilePage(page);
    const notyMessage = new NotyMessage(page);
    const datePicker = new DatePicker(page);
    const taskForm = new TaskForm(page);
    const sidePanal = new SidePanal(page);
    const taskListingPage = new TaskListingPage(page);
    const userManagementAPIUtils = new UserManagementAPIUtils(properties.Client_id, properties.FullAccess_API);

    const leadName = "test lead for task "+ await utils.generateRandomString(5,{casing:'lower',includeNumbers:false,includeSpecialChars:false});

    await loginPage.login(properties.PreSalesManager_email, properties.PASSWORD);

    const lead = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),leadName,"","","",properties.PreSales_id_Manager,"");
    await leadAPIUtils.addTaskToLeadWithAPIKey(lead.sell_do_lead_id, properties.PreSalesManager_email);

    await globalSearchPage.globalSearch("#"+lead.sell_do_lead_id);


    //await leadPage.clickOnTaskActivityEllipsisButton();
    await leadPage.clickOnMarkTaskArchivedOption();
    expect(await notyMessage.getNotyMessage(false)).toContain("Task status updated successfully.");
    await utils.waitTillFullPageLoad(page);

    expect(await leadPage.getTaskDetailsOnLeadProgile(TaskDetailsOnLeadProfile.TaskDescription)).toContain("description");
    expect(await leadPage.getTaskDetailsOnLeadProgile(TaskDetailsOnLeadProfile.TaskPriority)).toContain(TaskPriority.Medium.toLowerCase());
    expect(await leadPage.getTaskDetailsOnLeadProgile(TaskDetailsOnLeadProfile.TaskCompletedOn)).toContain("-"); // >> output >> Today at 4:32 PM
    expect(await leadPage.getTaskDetailsOnLeadProgile(TaskDetailsOnLeadProfile.TaskCreator)).toContain((await userManagementAPIUtils.getUserFullName(properties.PreSales_id_Manager)).toLowerCase());
    expect(await leadPage.getTaskDetailsOnLeadProgile(TaskDetailsOnLeadProfile.TaskAssigned)).toContain((await userManagementAPIUtils.getUserFullName(properties.PreSales_id_Manager)).toLowerCase());
    expect(await leadPage.getTaskDetailsOnLeadProgile(TaskDetailsOnLeadProfile.TaskRemark)).toContain("rem");

    await sidePanal.clickOnAllTask();
    await taskListingPage.selectTaskStatus(TaskStatus.Archived);
    expect(await taskListingPage.getTaskTitleList()).toContain("title");
    expect(await taskListingPage.getTaskLeadIdList()).toEqual("#"+lead.sell_do_lead_id);
    expect(await taskListingPage.getTaskStatus()).toContain("archived");
    expect(await taskListingPage.getTaskPriority()).toContain(TaskPriority.Medium.toLowerCase());
    expect(await taskListingPage.getTaskcreatedDate()).toContain((await utils.calculateFutureDate(AheadOf.Day, 0, 'MMM d, yyyy')).toLowerCase());
    expect(await taskListingPage.getTaskDueDate()).toContain((await utils.calculateFutureDate(AheadOf.Day, 1, 'MMM d, yyyy')).toLowerCase());

});
