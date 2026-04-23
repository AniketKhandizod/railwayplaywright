import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { AheadOf, Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { SettingPage } from '../../pages/AdminAndSupportPages/SettingsPages/SettingPage.ts';
import { LeadAPIUtils } from '../../utils/APIUtils/LeadAPIUtils.ts';
import { FeaturesPage } from '../../pages/AdminAndSupportPages/FeaturesPage.ts';
import { NotyMessage } from '../../pages/AdminAndSupportPages/NotyMessage.ts';
import { SidePanal } from "../../pages/AdminAndSupportPages/SidePanal.ts";
import { GlobalSearchPage } from '../../pages/AdminAndSupportPages/GlobalSearchPage.ts';
import { addNoteForm } from '../../pages/UserPages/Forms/NoteForm.ts';
import { triggerCallForm } from '../../pages/UserPages/Forms/CallForm.ts';
import { LeadProfilePage } from '../../pages/UserPages/leadProfilePage.ts';
import { sendEmailForm } from '../../pages/UserPages/Forms/EmailForm.ts';
import { sendSMSForm } from '../../pages/UserPages/Forms/SMSForm.ts';
import { sendWhatsAppForm } from '../../pages/UserPages/Forms/WhatsAppForm.ts';
import { addFollowUpForm } from '../../pages/UserPages/Forms/FollowupForm.ts';
import { addOfflineCallForm } from '../../pages/UserPages/Forms/OfflineCallForm.ts';
import { DatePicker } from '../../pages/UserPages/DatePicker.ts';
import { CallDirection, CalligAPIUtils, CallStatus } from '../../utils/APIUtils/CallingAPIUtils.ts';
import { CRMAPIUtils } from '../../utils/APIUtils/CRMAPIUtils.ts';
import { CallConversationPage, ConversationCallDirection } from '../../pages/UserPages/ConversationPages/CallConversationPage.ts';
import { ConversationEmailDirection, EmailConversationPage } from '../../pages/UserPages/ConversationPages/EmailConversationPage.ts';

test.describe.configure({ mode: "parallel"});
test('Validate email conversation', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const sidePanal = new SidePanal(page);
    const calligAPIUtils = new CalligAPIUtils(properties.Client_id, properties.FullAccess_API);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const utils = new Utils();
    const emailConversationPage = new EmailConversationPage(page);
    const leadsName ="Email conversation test "+ await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
   

    await loginPage.login(properties.Convemail_email_sales, properties.PASSWORD);
    await sidePanal.clickOnEmailConversation();

    let leadForEmail = await leadAPIUtils.createLeadWithDetails("", await utils.generateRandomEmail(),leadsName,"","","",properties.Convemail_id_sales,"");
    await leadAPIUtils.sendEmailToLead(leadForEmail.sell_do_lead_id, properties.Convemail_email_sales);

    await emailConversationPage.selectDirection(ConversationEmailDirection.Outbox);
    expect(await emailConversationPage.getLeadIdList()).toContain(leadForEmail.sell_do_lead_id);
    expect(await emailConversationPage.getLeadNameList()).toContain(leadsName);
    expect(await emailConversationPage.getEmailSubjectList()).toContain("test");
    expect(await emailConversationPage.getEmailActivityOwnerList()).toContain(properties.Convemail_Name_sales);
    expect(await emailConversationPage.getEmailActivityDateList()).toContain(await utils.calculateFutureDate(AheadOf.Day,0,"MMM d, yyyy"));

});
