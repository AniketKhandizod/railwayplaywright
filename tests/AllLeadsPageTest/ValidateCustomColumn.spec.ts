import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { AheadOf, Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { LeadAPIUtils } from '../../utils/APIUtils/LeadAPIUtils.ts';
import { SidePanal } from "../../pages/AdminAndSupportPages/SidePanal.ts";
import { AllLeadsPage, DateFilter } from '../../pages/UserPages/AllLeadsPage.ts';
import { CRMAPIUtils, UserRoleFilter } from '../../utils/APIUtils/CRMAPIUtils.ts';

test.describe.configure({ mode: "parallel"});

const clientId = properties.Client_id;
const fullAccessAPI = properties.FullAccess_API;
const restrictedAccessAPI = properties.RestrictedAccess_API;

test('@smoke Validate custom column on all leads page', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const sidePanal = new SidePanal(page);
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const utils = new Utils();
    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales);
    const leadsName ="ES test "+ await utils.generateRandomString(4,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),leadsName,"","","",salesUserSummary.id,"");
    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);
    await loginPage.login(adminUserSummary.email, properties.PASSWORD);
    await sidePanal.clickOnAllLeads();

    const defaultColunmArray =["Lead id","Lead Score","Name","Requirement","Tags","Stage","Received on","Actions"];
    const customColumnArray = ["Lead id","Lead Score","Name","Bhk","Bathrooms","Call Lead","City","Country","Stage","Received on","Requirement","Tags","Actions"];

    const allLeadsPage = new AllLeadsPage(page);

    // Reset Custom Column
    await allLeadsPage.clickOnCustomColumnButton();
    await allLeadsPage.clickOnResetCustomColumnButton();

    expect((await allLeadsPage.getCustomColumnListAllLeadsPage()).length).toEqual(8);
    expect(await allLeadsPage.returnAllLeadsColumnNames()).toEqual(defaultColunmArray);

    // Apply Custom Column
    await allLeadsPage.clickOnCustomColumnButton();
    await allLeadsPage.checkBHKCustomColumn(true);
    await allLeadsPage.checkBathroomsCustomColumn(true);
    await allLeadsPage.checkCall_LeadCustomColumn(true);
    await allLeadsPage.checkCityCustomColumn(true);
    await allLeadsPage.checkCountryCustomColumn(true);

    // Get Custom Column List
    await allLeadsPage.clickOnApplyCustomColumnButton();
    expect((await allLeadsPage.getCustomColumnListAllLeadsPage()).length).toEqual(13);
    expect(await allLeadsPage.returnAllLeadsColumnNames()).toEqual(customColumnArray);
});

test('@smoke Validate apply todays date filter', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const sidePanal = new SidePanal(page);
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const utils = new Utils();
    const allLeadsPage = new AllLeadsPage(page);
    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales);
    const leadsName ="ES test "+ await utils.generateRandomString(4,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),leadsName,"","","",salesUserSummary.id,"");
    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);
    await loginPage.login(adminUserSummary.email, properties.PASSWORD);
    await sidePanal.clickOnAllLeads();


    const count1 = await allLeadsPage.getCountOfSearchList_ES();

    await allLeadsPage.clickOnFunnelButton();
    await allLeadsPage.selectDateFilter(DateFilter.Today);

    const count2 = await allLeadsPage.getCountOfSearchList_ES();

    expect(parseInt(count1 || '0')).toBeGreaterThan(parseInt(count2 || '0'));

    await allLeadsPage.clickOnFunnelButton();
    await allLeadsPage.clearAllFilterButton();

    const count3 = await allLeadsPage.getCountOfSearchList_ES();
    expect(parseInt(count3 || '0')).toBeGreaterThan(parseInt(count1 || '0'));   

});

test('@smoke Validate per page count on all leads page', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const sidePanal = new SidePanal(page);
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const utils = new Utils();
    const allLeadsPage = new AllLeadsPage(page);
    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales);
    const leadsName ="ES test "+ await utils.generateRandomString(4,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),leadsName,"","","",salesUserSummary.id,"");
    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);
    await loginPage.login(adminUserSummary.email, properties.PASSWORD);
    await sidePanal.clickOnAllLeads();

    const count1 = await allLeadsPage.getCountOfSearchList_ES();

    let countSelected = 10;
    await allLeadsPage.selectPerPageCount(countSelected);
    expect(await allLeadsPage.getCountOfAllLeadsRows()).toBe(countSelected);
    expect(await allLeadsPage.getCountOfSearchList_ES()).toBe(count1);

    countSelected = 50;
    await allLeadsPage.selectPerPageCount(countSelected);
    expect(await allLeadsPage.getCountOfAllLeadsRows()).toBe(countSelected);
    expect(await allLeadsPage.getCountOfSearchList_ES()).toBe(count1);

    countSelected = 30;
    await allLeadsPage.selectPerPageCount(countSelected);
    expect(await allLeadsPage.getCountOfAllLeadsRows()).toBe(countSelected);
    expect(await allLeadsPage.getCountOfSearchList_ES()).toBe(count1);

    countSelected = 25;
    await allLeadsPage.selectPerPageCount(countSelected);
    expect(await allLeadsPage.getCountOfAllLeadsRows()).toBe(countSelected);
    expect(await allLeadsPage.getCountOfSearchList_ES()).toBe(count1);

});
