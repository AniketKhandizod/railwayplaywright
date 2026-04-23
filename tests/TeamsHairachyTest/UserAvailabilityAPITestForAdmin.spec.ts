import { test, expect } from '@playwright/test';
import { CRMAPIUtils, UserRoleFilter, ClientConfigFormTrueFalse, ClientConfigFormOneZero, LeadMergeAccessRole } from '../../utils/APIUtils/CRMAPIUtils';
import { properties } from '../../properties/v2';
import { SearchListAPIUtils } from '../../utils/APIUtils/SearchListAPIUtils';
import { UserAPIUtils } from '../../utils/APIUtils/UserAPIUtils';

const fullAccessAPI = "7f0bba94f03f6a84d914d59f49922e32";
const clientId = "69e22982b08345971a09d552";
const restrictedAccessAPI = "b78a825eaeccd429ebd0b2f672cec7fc";

test.describe.configure({ mode: "serial" });

test('Validate all flag and lead visiblity', async () => {


    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const searchListAPIUtils = new SearchListAPIUtils(clientId, fullAccessAPI);
    const userAPIUtils = new UserAPIUtils(clientId, fullAccessAPI);
    const allLeadsPageListId = "69e22982b08345971a09d55d";
    const thiredTeamID = "69e22a86b08345971a09d7a7";
    const thiredTeamIDLast = "69e22a90b08345971a09d7aa";
    const adminLeadCount = 12;

    const Top_Sales = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index: 0});
    const Second_01_Sales = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index: 1});
    const Second_02_Sales = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index: 2});
    const Thired_01_Sales = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index: 3});
    const Thired_02_Sales = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index: 4});
    const Fourth_01_Sales = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index: 5});

    const Top_Manager = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.SalesManager,{index: 0});
    const Second_01_Manager = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.SalesManager,{index: 1});
    const Second_02_Manager = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.SalesManager,{index: 2});
    const Thired_01_Manager = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.SalesManager,{index: 3});
    const Thired_02_Manager = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.SalesManager,{index: 4});
    const Fourth_01_Manager = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.SalesManager,{index: 5});

    await userAPIUtils.setTeamAlliedUsers(thiredTeamID, [],[]);

    // get search list count for admin
    const Admin_SearchListCount = await searchListAPIUtils.getSearchListCountByAdmin(allLeadsPageListId);
    expect(Admin_SearchListCount).toEqual(adminLeadCount);

    // get search list count for sales
    const Top_Sales_SearchListCount = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Top_Sales.email);
    expect(Top_Sales_SearchListCount).toEqual(1);
    const Second_01_Sales_SearchListCount = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Second_01_Sales.email);
    expect(Second_01_Sales_SearchListCount).toEqual(1);
    const Second_02_Sales_SearchListCount = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Second_02_Sales.email);
    expect(Second_02_Sales_SearchListCount).toEqual(1);
    const Thired_01_Sales_SearchListCount = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Thired_01_Sales.email);
    expect(Thired_01_Sales_SearchListCount).toEqual(1);
    const Thired_02_Sales_SearchListCount = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Thired_02_Sales.email);
    expect(Thired_02_Sales_SearchListCount).toEqual(1);
    const Fourth_01_Sales_SearchListCount = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Fourth_01_Sales.email);
    expect(Fourth_01_Sales_SearchListCount).toEqual(1);
  
    // get search list count for managers
    const Top_Manager_SearchListCount = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Top_Manager.email);
    expect(Top_Manager_SearchListCount).toEqual(8);
    const Second_01_Manager_SearchListCount = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Second_01_Manager.email);
    expect(Second_01_Manager_SearchListCount).toEqual(2);
    const Second_02_Manager_SearchListCount = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Second_02_Manager.email);
    expect(Second_02_Manager_SearchListCount).toEqual(4);
    const Thired_01_Manager_SearchListCount = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Thired_01_Manager.email);
    expect(Thired_01_Manager_SearchListCount).toEqual(2);
    const Thired_02_Manager_SearchListCount = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Thired_02_Manager.email);
    expect(Thired_02_Manager_SearchListCount).toEqual(4);
    const Fourth_01_Manager_SearchListCount = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Fourth_01_Manager.email);
    expect(Fourth_01_Manager_SearchListCount).toEqual(2);

    await userAPIUtils.setTeamAlliedUsers(thiredTeamID, [Thired_02_Sales.id, Thired_02_Manager.id],[]);

    // get search list count for admin after setting allied users
    const Admin_SearchListCount_After = await searchListAPIUtils.getSearchListCountByAdmin(allLeadsPageListId);
    expect(Admin_SearchListCount_After).toEqual(adminLeadCount);

    // get search list count for sales after setting allied users
    const Top_Sales_SearchListCount_After = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Top_Sales.email);
    expect(Top_Sales_SearchListCount_After).toEqual(1);
    const Second_01_Sales_SearchListCount_After = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Second_01_Sales.email);
    expect(Second_01_Sales_SearchListCount_After).toEqual(1);
    const Second_02_Sales_SearchListCount_After = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Second_02_Sales.email);
    expect(Second_02_Sales_SearchListCount_After).toEqual(1);
    const Thired_01_Sales_SearchListCount_After = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Thired_01_Sales.email);
    expect(Thired_01_Sales_SearchListCount_After).toEqual(1);
    const Thired_02_Sales_SearchListCount_After = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Thired_02_Sales.email);
    expect(Thired_02_Sales_SearchListCount_After).toEqual(1);
    const Fourth_01_Sales_SearchListCount_After = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Fourth_01_Sales.email);
    expect(Fourth_01_Sales_SearchListCount_After).toEqual(1);
    
    // get search list count for managers after setting allied users
    const Top_Manager_SearchListCount_After = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Top_Manager.email);
    expect(Top_Manager_SearchListCount_After).toEqual(8);
    const Second_01_Manager_SearchListCount_After = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Second_01_Manager.email);
    expect(Second_01_Manager_SearchListCount_After).toEqual(2);
    const Second_02_Manager_SearchListCount_After = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Second_02_Manager.email);
    expect(Second_02_Manager_SearchListCount_After).toEqual(4);
    const Thired_01_Manager_SearchListCount_After = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Thired_01_Manager.email);
    expect(Thired_01_Manager_SearchListCount_After).toEqual(4);
    const Thired_02_Manager_SearchListCount_After = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Thired_02_Manager.email);
    expect(Thired_02_Manager_SearchListCount_After).toEqual(4);
    const Fourth_01_Manager_SearchListCount_After = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Fourth_01_Manager.email);
    expect(Fourth_01_Manager_SearchListCount_After).toEqual(2);


    await crmAPIUtils.updateClientConfigurationTeamAccessLeadExportAndSearch({
      teamBasedAccess: ClientConfigFormTrueFalse.True,
      leadDetailsForExport: ClientConfigFormTrueFalse.False,
      allowSearchAccessSecondarySales: ClientConfigFormOneZero.True,
      allowSearchAccessTeamSales: ClientConfigFormOneZero.True,
      allowSearchAccessOtherSales: ClientConfigFormOneZero.True,
      leadMergeAccess: [LeadMergeAccessRole.Sales, LeadMergeAccessRole.Manager, LeadMergeAccessRole.Admin, LeadMergeAccessRole.PreSales],
    });

    // get search list count for admin after updating client configuration
    const Admin_SearchListCount_After_ClientConfiguration = await searchListAPIUtils.getSearchListCountByAdmin(allLeadsPageListId);
    expect(Admin_SearchListCount_After_ClientConfiguration).toEqual(adminLeadCount);

    // get search list count for sales after updating client configuration
    const Top_Sales_SearchListCount_After_ClientConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Top_Sales.email);
    expect(Top_Sales_SearchListCount_After_ClientConfiguration).toEqual(1);
    const Second_01_Sales_SearchListCount_After_ClientConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Second_01_Sales.email);
    expect(Second_01_Sales_SearchListCount_After_ClientConfiguration).toEqual(1);
    const Second_02_Sales_SearchListCount_After_ClientConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Second_02_Sales.email);
    expect(Second_02_Sales_SearchListCount_After_ClientConfiguration).toEqual(1);
    const Thired_01_Sales_SearchListCount_After_ClientConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Thired_01_Sales.email);
    expect(Thired_01_Sales_SearchListCount_After_ClientConfiguration).toEqual(1);
    const Thired_02_Sales_SearchListCount_After_ClientConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Thired_02_Sales.email);
    expect(Thired_02_Sales_SearchListCount_After_ClientConfiguration).toEqual(1);
    const Fourth_01_Sales_SearchListCount_After_ClientConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Fourth_01_Sales.email);
    expect(Fourth_01_Sales_SearchListCount_After_ClientConfiguration).toEqual(1);
    
    // get search list count for managers after updating client configuration
    const Top_Manager_SearchListCount_After_ClientConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Top_Manager.email);
    expect(Top_Manager_SearchListCount_After_ClientConfiguration).toEqual(8);
    const Second_01_Manager_SearchListCount_After_ClientConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Second_01_Manager.email);
    expect(Second_01_Manager_SearchListCount_After_ClientConfiguration).toEqual(2);
    const Second_02_Manager_SearchListCount_After_ClientConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Second_02_Manager.email);
    expect(Second_02_Manager_SearchListCount_After_ClientConfiguration).toEqual(4);
    const Thired_01_Manager_SearchListCount_After_ClientConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Thired_01_Manager.email);
    expect(Thired_01_Manager_SearchListCount_After_ClientConfiguration).toEqual(4);
    const Thired_02_Manager_SearchListCount_After_ClientConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Thired_02_Manager.email);
    expect(Thired_02_Manager_SearchListCount_After_ClientConfiguration).toEqual(4);
    const Fourth_01_Manager_SearchListCount_After_ClientConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Fourth_01_Manager.email);
    expect(Fourth_01_Manager_SearchListCount_After_ClientConfiguration).toEqual(2);

    await userAPIUtils.setTeamAlliedUsers(thiredTeamID, [],[thiredTeamIDLast]);

    // get search list count for admin after updating team configuration
    const Admin_SearchListCount_After_TeamConfiguration = await searchListAPIUtils.getSearchListCountByAdmin(allLeadsPageListId);
    expect(Admin_SearchListCount_After_TeamConfiguration).toEqual(adminLeadCount);

    // get search list count for sales after updating team configuration
    const Top_Sales_SearchListCount_After_TeamConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Top_Sales.email);
    expect(Top_Sales_SearchListCount_After_TeamConfiguration).toEqual(1);
    const Second_01_Sales_SearchListCount_After_TeamConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Second_01_Sales.email);
    expect(Second_01_Sales_SearchListCount_After_TeamConfiguration).toEqual(1);
    const Second_02_Sales_SearchListCount_After_TeamConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Second_02_Sales.email);
    expect(Second_02_Sales_SearchListCount_After_TeamConfiguration).toEqual(1);
    const Thired_01_Sales_SearchListCount_After_TeamConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Thired_01_Sales.email);
    expect(Thired_01_Sales_SearchListCount_After_TeamConfiguration).toEqual(1);
    const Thired_02_Sales_SearchListCount_After_TeamConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Thired_02_Sales.email);
    expect(Thired_02_Sales_SearchListCount_After_TeamConfiguration).toEqual(1);
    const Fourth_01_Sales_SearchListCount_After_TeamConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Fourth_01_Sales.email);
    expect(Fourth_01_Sales_SearchListCount_After_TeamConfiguration).toEqual(1);
    
    // get search list count for managers after updating team configuration
    const Top_Manager_SearchListCount_After_TeamConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Top_Manager.email);
    expect(Top_Manager_SearchListCount_After_TeamConfiguration).toEqual(8);
    const Second_01_Manager_SearchListCount_After_TeamConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Second_01_Manager.email);
    expect(Second_01_Manager_SearchListCount_After_TeamConfiguration).toEqual(2);
    const Second_02_Manager_SearchListCount_After_TeamConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Second_02_Manager.email);
    expect(Second_02_Manager_SearchListCount_After_TeamConfiguration).toEqual(4);
    const Thired_01_Manager_SearchListCount_After_TeamConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Thired_01_Manager.email);
    expect(Thired_01_Manager_SearchListCount_After_TeamConfiguration).toEqual(2);
    const Thired_02_Manager_SearchListCount_After_TeamConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Thired_02_Manager.email);
    expect(Thired_02_Manager_SearchListCount_After_TeamConfiguration).toEqual(4);
    const Fourth_01_Manager_SearchListCount_After_TeamConfiguration = await searchListAPIUtils.getSearchListBySales(allLeadsPageListId,Fourth_01_Manager.email);
    expect(Fourth_01_Manager_SearchListCount_After_TeamConfiguration).toEqual(2);

});
 