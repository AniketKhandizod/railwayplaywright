import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { AheadOf, Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { SettingPage } from '../../pages/AdminAndSupportPages/SettingsPages/SettingPage.ts';
import { SearchListListingPage } from '../../pages/AdminAndSupportPages/SearchListPages/SearchListListingPage.ts';
import { CreateSearchListPage, Purpose } from '../../pages/AdminAndSupportPages/SearchListPages/CreateSearchListListingPage.ts';
import { UserDashboard } from '../../pages/UserPages/DashboardPage.ts';
import { SidePanal } from '../../pages/AdminAndSupportPages/SidePanal.ts';
import { AllLeadsPage } from '../../pages/UserPages/AllLeadsPage.ts';
import { SearchListAPIUtils } from '../../utils/APIUtils/SearchListAPIUtils.ts';

test.describe.configure({ mode: "serial"});

test.beforeEach(async () => {
    const searchListAPIUtils = new SearchListAPIUtils(properties.Client_id, properties.FullAccess_API);
    await searchListAPIUtils.toggleAllSearchListsDashboardVisibility(false);
});

test('Search list creation and dashboard count verification on user dashboard', async ({ browser }) => {
    const page = await browser.newPage();
    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const searchListListingPage = new SearchListListingPage(page);
    const createSearchListPage = new CreateSearchListPage(page);

    const searchListName = await utils.generateRandomString(10,{casing: 'lower',includeNumbers: true,includeSpecialChars: false});

    await loginPage.login(properties.Admin_email, properties.PASSWORD);

    await settingPage.clickOnSearchLists();

    await searchListListingPage.navigateToSearchListListing();
    await createSearchListPage.createSearchListListing(searchListName);
    await createSearchListPage.selectScheduleActivity();
    await createSearchListPage.selectSelectTheOrder();
    await createSearchListPage.selectSearchListPrimarySalesPerson(properties.Sales_Name_SearchList);
    await createSearchListPage.selectPurpose(Purpose.Sales);
    await createSearchListPage.selectPurpose(Purpose.PreSales);
    await createSearchListPage.selectDisplayOnUsersDashboard(true);

    await createSearchListPage.navigateToInterestedProjectPanal();
    await createSearchListPage.selectProject(properties.Project_Name);
    expect(await createSearchListPage.saveSearchList()).toBe("List created successfully");

    const page2 = await browser.newPage();

    const loginPage2 = new LoginPage(page2);
    const userDashboard2 = new UserDashboard(page2);

    await loginPage2.login(properties.Sales_Email_SearchList, properties.PASSWORD);

    await userDashboard2.refreshDashboard();
    const dashboardTitle = await userDashboard2.getDashboardTitle();

    const count = await dashboardTitle.count();
    let countBefore = 0; 
    let countFound = 0;
    let found = false;
    for (let i = 0; i < count; i++) {
        const textContent = (await dashboardTitle.nth(i).textContent())?.toLowerCase();
        if (textContent?.includes(searchListName)) {
            found = true;
            countBefore++;
            countFound = i;
            break;
        }
    }
    expect(found).toBe(true);
    expect(countBefore).toBe(1);
});

test('Search list creation for sales presales and apply filter for dashboard and compare count with dashboard', async ({ browser }) => {
    const page = await browser.newPage();
    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const searchListListingPage = new SearchListListingPage(page);
    const createSearchListPage = new CreateSearchListPage(page);
    const sidebar = new SidePanal(page);
    const allLeadsPage = new AllLeadsPage(page);

    const searchListName = await utils.generateRandomString(10,{casing: 'lower',includeNumbers: true,includeSpecialChars: false});

    await loginPage.login(properties.Admin_email, properties.PASSWORD);

    await settingPage.clickOnSearchLists();

    await searchListListingPage.navigateToSearchListListing();
    await createSearchListPage.createSearchListListing(searchListName);
    await createSearchListPage.selectScheduleActivity();
    await createSearchListPage.selectSelectTheOrder();
    await createSearchListPage.selectSelectTheOrder();
    await createSearchListPage.selectSearchListPrimarySalesPerson(properties.Sales_Name_SearchList);
    await createSearchListPage.selectPurpose(Purpose.Sales);
    await createSearchListPage.selectPurpose(Purpose.PreSales);
    await createSearchListPage.selectDisplayOnUsersDashboard(true);

    await createSearchListPage.navigateToInterestedProjectPanal();
    await createSearchListPage.selectProject(properties.Project_Name);
    expect(await createSearchListPage.saveSearchList()).toBe("List created successfully");

    await searchListListingPage.searchListSearchByName(searchListName);

    const firstSearchListName = await searchListListingPage.getFirstSearchListName();
    const firstSearchListCreationDate = await searchListListingPage.getFirstSearchListCreationDate();
    const firstSearchListType = await searchListListingPage.getFirstSearchListType();
    const firstSearchListAvailableFor = await searchListListingPage.getFirstSearchListAvailableFor();
    expect(firstSearchListName).toBe(searchListName);
    expect(firstSearchListCreationDate?.trim()).toContain(await utils.calculateFutureDate(AheadOf.Day,0,"dd/MM/yyyy hh:"));
    expect(firstSearchListType).toBe("user generated");
    expect(firstSearchListAvailableFor).toBe(`${Purpose.Sales.toLowerCase()} and ${Purpose.PreSales.toLowerCase()}`);

    await sidebar.clickOnAllLeads();

    await allLeadsPage.selectSearchListByName(searchListName);
    await allLeadsPage.openFilter();
    await allLeadsPage.clearAllFilters();
    await allLeadsPage.openFilter();
    await allLeadsPage.selectSearchListByName(searchListName);
    await allLeadsPage.applyPrimarySalesPersonFilter(properties.Sales_Name_SearchList);
    await allLeadsPage.clickOnApplyFilterButton();

    const count1 = await allLeadsPage.getCountOfSearchList();

    const page2 = await browser.newPage();
    const loginPage2 = new LoginPage(page2);
    const userDashboard2 = new UserDashboard(page2);

        await loginPage2.login(properties.Sales_Email_SearchList, properties.PASSWORD);

        await userDashboard2.refreshDashboard();
        const dashboardTitle2 = await userDashboard2.getDashboardTitle();

        const count = await dashboardTitle2.count();
        let countBefore = 0; 
        let countFound = 0;
        let found = false;
        for (let i = 0; i < count; i++) {
            const textContent = (await dashboardTitle2.nth(i).textContent())?.toLowerCase();
            if (textContent?.includes(searchListName)) {
                found = true;
                countBefore++;
                countFound = i;
                break;      
            }
        }
        expect(found).toBe(true);
        expect(countBefore).toBe(1);
        const length = await dashboardTitle2.count();
        expect((await dashboardTitle2.nth(length-2).textContent())?.trim()).toBe(count1);
});