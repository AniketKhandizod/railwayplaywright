import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { ActivityType, LeadAPIUtils } from '../../utils/APIUtils/LeadAPIUtils.ts';
import { GlobalSearchPage } from '../../pages/AdminAndSupportPages/GlobalSearchPage.ts';
import { LeadProfilePage } from '../../pages/UserPages/leadProfilePage.ts';
import { sendEmailForm } from '../../pages/UserPages/Forms/EmailForm.ts';
import { NotyMessage } from '../../pages/AdminAndSupportPages/NotyMessage.ts';
import { sendBusinessWhatsappForm } from '../../pages/UserPages/Forms/BuisnessWhatsappForm.ts';

test.describe.configure({ mode: "parallel"});
test.fixme('Validate send whatsapp message to lead', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const leadAPIUtils = new LeadAPIUtils(properties.Whatsapp_Client_Id_01, properties.Whatsapp_Client_FullAccess_API_01, properties.Whatsapp_Client_RestrictedAccess_API_01);
    const globalSearchPage = new GlobalSearchPage(page);
    const utils = new Utils();
    const leadPage = new LeadProfilePage(page);
    const emailForm = new sendEmailForm(page);
    const notyMessage = new NotyMessage(page);
    const businessWhatsappForm = new sendBusinessWhatsappForm(page);

    const emailTo = await utils.generateRandomEmail();

    await loginPage.login(properties.Whatsapp_Client_Sales_Email_01, properties.PASSWORD);

    const leadsName ="Send whatsapp message to lead test "+ await utils.generateRandomString(4,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const leadPhoneNumber = await utils.replaceFirstDigits(await utils.generateRandomPhoneNumber());
    // Create Leads for Incoming, Outgoing and All Calls
    let LeadId = (await leadAPIUtils.createLeadWithDetails(leadPhoneNumber, emailTo,leadsName,"","","",properties.Whatsapp_Client_Sales_Id_01,"")).sell_do_lead_id;

    await globalSearchPage.globalSearch("7972708841");

    await leadPage.clickOnBusinessWhatsAppActionButton();

    await businessWhatsappForm.clickOnNewConversationButton();
    await businessWhatsappForm.selectPrimaryPhoneForBusinessWhatsApp();
    await businessWhatsappForm.selectAccountForBusinessWhatsApp();
    await businessWhatsappForm.selectTemplateForBusinessWhatsApp();
    const messagePreview = await businessWhatsappForm.getMessagePreviewForBusinessWhatsApp();
    //console.log(messagePreview);
 //   await businessWhatsappForm.clickOnSendMessageButton();

    await utils.sleep(10000);

});