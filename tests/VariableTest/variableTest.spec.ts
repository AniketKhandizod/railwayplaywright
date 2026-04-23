import { test, expect } from "@playwright/test";
import { properties } from "../../properties/v2.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import {
  LeadAPIUtils,
} from "../../utils/APIUtils/LeadAPIUtils.ts";
import { CRMAPIUtils, UserRoleFilter, WhatsappTemplateVariable } from "../../utils/APIUtils/CRMAPIUtils.ts";


test("Variable Test", async ({}) => {
  const crmAPIUtils = new CRMAPIUtils(properties.Client_id, properties.FullAccess_API);
  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
  // get source 
  
  // create lead with detials 
  const phone = `+91 ${await utils.generateRandomPhoneNumber()}`;
  const email = await utils.generateRandomEmail();
  const name = `${await utils.generateRandomString(10, { casing: "upper",includeSpecialChars: false,includeNumbers: false })} ${await utils.generateRandomString(10, { casing: "upper",includeSpecialChars: false,includeNumbers: false })}`;
  const source01 = (await crmAPIUtils.dataProvider_Source({ index: 1 }));
  const subSource01 = (await crmAPIUtils.dataProvider_SubSource({ index: 1 }));
  const project01 = (await crmAPIUtils.getFirstActiveProjectSummary({ index: 1 }));
  const sales01 = (await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales, { index: 1 }));
  const campaign01 = (await crmAPIUtils.getFirstActiveCampaignSummary({ index: 1 }));

  const lead = await leadAPIUtils.createLeadWithDetails(
      phone,
      email,
      name,
      source01.id,
      subSource01.id,
      project01.id,
      sales01.id,
      "",
      true,
      campaign01.id,
      { "custom_dd": "1",
        "custom_dd_2": "2",
        "custom_dd_3": "3",
      }
    );
    
    // get lead CRM id to data base id
    const leadDBID = await leadAPIUtils.getLeadId(String(lead.sell_do_lead_id));
    const preview = (await crmAPIUtils.previewWhatsappTemplate(String(leadDBID)));


    await utils.print(`Project name: ${preview.get(WhatsappTemplateVariable.project_name)} lead values: ${project01.name}`);
    await utils.print(`Last lead project name: ${preview.get(WhatsappTemplateVariable.last_lead_project_name)} lead values: ${project01.name}`);
    await utils.print(`First lead project name: ${preview.get(WhatsappTemplateVariable.first_lead_project_name)} lead values: ${project01.name}`);
    await utils.print(`Name: ${preview.get(WhatsappTemplateVariable.name)} lead values: ${name}`);
    await utils.print(`Lead first name: ${preview.get(WhatsappTemplateVariable.lead_first_name)} lead values: ${name.split(" ")[0]}`);
    await utils.print(`Lead last name: ${preview.get(WhatsappTemplateVariable.lead_last_name)} lead values: ${name.split(" ")[1]}`);
    await utils.print(`Lead_id: ${preview.get(WhatsappTemplateVariable.lead_id)} lead values: ${leadDBID}`);
    await utils.print(`Lead id: ${preview.get(WhatsappTemplateVariable.leadid)} lead values: ${leadDBID}`);
    await utils.print(`Lead email: ${preview.get(WhatsappTemplateVariable.lead_email)} lead values: ${email}`);
    await utils.print(`Lead phone number: ${preview.get(WhatsappTemplateVariable.lead_phone_number)} lead values: ${phone}`);
    await utils.print(`Sales email: ${preview.get(WhatsappTemplateVariable.sales_email)} lead values: ${sales01.email}`);
    await utils.print(`Latest campaign: ${preview.get(WhatsappTemplateVariable.latest_campaign)} lead values: ${campaign01.name}`);
    await utils.print(`Latest source: ${preview.get(WhatsappTemplateVariable.latest_source)} lead values: ${source01.text}`);
    await utils.print(`Latest sub source: ${preview.get(WhatsappTemplateVariable.latest_sub_source)} lead values: ${subSource01.text}`);
    await utils.print(`Lead phone dialcode: ${preview.get(WhatsappTemplateVariable.lead_phone_dialcode)} lead values: ${phone.split(" ")[0]}`);
    await utils.print(`Lead created at date only: ${preview.get(WhatsappTemplateVariable.lead_created_at_date_only)} lead values: ${lead.created_at}`);

    expect(preview.get(WhatsappTemplateVariable.project_name)).toBe(project01.name);
    expect(preview.get(WhatsappTemplateVariable.last_lead_project_name)).toBe(project01.name);
    expect(preview.get(WhatsappTemplateVariable.first_lead_project_name)).toBe(project01.name);
    expect(preview.get(WhatsappTemplateVariable.name)).toBe(name);
    expect(preview.get(WhatsappTemplateVariable.lead_first_name)).toBe(name.split(" ")[0]);
    expect(preview.get(WhatsappTemplateVariable.lead_last_name)).toBe(name.split(" ")[1]);
    expect(preview.get(WhatsappTemplateVariable.lead_id)).toBe(String(lead.sell_do_lead_id));
    expect(preview.get(WhatsappTemplateVariable.leadid)).toBe(leadDBID);
    expect(preview.get(WhatsappTemplateVariable.lead_email)).toBe(email);
    expect(preview.get(WhatsappTemplateVariable.lead_phone_number)).toBe(phone.split(" ")[1]);
    expect(preview.get(WhatsappTemplateVariable.sales_email)).toBe(sales01.email);
    expect(preview.get(WhatsappTemplateVariable.latest_campaign)).toBe(campaign01.name);
    expect(preview.get(WhatsappTemplateVariable.latest_source)).toBe(source01.id);
    expect(preview.get(WhatsappTemplateVariable.latest_sub_source)).toBe(subSource01.id);
    expect("+"+preview.get(WhatsappTemplateVariable.lead_phone_dialcode)).toBe(phone.split(" ")[0]);

});