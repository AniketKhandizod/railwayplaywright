import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { LeadAPIUtils } from '../../utils/APIUtils/LeadAPIUtils.ts';
import { NotyMessage } from '../../pages/AdminAndSupportPages/NotyMessage.ts';
import { SidePanal } from '../../pages/AdminAndSupportPages/SidePanal.ts';
import { NewLeadForm } from '../../pages/UserPages/Forms/NewLeadForm.ts';
import { LeadProfilePage } from '../../pages/UserPages/leadProfilePage.ts';
import { CRMAPIUtils } from '../../utils/APIUtils/CRMAPIUtils.ts';

test('Create lead manually for project level duplicate and check dummy lead creation with same project and email', async ({ browser }) => {
    
    const crmAPIUtils = new CRMAPIUtils(properties.Project_Duplicate_Client_Id, properties.Project_Duplicate_FullAccess_API);  
    const leadStrategy = await crmAPIUtils.getClinetLeadStrategy(properties.Project_Duplicate_Admin_Email);
    expect(leadStrategy).toBe("allow_duplicates_at_project_level");
    const context = await browser.newContext();
    const page = await context.newPage();

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const leadAPIUtils = new LeadAPIUtils(properties.Project_Duplicate_Client_Id, properties.Project_Duplicate_FullAccess_API, properties.Project_Duplicate_RestrictedAccess_API);
    const notyMessage = new NotyMessage(page);
    const sidePanal = new SidePanal(page);
    const newLeadForm = new NewLeadForm(page);
    const leadPage = new LeadProfilePage(page);

    const leadFirstName = await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const leadLastName = await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const leadEmail = await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false})+"@sell.do";
    const leadPhone = await utils.generateRandomPhoneNumber();
    const leadProject = properties.Project_Duplicate_Project_1_Name;
    const leadCampaign = "Organic";

    await loginPage.login(properties.Project_Duplicate_Sales_Email, properties.PASSWORD);
    await sidePanal.clickOnCreateLead();
    await newLeadForm.enterFirstName(leadFirstName);
    await newLeadForm.enterLastName(leadLastName);
    await newLeadForm.enterPrimaryEmail(leadEmail);
    await newLeadForm.enterPrimaryPhone("+91",leadPhone);
    await newLeadForm.enterIntrestedProject(leadProject);
    await newLeadForm.selectLeadCampaign(leadCampaign);
    await newLeadForm.clickOnSaveLeadButton();

    const notyMessageText = await notyMessage.getNotyMessage(true);
    expect(notyMessageText).toContain("Lead created successfully");

    const leadId = await leadPage.getLeadId();

    const leadData = await leadAPIUtils.leadRetrieve(leadPhone);

    // Validate lead data
    expect(leadData.status).toBe(200);
    expect(leadData.lead).toBeDefined();
    
    // Validate basic lead information
    expect(leadData.lead.first_name).toBe(leadFirstName);
    expect(leadData.lead.last_name).toBe(leadLastName);
    expect(leadData.lead.name).toBe(`${leadFirstName} ${leadLastName}`);
    expect(leadData.lead.email).toBe(leadEmail);
    expect(leadData.lead.phone).toBe(leadPhone);
    
    // Validate lead status and stage
    expect(leadData.lead.stage).toBe('prospect');
    expect(leadData.lead.currently_in).toBe('sales');
    expect(leadData.lead.validated_from_ui).toBe(true);
    expect(leadData.lead.touched).toBe(true);
    
    // Validate system created tags
    expect(leadData.lead.system_created_tags).toContain('manual_entry');
    
    // Validate campaign information
    expect(leadData.lead.last_campaign.name).toBe('organic');
    expect(leadData.lead.last_campaign.medium_type).toBe('manual_entry');
    expect(leadData.lead.last_campaign.medium_value).toBe('web_login');
    
    // Validate project information
    expect(leadData.lead.interested_projects).toBeDefined();
    expect(Array.isArray(leadData.lead.interested_projects)).toBe(true);

    // second lead with smae cridentials
    await sidePanal.clickOnCreateLead();
    await newLeadForm.enterFirstName(leadFirstName);
    await newLeadForm.enterLastName(leadLastName);
    await newLeadForm.enterPrimaryEmail(leadEmail);
    await newLeadForm.enterPrimaryPhone("+91",leadPhone);
    await newLeadForm.enterIntrestedProject(leadProject);
    await newLeadForm.selectLeadCampaign(leadCampaign);
    await newLeadForm.clickOnSaveLeadButton();

    const notyMessageText2 = await notyMessage.getNotyMessage(true);
    const match = leadId.match(/\d+/);
    const leadIdNumber = match ? parseInt(match[0], 10) : null;
    expect(notyMessageText2).toContain(`email already associated with lead #${leadIdNumber}phone already associated with lead #${leadIdNumber}Lead already exists with this phone or email.Interested Property is already present on another lead(s): ${leadIdNumber}Primary email is invalidPrimary phone is invalid`);

});

test('Create lead manually for project level duplicate and check dummy lead creation with diffrent project and same email', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const notyMessage = new NotyMessage(page);
    const sidePanal = new SidePanal(page);
    const newLeadForm = new NewLeadForm(page);
    const leadPage = new LeadProfilePage(page);
    const leadAPIUtils = new LeadAPIUtils(properties.Project_Duplicate_Client_Id, properties.Project_Duplicate_FullAccess_API, properties.Project_Duplicate_RestrictedAccess_API);

    const leadFirstName = await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const leadLastName = await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const leadEmail = await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false})+"@sell.do";
    const leadPhone = await utils.generateRandomPhoneNumber();
    const leadProject = properties.Project_Duplicate_Project_1_Name;
    const leadCampaign = "Organic";

    await loginPage.login(properties.Project_Duplicate_Sales_Email, properties.PASSWORD);
    await sidePanal.clickOnCreateLead();
    await newLeadForm.enterFirstName(leadFirstName);
    await newLeadForm.enterLastName(leadLastName);
    await newLeadForm.enterPrimaryEmail(leadEmail);
    await newLeadForm.enterPrimaryPhone("+91",leadPhone);
    await newLeadForm.enterIntrestedProject(leadProject);
    await newLeadForm.selectLeadCampaign(leadCampaign);
    await newLeadForm.clickOnSaveLeadButton();

    const notyMessageText = await notyMessage.getNotyMessage(true);
    expect(notyMessageText).toContain("Lead created successfully");

    const leadId = await leadPage.getLeadId();

    // second lead with smae cridentials
    await sidePanal.clickOnCreateLead();
    await newLeadForm.enterFirstName(leadFirstName);
    await newLeadForm.enterLastName(leadLastName);
    await newLeadForm.enterPrimaryEmail(leadEmail);
    await newLeadForm.enterPrimaryPhone("+91",leadPhone);
    await newLeadForm.enterIntrestedProject(properties.Project_Duplicate_Project_2_Name);
    await newLeadForm.selectLeadCampaign(leadCampaign);
    await newLeadForm.clickOnSaveLeadButton();

    const notyMessageText2 = await notyMessage.getNotyMessage(true);
    expect(notyMessageText2).toContain("Lead created successfully");
    const leadId2 = await leadPage.getLeadId();
    expect(leadId2).not.toBe(leadId);

    const leadDetailsForDummyLead = await leadAPIUtils.leadRetrieveForDummyLead(leadEmail, true);
    expect(leadDetailsForDummyLead.leads.length).toBe(2);
});