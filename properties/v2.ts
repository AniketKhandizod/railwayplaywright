import os from "os";
const isWindows = os.platform() === "win32";
export const properties = {
  // File Paths
  filePath: "/SampleFiles/selldo.gif",
  SampleFilePath: "/SampleFiles/selldo.jpg",
  printLogsToConsole: true,
  /** When false, `Utils.safeDeleteFile` / `safeDeleteFiles` skip deletion (e.g. keep generated import files for debugging). */
  delete_files: false,

  // Credentials
  PASSWORD: "amura@123",
  Admin_email: "aniket.khandizod+xvb2i0c0eqv2dim@sell.do",

  SalesManager_email: "aniket.khandizod+salesm@sell.do",
  PreSales_email: "aniket.khandizod+presales1@sell.do",
  PreSales_email2: "aniket.khandizod+prs2@sell.do",
  PreSalesManager_email: "aniket.khandizod+presalesmanager@sell.do",
  EditUserMail: "aniket.khandizod+editusertest@sell.do",

  // Support Manager
  SM_00: "aniket.khandizod+wf6@sell.do", // Razor
  SM_01:"aniket.khandizod+wf1@sell.do",  // mini mind
  SM_02:"aniket.khandizod+wf2@sell.do",  // Dummy Routing
  SM_03:"aniket.khandizod+wf3@sell.do",  // stark industries
  SM_04:"aniket.khandizod+wf4@sell.do",  // joh bnega don
  SM_05:"aniket.khandizod+wf5@sell.do",  // Aniket automation
  SM_06:"aniket.khandizod+wf7@sell.do",  // ES melody
  SM_07:"hakim.rangwala@sell.do",  // SV Client Razor
  SM_08:"dhananjay.poul+sm@sell.do",  // Lead Management

  // Workflow Clients >> Mini mind
  WF_Client_Id_01:"68513cb6b0834594f62b78a8",
  WF_Client_FullAccess_API_01:"d0fc300bcae6848c05175ca23494b453",
  WF_Client_RestrictedAccess_API_01:"822f276d1932d24e0fcf4a216fbee715",

  // Workflow Clients >> Dummy Routing
  WF_Client_Id_02:"66190316b083456fa025e179",
  WF_Client_FullAccess_API_02:"b77f20946fac1333fb329ea8a66ffd71",
  WF_Client_RestrictedAccess_API_02:"8ee555fc5fdca97bc779889b3b20601f",
  WF_Clinet_Sales_Email_02:"aniket.khandizod+mjqmzjnrr2@sell.do",
  WF_Clinet_Sales_Id_02:"66190316b083456fa025e17b",

  // Workflow Clients >> stark industries
  WF_Client_Id_03:"67f37281b08345b8470ec8c7",
  WF_Client_FullAccess_API_03:"f61337152097dc4121603df1b0dfe864",
  WF_Client_RestrictedAccess_API_03:"2a76511bbf4771bf37297ce461d3c20c",
  WF_Clinet_Sales_Email_03:"dhananjay.poul+starksales@sell.do",
  WF_Clinet_Sales_Id_03:"67f374b2b08345b8470ecb09",

  // Workflow Clients >> joh bnega don
  WF_Client_Id_04:"652e8921b08345b56b81717f",
  WF_Client_FullAccess_API_04:"7fc22644b225e215e99862c32a46ee90",
  WF_Client_RestrictedAccess_API_04:"4eaf0328b6626fbf5d27fbc9afb82635",
  WF_Clinet_Sales_Email_04:"hakim.rangwala+1919@sell.do",
  WF_Clinet_Sales_Id_04:"65c37fceb08345e9fdd7b441",

  // Workflow Clients >> Aniket automation
  WF_Client_Id_05:"642a8145b083453f914ce854",
  WF_Client_FullAccess_API_05:"99c4b48c7732b5183000999d1200d520",
  WF_Client_RestrictedAccess_API_05:"05982fc554c597db3bd1db3a4e6fb9b9",
  WF_Clinet_Sales_Email_05:"aniket.khandizod+uu@sell.do",
  WF_Clinet_Sales_Id_05:"642a8145b083453f914ce856",

  // Workflow Clients >> SellDo Developers Pvt. Ltd.
  WF_Client_Id_06:"587ddb2b5a9db31da9000002",
  WF_Client_FullAccess_API_06:"c13ad8e13264b1c22bc39bb475889c7e",
  WF_Client_RestrictedAccess_API_06:"fa8d6ca0217e676a7b0e06f51c32568c",

  // Workflow Clients >> Danny
  WF_Client_Id_07:"684c0feeb08345c7d6c4e26d",
  WF_Client_FullAccess_API_07:"0efaf1c9ab6d2778539250e704513609",
  WF_Client_RestrictedAccess_API_07:"e4ddcb02fc8e9cff0ad1e46b3f024754",
  WF_Clinet_Sales_Email_07:"aniket.khandizod+mpbbkbxzdyowj0y@sell.do",
  WF_Clinet_Sales_Id_07:"684c0feeb08345c7d6c4e270",
  WF_Clinet_Project_Id_07:"684c15a1b08345c7d6c4e4de",

  // Workflow Clients >> testqe
  WF_Client_Id_08:"64a2be1db0834560eaa19563",
  WF_Client_FullAccess_API_08:"c4d649781e5451ce2903b34b02496e2c",
  WF_Client_RestrictedAccess_API_08:"3a24cf56e28d5ab1bf0ff6f23e0a0347",
  WF_Clinet_Sales_Email_08:"aniket.khandizod+qe@sell.do",
  WF_Clinet_Sales_Id_08:"64a2be1db0834560eaa19565",
  WF_Clinet_Project_Id_08:"64b0dbb8b08345f63030cd4c",

  WF_Client_Doocti_Amura_VN_1:"918035009133",
  WF_Clinet_Sales_Email_06:"aniket.khandizod+1h@sell.do",
  WF_Clinet_Sales_Id_06:"6492ed30b0834577a6cc5e83",
  WF_Clinet_Project_Id_06_01:"6433e055b08345216abfd15d", //Aniket Mega Project PVT LTD
  WF_Clinet_Project_Id_06_02:"660ebabdb08345c7ca478cd9", //Aniket Builders
  WF_Clinet_Project_Id_06_03:"673eb62ab08345fac4f534e5", // Aniket Project
  WF_Clinet_Project_Id_06_04:"642d1168b0834517ccfadf6c", // Aniket K

  // Whatsapp client >> qwerty
  Whatsapp_Client_Id_01:"65686545b08345f2456ff7ed",
  Whatsapp_Client_FullAccess_API_01:"c25dedc7a935b0819c68f418032d95a1",
  Whatsapp_Client_RestrictedAccess_API_01:"a22f2e21b3cf1ca4ff0ae0a000b95491",
  Whatsapp_Client_Sales_Email_01:"hakim.rangwala+sales2@sell.do",
  Whatsapp_Client_Sales_Id_01:"65686545b08345f2456ff7ef",

  // Inventory import Clinet >> Amura dev
  Inventory_Import_Client_Id_01:"587ddb2b5a9db31da9000002",
  Inventory_Import_Client_FullAccess_API_01:"c13ad8e13264b1c22bc39bb475889c7e",
  Inventory_Import_Client_RestrictedAccess_API_01:"fa8d6ca0217e676a7b0e06f51c32568c",
  Inventory_Import_Client_Sales_Email_01:"aniket.khandizod+1h@sell.do",
  Inventory_Import_Client_Sales_Id_01:"6492ed30b0834577a6cc5e83",

  // ES Test client >> ES Melody
  ES_Test_Client_Id_01:"689b762fb083459a092ed0e3",
  ES_Test_Client_FullAccess_API_01:"9472609ffac610fe069b52ed3efbca32",
  ES_Test_Client_RestrictedAccess_API_01:"cda1dc14be1763e25a794d6fb74d7a4c",
  ES_Test_Client_Sales_Email_01:"aniket.khandizod+nucg6h8ufuirryg@sell.do",
  ES_Test_Client_Sales_Id_01:"689b762fb083459a092ed0e6",
  ES_Test_Client_Sales_Email_02:"aniket.khandizod+essales@sell.do",
  ES_Test_Client_Sales_Id_02:"689c26d5b08345a7cd3df65e",
  ES_Test_Client_Admin_Email_01:"aniket.khandizod+pympmmsnhqnzvr0@sell.do",

  // Postsales client >> Demo Booking With Postsales
  PC_Client_ID: "657c10e6b0834528110c9ebb",
  PC_Client_ID_FullAccess_API:"56e38a7b328bf0fc9ecbf650d7f0b069",
  PC_Client_Admin_user: "prerana.hotkar+dbwp@sell.do",
  PC_Client_Sales_user: "prerana.hotkar+sudbwp@sell.do",
  PC_Client_Postsale_user:"prerana.hotkar+psudbwp@sell.do",

  // Project Tower
  PT_ProjectName: "smoke",
  PT_TotalFloors: "15",
  PT_StageName: "Stage Fifth Slab",

  // Floor Plan
  FP_DeveloperName: "Demo Booking with Postsales",
  FP_ProjectName: "Smoke release 4.20",
  FP_TowerName: "A Tower",
  FP_UnitConfiguration: "FLP 1.5 BHK",
  FP_UnitType: "Residential",
  FP_UnitCategory: "Premium",
  FP_Bedroom: "1",
  FP_Bathroom: "1",
  FP_Carpet: "520",
  FP_Saleable: "650",
  FP_Loading: "5",
  FP_TerraceArea: "50",
  FP_CoveredArea:"500",
  FP_BaseRate: "2000",

  // Unit
  UN_DeveloperName: "Demo Booking with Postsales",
  UN_ProjectName: "Smoke release 4.20",
  UN_TowerName: "A Tower",
  UN_UnitConfiguration: "FLP 1.5 BHK",
  UN_FloorNumber: "2",
  UN_AgreementValue: "350000",
  UN_AllInclusivePrice: "5525000",
  UN_MonthlyRent: "25000",
  UN_MaintenanceAmount: "3000",
  UN_SecurityAmount: "60000",


  // Channel partner >> ES Melody
  CP_Restricted_API:"cda1dc14be1763e25a794d6fb74d7a4c",
  CP_FullAccess_API:"9472609ffac610fe069b52ed3efbca32",
  CP_Client_Id:"689b762fb083459a092ed0e3",

  // Project
  Project_Name: "Canary",
  Project_id: "67dacfedb08345829f477ffa",
  Project_Name_Rooted: "project 01", // Rooted Project Name
  Project_id_Rooted: "69036896b08345742ff614af", // Rooted Project ID
  
  // Non-Rooted Projects
  NonRootedProjectName01: "Project001",
  NonRootedProjectID01: "69083bf3b0834549b8466401",
  NonRootedProjectName02: "Project002",
  NonRootedProjectID02: "69083c0eb0834549b8466403",
  NonRootedProjectName03: "Project003",
  NonRootedProjectID03: "69083c13b0834549b8466405",
  NonRootedProjectName04: "Project004",
  NonRootedProjectID04: "69083c19b0834549b8466407",
  NonRootedProjectName05: "Project005",
  NonRootedProjectID05: "69083c1eb0834549b8466409",
  
  Project_Name_2: "Raven",
  Project_id_2: "67da9552b08345cb065f867b",
  projectToKeepActive: ["Canary","Raven"],

  // Developer Info
  Developer_id: "67da7d93b0834512cba20d01",

  // Client Info
  Client_id: "67da7d8fb0834512cba20c6f",
  FullAccess_API: "8be2740236faee3e3563fdbdecbe4e3b",
  RestrictedAccess_API: "dcd66e8d2381f3a7377c102d24b50862",

  // Non-Rooted Client Info
  Non_Rooted_Client_id: "69035d6eb08345742ff6121e",
  Non_Rooted_FullAccess_API: "2d6897d870d2e1a63c284f951073081f",
  Non_Rooted_RestrictedAccess_API: "dbaf399a55a694138835f1959f01edcd",

  // Sales Info
  Sales_id: "67da7d8fb0834512cba20c72",
  Sales_email: "aniket.khandizod+sal1@sell.do",
  Sales_name: "Salesuser2main",
  salesPhone: "8247470390",

  // Sales Manager Info
  Sales_id_Manager: "67da82dfb0834512cba210e3",

  // Sales Info for Search List
  Sales_id_SearchList: "682775cdb08345ddb2b9724b",
  Sales_Name_SearchList: "SearchListTestUser",
  Sales_Email_SearchList: "aniket.khandizod+exp1@sell.do",

  // Sales for score calculation
  Sales_id_userScore:"68879087b08345696065e003",
  Sales_Name_userScore:"Score Calculation User",
  Sales_Email_userScore:"aniket.khandizod+qwq@sell.do",

  // PreSales Info
  PreSales_id: "67da834cb0834512cba210ee",
  PreSales_name: "Presalesuser1",
  PreSales_id2: "680dd424b083456a41f0929c",
  PreSales_name2: "Presalesuser2",
  PreSales_id_Manager: "67da837ab0834512cba210f4",

   // Rooted client virtual numbers for Doocti 
   New_Routing_Client_Doocti_VN_1:"918995387133",
   New_Routing_Client_Doocti_VN_2:"918035382133",
   New_Routing_Client_Doocti_VN_3:"918035382134",

   // New routing client
   New_Routing_Client_Id:"69035cd2b08345742ff60fd0",
   New_Routing_Client_FullAccess_API:"4683ce342b74a379c89c2b5843c5e9bd",
   New_Routing_Client_RestrictedAccess_API:"282a32a7f4d2c11c25b2c79f14f0d3b7",
   New_Routing_Client_RestrictedAccess_API_Organic:"d38433bffc689aabb24bad95950b52e6",

  // Team Info
  Team_Name: "Sales",
  Team_ID: "67da7edcb0834512cba20e9c",
  Team_Name2: "Presales",
  teamHierarchyID: "67da828ab083455ffa715b98",

  // Campaign Info
  Campeign: "Lavkush",
  Campeign_id: "680dd8f6b08345af63cec979",
  Source: "99acres",
  SubSource: "qwertyuiop",
  OrganicCampeignID: "67da7d9ab0834510573b3f6d",

  // Campaign Name for Import SRD
  CampaignNameForImportSRD: "Lavkush",
  CampaignIdForImportSRD: "680dd8f6b08345af63cec979",

  // SRD
  srd1: "680dd5f8b083456a41f0a708", // Vasuki
  srd1_name: "Vasuki",
  srd2: "680dd64db083456a41f0aa5a", // Gowardhan
  srd2_name: "Gowardhan",

  // Calling
  DooctiVN: "918035380009",
  Standard_Integration_VN: "918035380010",
  SID:"647112805817450",

  // channel partner
  Channel_partner_id: "680e28e9b08345838f766287",

  // Import/Export
  ImportCount: 1,
  ImportLocation: "./store",
  /**
   * Project unit CSV upload (`Client::ProjectUnitsController#check_validity`) — must match the client’s
   * `ClientConfiguration#feature_enabled?(:seller)` / `:brokerage`. If wrong, upload fails with a generic header error.
   */
  SVPickupLocation_1: "Balewadi",
  SVPickupLocation_2: "Hinjewadi",
  DownloadLocation: "Downloads",
  extension: ".xls",

  // SMS Template ID
  SMS_Template_Name: "AdminCreatedSMS",
  SMS_Template_ID: "67dd11a2b08345638a9ed35d",
  SMS_Template_Content: "DESC",
  SMS_Template_Type: "Transactional",

  // WhatsApp
  GrowAasan: "680e2994b08345838f766291",
  ADZ: "680e29b1b08345838f766296",

  // Email Template
  Email_Template_ID: "67da7d92b0834512cba20cd7",
  Email_Template_Name: "Walkthrough sync code",
  Email_Template_Subject: "Virtual Walkthrough link for",

  // Reassign
  UserToAssignLeadEmail: "aniket.khandizod+tkrbygyvlh@sell.do",
  UserToAssignLeadID: "6773c86ab083453144d3ddbe",

  // Search List
  FromPresales: "642a8623b083454f959c19b7",
  PendingSiteVisits: "67738c9cb08345b051e66011",
  PendingFollowUps: "67738c9cb08345b051e6600f",
  AllLeadsPage: "67da7d8fb0834512cba20c7a",

  // API Testing
  api_project: "67da9552b08345cb065f867b",
  api_searchlist_from_presales: "67da81c9b0834512cba210da",
  api_teamId: "680e2a65b08345838f76629d",
  api_sales_dump: "680e2a89b08345838f76629e",
  api_sales_project: "67da7d8fb0834512cba20c72",

  // Search List Counts
  NEW_ENQUIRIES: "67da7d8fb0834512cba20c7e",
  UNREAD_EMAILS: "67da7d91b0834512cba20c94",
  UNREAD_WHATSAPP: "67dd07b8b08345182e295e5a",
  MISSED_CALLS: "67da7d90b0834512cba20c84",
  NO_FUTURE_ACTIVITY: "67da7d91b0834512cba20ca3",
  RE_ENGAGED_LEADS: "67da7d91b0834512cba20ca0",
  MISSED_FOLLOWUPS: "67da7d90b0834512cba20c8e",
  MISSED_SITE_VISITS: "67da7d90b0834512cba20c90",
  REASSINGTOME: "67da7d91b0834512cba20c9a",

  // Misc
  Email: "aniket.khandizod@sell.do",
  Export_Gmail: "gtxtrex12323@gmail.com",
  Email_Template: "",
  Postsales_schemes_template_ID: "6773d4b1b08345ad9eeec05c",
  delayTime: 1,
  WorkflowName: "Sitevisit Dropped",
  SystemOwner: "aniket",

  // Email Campeign
  CampeignEmail:"altimate",
  Domain:"@crmdev.amuratech.in",

  // Email conversation users
  Convemail_id_sales: "688f4003b08345adfb5972ab",
  Convemail_Name_sales: "Convemail ",
  Convemail_email_sales: "aniket.khandizod+con1@sell.do",
  Convemail_phone_sales: "09900909221",

  // Call conversation users
  Convecall_id_pre_sales: "688f405db08345adfb5972af",
  Convecall_Name_pre_sales: "Convecall ",
  Convecall_email_pre_sales: "aniket.khandizod+con2@sell.do",
  Convecall_phone_pre_sales: "09900909222",

  // SMS conversation users
  Convsms_id_sales: "688f4088b08345adfb5972b2",
  Convsms_Name_sales: "Convsms ",
  Convsms_email_sales: "aniket.khandizod+con3@sell.do",
  Convsms_phone_sales: "09900909223",

  // Site visit conversation users
  Convesitevisit_id_pre_sales: "688f415fb08345adfb5972be",
  Convesitevisit_Name_pre_sales: "Convesitevisit ",
  Convesitevisit_email_pre_sales: "aniket.khandizod+con4@sell.do",
  Convesitevisit_phone_pre_sales: "09900909224",

  // Followup conversation users
  Convefollowup_id_sales: "688f418bb08345adfb5972c1",
  Convefollowup_Name_sales: "Convefollowup ",
  Convefollowup_email_sales: "aniket.khandizod+con5@sell.do",
  Convefollowup_phone_sales: "09900909225",

  // WhatsApp conversation users
  Convwhatspp_id_sales: "688f41c7b08345adfb5972c5",
  Convwhatspp_Name_sales: "Convwhatspp ",
  Convwhatspp_email_sales: "aniket.khandizod+con6@sell.do",
  Convwhatspp_phone_sales: "09900909226",

  // Bulk C2C conversation users
  Convebulkc2c_id_manager: "688f4327b08345adfb5972d1",
  Convebulkc2c_Name_manager: "Convebulkc2c ",
  Convebulkc2c_email_manager: "aniket.khandizod+con7@sell.do",
  Convebulkc2c_phone_manager: "09900909227",

  // Project level duplicate client creation
  Project_Duplicate_Admin_Email: "aniket.khandizod+adg6hld1gkoq9vg@sell.do",
  Project_Duplicate_Sales_Email: "aniket.khandizod+n7asxq2358mhgfx@sell.do",
  Project_Duplicate_Sales_Name: "Sales User",
  Project_Duplicate_Sales_Id: "68511b6cb083450cbe19272b",
  Project_Duplicate_Sales_Team: "Sales Team",

  // Project level duplicate lead creation
  Project_Duplicate_Project_1_Name: "PROZONE",
  Project_Duplicate_Project_1_Id: "685a3fc4b0834554fc41d7c4",
  Project_Duplicate_Project_2_Name: "NEOZONE",
  Project_Duplicate_Project_2_Id: "685a3fe5b0834554fc41d7c8",
  Project_Duplicate_FullAccess_API: "08368ee2bf9e23b5562e4050d801d4a8",
  Project_Duplicate_RestrictedAccess_API: "a5944456cedc1c4cd876fa92fbeeac48",
  Project_Duplicate_Client_Id: "68511b5ab083450cbe19266d",

  // Project level duplicate lead campaign information
  Project_Duplicate_SRD_1: "689201b3b083451eb11ba2c9",
  Project_Duplicate_SRD_1_Name: "Prozone",
  Project_Duplicate_SRD_2: "68920215b083451eb11ba2d1",
  Project_Duplicate_SRD_3: "6892056cb083451eb11ba355",
  Project_Duplicate_SRD_2_Name: "Neon",

  //Dhananjay credentials
  followupUser_email :"dhananjay.poul+razrofollowupuser@sell.do",

  //export
  ExportUser:'dhananjay.poul@sell.do',
  starkclientAdminEmail: 'dhananjay.poul+ironmanclient@sell.do',

  // Presale team1 user
  presaleTeam1User: 'dhananjay.poul+saleteamtony1@sell.do',
  presaleTeam1Password: 'amura@123',
  starkclientmanagerEmail: 'dhananjay.poul+dfghjk@sell.do',
  starkclientmanagerPassword: 'amura@123',
  Dashboard_Sale_id: "687e22c0b08345a08ded6baf",
  Dashboard_Sale_email: "dhananjay.poul+automation@sell.do",
  Dashboard_Sale_name: "Dhananjay Sales User",
  Dhananjay_salePhone: "9878949585",
  leadManagementTestUserEmail: 'dhananjay.poul+starksales@sell.do',

  // Site visit test cases
  SV_Sales_email: "hakim.rangwala+presr@sell.do", //Hakim Presales
  SV_Sales_id: "68b6ad00b083453edc89ea0a", //Hakim Presales
  SV_Team_id: "67da828ab083455ffa715b98", //Presales
  SV_Invitee_team: "Secondary Sales",
  SV_Client_id: "67da7d8fb0834512cba20c6f", //Razor
  APIforVirtualWalkthrough: "123",

  // Property Portal API Keys
  Housing_Pusher_API_Key: "a06df14ad6c442be86e07178c239cfb6",
  Roof_And_Floor_API_Key: "fb9a64ec1412fe32b78c5d40ece545cd",
  MagicBricks_API_Key: "4548f730097a8b4746283ec8c244d79e",
  Commonfloor_Pusher_API_Key: "5357e0551c4f69180dbcc43089a2dca6",
  NinetyNineAcres_API_Key: "1ce1b97d5c121de5dfbc38fb986ae254",
  Facebook_API_Key: "3e8552a33089c7e88574245bb82a5207",
};
