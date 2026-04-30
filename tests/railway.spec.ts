import { test, expect } from '@playwright/test';
import { properties } from '../Environment/v2';
import { getCrmApiBaseURL } from '../utils/APIUtils/crmApiContext';
import { LeadAPIUtils } from '../utils/APIUtils/LeadAPIUtils';
import { Utils } from '../utils/PlaywrightTestUtils';

test('Testrail', async () => {
  test.skip(
    !getCrmApiBaseURL(),
    'Set CRM_API_BASE_URL on Railway (or BASE_URL to your Sell.Do origin — not railway.com). Example: https://your-org.amuratech.in',
  );

  test.skip(
    !(
      properties.Client_id?.trim() &&
      properties.FullAccess_API?.trim() &&
      properties.RestrictedAccess_API?.trim()
    ),
    'Set CLIENT_ID, FULL_ACCESS_API, RESTRICTED_ACCESS_API (or SELLD_* equivalents per Environment/v2).',
  );

  const clientId = properties.Client_id ?? '';
  const fullAccess = properties.FullAccess_API ?? '';
  const restricted = properties.RestrictedAccess_API ?? '';

  const utils = new Utils();
  const phone = utils.generateRandomPhoneNumber();
  const email = utils.generateRandomEmail();

  const leadApi = new LeadAPIUtils(clientId, fullAccess, restricted);
  const lead = await leadApi.createLeadWithDetails(
    phone,
    email,
    'Railway smoke lead',
    undefined,
    undefined,
    properties.Project_id ?? undefined,
    properties.Sales_id ?? undefined,
    properties.srd1 ?? undefined,
  );

  expect(lead).toBeDefined();
  expect(lead.sell_do_lead_id ?? lead.id).toBeTruthy();
});
