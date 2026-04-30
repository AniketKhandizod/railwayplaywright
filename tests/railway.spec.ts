import { test, expect } from '@playwright/test';
import { properties } from '../Environment/v2';
import { LeadAPIUtils } from '../utils/APIUtils/LeadAPIUtils';
import { Utils } from '../utils/PlaywrightTestUtils';

test('Testrail', async () => {
  test.skip(
    !(
      properties.Client_id?.trim() &&
      properties.FullAccess_API?.trim() &&
      properties.RestrictedAccess_API?.trim()
    ),
    'Set CLIENT_ID, FULL_ACCESS_API, RESTRICTED_ACCESS_API and BASE_URL (CRM API host, not railway.com) to run this test.',
  );

  const clientId = properties.Client_id ?? '';
  const fullAccess = properties.FullAccess_API ?? '';
  const restricted = properties.RestrictedAccess_API ?? '';

  const utils = new Utils();
  const phone = utils.generateRandomPhoneNumber();
  const email = utils.generateRandomEmail();

  const leadApi = new LeadAPIUtils(clientId, fullAccess, restricted);
  const lead = await leadApi.createLeadWithDetails(phone, email, 'Railway smoke lead');

  console.log('Lead created: ', JSON.stringify(lead, null, 2));

  expect(lead).toBeDefined();
  expect(lead.sell_do_lead_id ?? lead.id).toBeTruthy();
});
