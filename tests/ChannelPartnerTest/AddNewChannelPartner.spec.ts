import { test, expect } from "@playwright/test";
import { AheadOf, Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { SettingPage } from "../../pages/AdminAndSupportPages/SettingsPages/SettingPage.ts";
import { NotyMessage } from "../../pages/AdminAndSupportPages/NotyMessage.ts";
import { properties } from "../../properties/v2.ts";
import { CPSettingPage } from "../../pages/AdminAndSupportPages/ChannelPartnerPages/CPSettingPage.ts";
import { CPListingPage } from "../../pages/AdminAndSupportPages/ChannelPartnerPages/CPListingPage.ts";
import { CPBasicDetailsPage } from "../../pages/AdminAndSupportPages/ChannelPartnerPages/AddChannelPartnerForms/CPBasicDetailsPage.ts";
import { CPContactDetailsPage } from "../../pages/AdminAndSupportPages/ChannelPartnerPages/AddChannelPartnerForms/CPContactDetails.ts";
import { CPSpecializationDetailsPage, ChannelPartnerType , PropertyType} from "../../pages/AdminAndSupportPages/ChannelPartnerPages/AddChannelPartnerForms/CPSpecializationDetailsPage.ts";
import { ChannelPartnerAPIUtils } from "../../utils/APIUtils/ChannelPartnerAPIUtils.ts";
import { LeadAPIUtils } from "../../utils/APIUtils/LeadAPIUtils.ts";
import { SidePanal } from "../../pages/AdminAndSupportPages/SidePanal.ts";
import { NewLeadForm } from "../../pages/UserPages/Forms/NewLeadForm.ts";
import { LeadProfilePage } from "../../pages/UserPages/leadProfilePage.ts";
import { ChannelPartnerFormOnNewLeadPage } from "../../pages/UserPages/Forms/ChannelPartnerFormOnNewLeadPage.ts";
import { ChannelPartnerCSVGenerator } from "../../utils/CSVGenerator/ChannelPartnerCSVGenerator.ts";
import { CRMAPIUtils, UserRoleFilter } from "../../utils/APIUtils/CRMAPIUtils.ts";
import { CSVUtils } from "../../utils/CSVGenerator/CSVUtils.ts";

const clientId = properties.CP_Client_Id;
const fullAccessAPI = properties.CP_FullAccess_API;
const restrictedAccessAPI = properties.CP_Restricted_API;

test('Add new channel partner', async ({page}) => {

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const notyMessage = new NotyMessage(page);
    const cpSettingPage = new CPSettingPage(page);
    const cpListingPage = new CPListingPage(page);
    const cpBasicDetailsPage = new CPBasicDetailsPage(page);
    const cpContactDetailsPage = new CPContactDetailsPage(page);
    const cpSpecializationDetailsPage = new CPSpecializationDetailsPage(page);
    const channelPartnerAPIUtils = new ChannelPartnerAPIUtils(clientId, fullAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    
    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);
    const projectSummary = await crmAPIUtils.getFirstActiveProjectSummary({index: 1});

    // CP info 
    const cpName = await utils.generateRandomString(10,{casing: 'lower',includeNumbers: false,includeSpecialChars: false});
    const cpSource = await utils.generateRandomString(10,{casing: 'lower',includeNumbers: false,includeSpecialChars: false});
    const cpSalutation = "Mr.";
    const cpFirstName = await utils.generateRandomString(10,{casing: 'lower',includeNumbers: false,includeSpecialChars: false});
    const cpLastName = await utils.generateRandomString(10,{casing: 'lower',includeNumbers: false,includeSpecialChars: false});
    const cpPhoneNumber = await utils.generateRandomPhoneNumber();
    const cpEmail = await utils.generateRandomEmail();
    const cpAlternatePhoneNumber = await utils.generateRandomPhoneNumber();
    const cpAlternateEmail = await utils.generateRandomEmail();
    const cpDesignation = await utils.generateRandomString(10,{casing: 'lower',includeNumbers: false,includeSpecialChars: false});
    const cpLocation = await utils.generateRandomString(10,{casing: 'lower',includeNumbers: false,includeSpecialChars: false});
    const cpProject = projectSummary.name;
    const cpAddress = await utils.generateRandomString(10,{casing: 'lower',includeNumbers: false,includeSpecialChars: false});
    const cpStreet = await utils.generateRandomString(10,{casing: 'lower',includeNumbers: false,includeSpecialChars: false});
    const cpCity = await utils.generateRandomString(10,{casing: 'lower',includeNumbers: false,includeSpecialChars: false});
    const cpZip = await utils.generateRandomString(10,{casing: 'lower',includeNumbers: false,includeSpecialChars: false});

    // specialization details
    const cpCode = await utils.generateRandomString(10,{casing: 'lower',includeNumbers: false,includeSpecialChars: false});
    const cpReraNumber = await utils.generateRandomString(10,{casing: 'lower',includeNumbers: false,includeSpecialChars: false});
    const cpReraName = await utils.generateRandomString(10,{casing: 'lower',includeNumbers: false,includeSpecialChars: false});
    const cpMinBudget = await utils.generateRandomNumber(1);
    const cpMaxBudget = await utils.generateRandomNumber(2);
    const cpIndividual = true;
    const cpFulltime = true;
    const cpLocationSpecific = true;
    const pastDates = -1;
    const futureDate = 1;

    await loginPage.login(adminUserSummary.email, properties.PASSWORD);

    await settingPage.clickOnPartnerSettings();

    await cpSettingPage.clickOnManagePartner();

    await cpListingPage.clickOnNewPartnerButton();

    // Basic form
    await cpBasicDetailsPage.clickOnBasicForm();
    await cpBasicDetailsPage.enterNameOfCP(cpName);
    await cpBasicDetailsPage.enterDateOfJoining(pastDates);
    await cpBasicDetailsPage.enterSourceOfRecruitment(cpSource);
    await cpBasicDetailsPage.enterCpBirthday(pastDates);
    await cpBasicDetailsPage.enterCpAnniversary(pastDates);

    // contact details
    await cpContactDetailsPage.clickOnContactDetails();
    await cpContactDetailsPage.selectSalutationOfPartner(cpSalutation);
    await cpContactDetailsPage.enterFirstNameOfPartner(cpFirstName);
    await cpContactDetailsPage.enterLastNameOfPartner(cpLastName);
    await cpContactDetailsPage.enterPhoneNumberOfPartner("+91", cpPhoneNumber);
    await cpContactDetailsPage.enterEmailOfPartner(cpEmail);
    await cpContactDetailsPage.enterAlternatePhoneOfPartner(cpAlternatePhoneNumber);
    await cpContactDetailsPage.enterAlternateEmailOfPartner(cpAlternateEmail);
    await cpContactDetailsPage.enterDesignationOfPartner(cpDesignation);
    await cpContactDetailsPage.enterPanOfPartner("EXZPK6673Q");
    await cpContactDetailsPage.enterLocationOfWorkOfPartner(cpLocation);
    await cpContactDetailsPage.enterProjectOfPartner(cpProject);
    await cpContactDetailsPage.enterAddressOfPartner(cpAddress);
    await cpContactDetailsPage.enterStreetOfPartner(cpStreet);
    await cpContactDetailsPage.enterCountryOfPartner("India");
    await cpContactDetailsPage.enterStateOfPartner("Maharashtra");
    await cpContactDetailsPage.enterCityOfPartner(cpCity);
    await cpContactDetailsPage.enterZipOfPartner(cpZip);

    // specialization details
    await cpSpecializationDetailsPage.clickOnSpecializationDetails();
    await cpSpecializationDetailsPage.selectCpType(ChannelPartnerType.Local);
    await cpSpecializationDetailsPage.enterCpCode(cpCode);
    await cpSpecializationDetailsPage.enterCpReraNumber(cpReraNumber);
    await cpSpecializationDetailsPage.enterCpReraName(cpReraName);
    await cpSpecializationDetailsPage.enterReraValidity(1);
    await cpSpecializationDetailsPage.selectPropertyType(PropertyType.Studio);
    await cpSpecializationDetailsPage.enterMaxBudget(cpMaxBudget);
    await cpSpecializationDetailsPage.enterMinBudget(cpMinBudget);
    await cpSpecializationDetailsPage.isIndividual(cpIndividual);
    await cpSpecializationDetailsPage.isFulltime(cpFulltime);
    await cpSpecializationDetailsPage.isLocationSpecific(cpLocationSpecific);
    await cpSpecializationDetailsPage.savePartner();

    const successMessage = await notyMessage.getNotyMessage(true);
    expect(successMessage).toContain("Partner created successfully");

    // Filter
    await cpListingPage.clickOnFunnelButton();
    await cpListingPage.enterSearchPartnerByName(cpName);
    await cpListingPage.clickOnApplyFilterButton();

    // Assertions
    const cpNameInListing = await cpListingPage.getChannelPartnerName();
    expect(cpNameInListing).toContain(cpName);

    const cpPartnerNameInListing = await cpListingPage.getPartnerName();
    expect(cpPartnerNameInListing).toContain(cpFirstName +" "+ cpLastName);

    const cpContactInListing = await cpListingPage.getPartnerContanct();
    expect(cpContactInListing).toContain(cpPhoneNumber);

    const cpEmailInListing = await cpListingPage.getPartnerEmail();
    expect(cpEmailInListing).toContain(cpEmail);

    const cpCreatedAtInListing = await cpListingPage.getPartnerCreatedAt();
    expect(cpCreatedAtInListing).toContain(await utils.calculateFutureDate(AheadOf.Day, 0, "dd-MMM-yyyy"));

    // Edit
    const url = decodeURIComponent(await cpListingPage.clickOnEditChannelPartner()).match(/\/client\/channel_partners\/([^\/]+)/)?.[1] || null;
   
    const channelPartnerDetails = await channelPartnerAPIUtils.getChannelPartnerDetailsById(url);

    // API validations
    expect(channelPartnerDetails).toBeTruthy();
    expect(channelPartnerDetails.client_id).toBe(clientId);
    expect(channelPartnerDetails.name).toBe(cpName);
    expect(channelPartnerDetails.source_of_recruitment).toBe(cpSource);
    expect(channelPartnerDetails.channel_partner_code).toBe(cpCode);
    expect(channelPartnerDetails.channel_partner_type.toLowerCase()).toBe(ChannelPartnerType.Local.toLowerCase());
    expect(channelPartnerDetails.is_individual).toBe(cpIndividual);
    expect(channelPartnerDetails.is_fulltime).toBe(cpFulltime);
    expect(channelPartnerDetails.is_location_specific).toBe(cpLocationSpecific);
    expect(channelPartnerDetails.location).toBe(cpLocation);

    // budgets
    expect(channelPartnerDetails.min_budget).toBe(Number(cpMinBudget));
    expect(channelPartnerDetails.max_budget).toBe(Number(cpMaxBudget));

    // dates
    const expectedJoinDate = await utils.calculateFutureDate(AheadOf.Day, pastDates, "yyyy-MM-dd");
    expect(channelPartnerDetails.date_of_joining).toBe(expectedJoinDate);
    const expectedBirthday = await utils.calculateFutureDate(AheadOf.Day, pastDates, "yyyy-MM-dd");
    expect(channelPartnerDetails.birthday).toBe(expectedBirthday);
    const expectedReraValidity = await utils.calculateFutureDate(AheadOf.Day, futureDate, "yyyy-MM-dd");
    expect(channelPartnerDetails.rera_validity).toBe(expectedReraValidity);

    // rera and property type
    expect(channelPartnerDetails.rera_name).toBe(cpReraName);
    expect(channelPartnerDetails.rera_number).toBe(cpReraNumber);
    expect(Array.isArray(channelPartnerDetails.property_type)).toBeTruthy();
    expect(channelPartnerDetails.property_type.map((v: string) => v.toLowerCase())).toContain(PropertyType.Studio.toLowerCase());

    // ids
    expect(typeof channelPartnerDetails._id).toBe("string");
    expect(channelPartnerDetails._id.length).toBe(24);

    // contact validations
    const contact = channelPartnerDetails.contact;
    expect(contact.first_name).toBe(cpFirstName);
    expect(contact.last_name).toBe(cpLastName);
    expect(contact.email).toBe(cpEmail);
    expect(contact.designation).toBe(cpDesignation);
    expect(contact.pan).toBe("EXZPK6673Q");
    expect(contact.alternate_email).toBe(cpAlternateEmail);
    expect(contact.phone.ph_number).toBe(cpPhoneNumber);
    expect(contact.phone.country_code.toLowerCase()).toBe("in");
    expect(contact.alternate_phone.ph_number).toBe(cpAlternatePhoneNumber);
    expect(contact.salutation).toBe(cpSalutation.toLowerCase().replace(".", ""));
    expect(typeof contact._id).toBe("string");
    expect(contact._id.length).toBe(24);

});

test('Add new lead with exisitng channel partner', async ({page}) => {

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const notyMessage = new NotyMessage(page);
    const sidePanal = new SidePanal(page);
    const newLeadForm = new NewLeadForm(page);
    const leadPage = new LeadProfilePage(page);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const channelPartnerAPIUtils = new ChannelPartnerAPIUtils(clientId, fullAccessAPI);

    const leadFirstName = await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const leadLastName = await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const leadEmail = await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false})+"@sell.do";
    const leadPhone = await utils.generateRandomPhoneNumber();
    const leadCampaign = "Organic";

    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);
    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales);
    const cpId = await channelPartnerAPIUtils.getActiveChannelPartnerIdByListingIndex({index: 1});
    const cpDetails = await channelPartnerAPIUtils.getChannelPartnerDetailsById(cpId);

    
    const cpBrokerName = cpDetails.contact.first_name +" "+ cpDetails.contact.last_name;
    const cpName = cpDetails.name;
    const cpPhoneNumber = cpDetails.contact.phone.ph_number;
    const cpEmail = cpDetails.contact.email;

    await loginPage.login(salesUserSummary.email, properties.PASSWORD);
    await sidePanal.clickOnCreateLead();
    await newLeadForm.enterFirstName(leadFirstName);
    await newLeadForm.enterLastName(leadLastName);
    await newLeadForm.enterPrimaryEmail(leadEmail);
    await newLeadForm.enterPrimaryPhone("+91",leadPhone);
    await newLeadForm.selectLeadCampaign(leadCampaign);
    await newLeadForm.selectChannelPartner(cpName);
    await newLeadForm.clickOnSaveLeadButton();

    const notyMessageText = await notyMessage.getNotyMessage(true);
    expect(notyMessageText).toContain("Lead created successfully");

    const channelPartnerOnLeadProfile = await leadPage.getChannelPartnerOnLeadProfile();
    expect(channelPartnerOnLeadProfile).toBe(`${cpName}(${cpBrokerName})`);

    const url = page.url();
    const id = url.match(/\/client\/[^/]+\/[^/]+\/([^/]+)/)?.[1] || "";
    const leadDetails = await leadAPIUtils.getLeadDetails(id);

    expect(leadDetails.channel_partner.cp_name).toBe(cpName);
    expect(leadDetails.channel_partner.broker_name).toBe(cpBrokerName);
    expect(leadDetails.channel_partner.phone_number).toContain(cpPhoneNumber);
    expect(leadDetails.channel_partner.email).toBe(cpEmail);
});

test('Add new lead with channel partner', async ({page}) => {

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const notyMessage = new NotyMessage(page);
    const sidePanal = new SidePanal(page);
    const newLeadForm = new NewLeadForm(page);
    const leadPage = new LeadProfilePage(page);
    const channelPartnerFormOnNewLeadPage = new ChannelPartnerFormOnNewLeadPage(page);
    const cpListingPage = new CPListingPage(page);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);

    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);
    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales);
    const projectSummary = await crmAPIUtils.getFirstActiveProjectSummary({index: 1});

    const leadFirstName = await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const leadLastName = await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const leadEmail = await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false})+"@sell.do";
    const leadPhone = await utils.generateRandomPhoneNumber();
    const leadCampaign = "Organic";

    // CP data
    const pastDates = -1;
    const futureDate = 1;
    const cpSalutation = "Mr.";
    const cpFirstName = await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const cpLastName = await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const cpReraNumber = await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const cpProject = projectSummary.name;
    const cpAlternatePhoneNumber = await utils.generateRandomPhoneNumber();
    const cpAlternateEmail = await utils.generateRandomEmail();
    const cpDesignation = await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false});

    const cpName = await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const cpBrokerName = await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const cpPhoneNumber = await utils.generateRandomPhoneNumber();
    const cpEmail = await utils.generateRandomEmail();

    await loginPage.login(salesUserSummary.email, properties.PASSWORD);
    await sidePanal.clickOnCreateLead();
    await newLeadForm.enterFirstName(leadFirstName);
    await newLeadForm.enterLastName(leadLastName);
    await newLeadForm.enterPrimaryEmail(leadEmail);
    await newLeadForm.enterPrimaryPhone("+91",leadPhone);
    await newLeadForm.selectLeadCampaign(leadCampaign);
    await newLeadForm.clickOnAddChannelPartner();

    await channelPartnerFormOnNewLeadPage.channelPartnerNameOnLeadProfilePage(cpName);
    await channelPartnerFormOnNewLeadPage.channelPartnerBirthdayOnLeadProfilePage(pastDates);
    await channelPartnerFormOnNewLeadPage.channelPartnerAnniversaryOnLeadProfilePage(pastDates);
    await channelPartnerFormOnNewLeadPage.channelPartnerReranumberOnLeadProfilePage(cpReraNumber);
    await channelPartnerFormOnNewLeadPage.channelPartnerReravalidityOnLeadProfilePage(futureDate);
    await channelPartnerFormOnNewLeadPage.channelPartnerSalutationOnLeadProfilePage(cpSalutation);
    await channelPartnerFormOnNewLeadPage.channelPartnerFirstNameOnLeadProfilePage(cpFirstName);
    await channelPartnerFormOnNewLeadPage.channelPartnerLastNameOnLeadProfilePage(cpLastName);
    await channelPartnerFormOnNewLeadPage.channelPartnerPrimaryPhoneOnLeadProfilePage(cpPhoneNumber);
    await channelPartnerFormOnNewLeadPage.channelPartnerAlternatePhoneOnLeadProfilePage(cpAlternatePhoneNumber);
    await channelPartnerFormOnNewLeadPage.channelPartnerEmailOnLeadProfilePage(cpEmail);
    await channelPartnerFormOnNewLeadPage.channelPartnerAlternateEmailOnLeadProfilePage(cpAlternateEmail);
    await channelPartnerFormOnNewLeadPage.channelPartnerDesignationOnLeadProfilePage(cpDesignation);
    await channelPartnerFormOnNewLeadPage.channelPartnerPANOnLeadProfilePage("EXZPK6673Q");
    await channelPartnerFormOnNewLeadPage.channelPartnerProjectOnLeadProfilePage(cpProject);
    await channelPartnerFormOnNewLeadPage.channelPartnerSaveOnLeadProfilePage();

    const notyMessageTextChannelPartner = await notyMessage.getNotyMessage(true);
    expect(notyMessageTextChannelPartner).toContain("Channel Partner is added successfully, please choose from channel partner dropdown");

    await newLeadForm.selectChannelPartner(cpName);

    await newLeadForm.clickOnSaveLeadButton();

    const notyMessageTextLead = await notyMessage.getNotyMessage(false);
    expect(notyMessageTextLead).toContain("Lead created successfully");

    const channelPartnerOnLeadProfile = await leadPage.getChannelPartnerOnLeadProfile();
    expect(channelPartnerOnLeadProfile).toBe(`${cpName}(${cpFirstName} ${cpLastName})`);

    const url = page.url();
    const id = url.match(/\/client\/[^/]+\/[^/]+\/([^/]+)/)?.[1] || "";
    const leadDetails = await leadAPIUtils.getLeadDetails(id);
    
    expect(leadDetails.channel_partner.cp_name).toBe(cpName);
    expect(leadDetails.channel_partner.broker_name).toBe(cpFirstName +" "+ cpLastName);
    expect(leadDetails.channel_partner.phone_number).toContain(cpPhoneNumber);
    expect(leadDetails.channel_partner.email).toBe(cpEmail);
    
    await page.goto(`/client/channel_partners?utf8=✓&commit=Apply&search=${cpName}&filters%5Bactive%5D=true`);

    // Assertions
    const cpNameInListing = await cpListingPage.getChannelPartnerName();
    expect(cpNameInListing).toContain(cpName);

    const cpPartnerNameInListing = await cpListingPage.getPartnerName();
    expect(cpPartnerNameInListing).toContain(cpFirstName +" "+ cpLastName);

    const cpContactInListing = await cpListingPage.getPartnerContanct();
    expect(cpContactInListing).toContain(cpPhoneNumber);

    const cpEmailInListing = await cpListingPage.getPartnerEmail();
    expect(cpEmailInListing).toContain(cpEmail);

});

test.only('Add new channel partner from CSV', async ({page}) => {
    const utils = new Utils();
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const csvGenerator = new ChannelPartnerCSVGenerator(clientId, fullAccessAPI);
    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);
    const projectSummary = await crmAPIUtils.getFirstActiveProjectSummary();

    const csvFilePath = await csvGenerator.FileGeneratorForChannelPartner(properties.ImportCount, projectSummary.id);

    const importResult = await crmAPIUtils.importChannelPartnersCsv(csvFilePath);
    expect(importResult).toBe(`Channel Partners Import started in background. You'll get email soon on ${adminUserSummary.email}`);

    // Read CSV
    const csvUtils = new CSVUtils(csvFilePath);
    const csvData = csvUtils.readAll();
    expect(Number(csvData.length)-1).toBe(Number(properties.ImportCount));

    await utils.safeDeleteFiles([csvFilePath]);

});