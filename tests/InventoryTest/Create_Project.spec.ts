import { test, expect } from '@playwright/test';
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { properties } from "../../properties/v2.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { SidePanal } from '../../pages/AdminAndSupportPages/SidePanal.ts';
import { CreateProjectPage } from '../../pages/InventoryPages/ProjectPage/CreateProjectPage.ts';
import { ProjectListingPage } from '../../pages/InventoryPages/ProjectPage/ProjectListingPage.ts';
import { UpdateProjectPage } from '../../pages/InventoryPages/ProjectPage/UpdateProjectPage.ts';  

test('Create Project', async ({ page }) => {
  
  const loginPage = new LoginPage(page);
  const utils = new Utils();
  const sidePanel = new SidePanal(page);
  const createProjectPage = new CreateProjectPage(page);
  const projectListingPage = new ProjectListingPage(page);
  const updateProjectPage = new UpdateProjectPage(page);

  const projectName = "Project "+ await utils.generateRandomString(6,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
  
  await loginPage.login(properties.PC_Client_Admin_user, properties.PASSWORD);
  await sidePanel.hoverOnProjectsProductsServiceAndClick();    
  await createProjectPage.clickOnNewProject();
  await createProjectPage.enterProjectName(projectName);
  await createProjectPage.enterDeveloperName();
  await createProjectPage.enterSales();
  await createProjectPage.enterPresales();
  await createProjectPage.clickOnSave();
  //assertion
  await expect (createProjectPage.isProjectCreatedSucessfully()).toBeTruthy();
  await createProjectPage.clickAllProjects();
  // Filter Project
  await projectListingPage.clickFilter();
  await projectListingPage.filterSelectProject(projectName);
  await projectListingPage.applyFilter();
  // Edit-Update Project
  await updateProjectPage.enterDescription();
  await createProjectPage.clickOnSave();
  //assertion
  await expect(updateProjectPage.isProjectUpdatedSuccessfully()).toBeTruthy();
});

  
