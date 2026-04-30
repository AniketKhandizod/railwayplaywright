import { test, expect } from '@playwright/test';
import { properties } from '../Environment/v2';
import { LeadAPIUtils } from '../utils/APIUtils/LeadAPIUtils';
import { Utils } from '../utils/PlaywrightTestUtils';

test('Testrail', async () => {

  const clientId = properties.Client_id ?? '';
  const fullAccess = properties.FullAccess_API ?? '';
  const restricted = properties.RestrictedAccess_API ?? '';

  const utils = new Utils();
  const phone = utils.generateRandomPhoneNumber();
  const email = utils.generateRandomEmail();

  console.log('Client ID: ', clientId);
  console.log('Full Access: ', fullAccess);
  console.log('Restricted: ', restricted);
  console.log('Phone: ', phone);
  console.log('Email: ', email);

  const leadApi = new LeadAPIUtils(clientId, fullAccess, restricted);
  const lead = await leadApi.createLeadWithDetails(phone, email, 'Railway smoke lead');

  console.log('Lead created: ', JSON.stringify(lead, null, 2));

  expect(lead).toBeDefined();
  expect(lead.sell_do_lead_id ?? lead.id).toBeTruthy();
});

