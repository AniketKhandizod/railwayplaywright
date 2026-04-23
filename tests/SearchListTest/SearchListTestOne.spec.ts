import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { SettingPage } from '../../pages/AdminAndSupportPages/SettingsPages/SettingPage.ts';
import { SearchListListingPage } from '../../pages/AdminAndSupportPages/SearchListPages/SearchListListingPage.ts';
import { CreateSearchListPage, Purpose } from '../../pages/AdminAndSupportPages/SearchListPages/CreateSearchListListingPage.ts';
import { LeadAPIUtils } from '../../utils/APIUtils/LeadAPIUtils.ts';
import { SearchListAPIUtils } from '../../utils/APIUtils/SearchListAPIUtils.ts';
import { CRMAPIUtils, UserRoleFilter } from '../../utils/APIUtils/CRMAPIUtils.ts';

const clientId = properties.Client_id;
const fullAccessAPI = properties.FullAccess_API;
const restrictedAccessAPI = properties.RestrictedAccess_API;

test('Search list creation and count verification', async ({ page }) => {

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const searchListListingPage = new SearchListListingPage(page);
    const createSearchListPage = new CreateSearchListPage(page);
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const searchListAPIUtils = new SearchListAPIUtils(clientId, fullAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const adminSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin, { index: 1 });
    const salesSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales, { index: 1 });
    const projectSummary = await crmAPIUtils.getFirstActiveProjectSummary({ index: 1 });


    const searchListName = await utils.generateRandomString(10,{casing: 'lower',includeNumbers: true,includeSpecialChars: false});

    await loginPage.login(adminSummary.email, properties.PASSWORD);

    await settingPage.clickOnSearchLists();

    await searchListListingPage.navigateToSearchListListing();
    await createSearchListPage.createSearchListListing(searchListName);
    await createSearchListPage.selectScheduleActivity();
    await createSearchListPage.selectSelectTheOrder();
    await createSearchListPage.selectSearchListPrimarySalesPerson(salesSummary.name);
    await createSearchListPage.selectPurpose(Purpose.Marketing);
    await createSearchListPage.selectPurpose(Purpose.Export);
    await createSearchListPage.selectDisplayOnUsersDashboard(false);

    await createSearchListPage.navigateToInterestedProjectPanal();
    await createSearchListPage.selectProject(projectSummary.name);
    expect(await createSearchListPage.saveSearchList()).toBe("List created successfully");

    await searchListListingPage.searchListSearchByName(searchListName);

    const count = await searchListListingPage.getCountOfLeads();
    expect(count?.split(":")[0].trim().split(" ")[5].trim().toLowerCase()).toBe(searchListName.toLowerCase());
    const SLCount = parseInt(count?.split(":")[1].trim().split(" ")[0] || "0");
    expect(SLCount).toBeGreaterThan(0);
    const id = await searchListListingPage.clickOnEditSearchList();

    expect(SLCount).toEqual(await searchListAPIUtils.getSearchListCountByAdmin(""+id));

    await utils.sleep(10000);
    const leadId = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),"PlayWright","","",projectSummary.id,salesSummary.id,"");
    const count2 = await searchListAPIUtils.getSearchListCountByAdmin(""+id);
    expect(count2).toBeGreaterThan(parseInt(count?.split(":")[1].trim().split(" ")[0] || "0"));
   
    await utils.sleep(10000);
    const leadId2 = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),"PlayWright","","",projectSummary.id,salesSummary.id,"");
    const count3 = await searchListAPIUtils.getSearchListCountByAdmin(""+id);
    expect(count3).toBeGreaterThan(count2);
});
