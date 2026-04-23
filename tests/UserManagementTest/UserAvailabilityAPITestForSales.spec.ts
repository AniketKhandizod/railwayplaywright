import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2";
import { UserAPIUtils, DayAvailability } from "../../utils/APIUtils/UserAPIUtils";
import { CRMAPIUtils } from "../../utils/APIUtils/CRMAPIUtils";
import { UserManagementAPIUtils } from '../../utils/APIUtils/UserManagementAPIUtils';

test.describe.configure({ mode: "serial" });

test.describe('User Availability API Tests', () => {
  let userAPIUtils: UserAPIUtils;
  let crmAPIUtils: CRMAPIUtils;
  let adminToken: string;
  let managerToken: string;
  let salesToken: string;
  let presalesToken: string;

  // User emails
  const adminEmail = properties.Admin_email;
  const managerEmail = properties.SalesManager_email;
  const salesEmail = properties.Sales_email;
  const presalesEmail = properties.PreSales_email;
  const managerFallbackId = properties.Sales_id_userScore;

  // Get user IDs
  let adminUserId: string;
  let managerUserId: string;
  let salesUserId: string;
  let presalesUserId: string;

  test.beforeAll(async () => {
    userAPIUtils = new UserAPIUtils(properties.Client_id, properties.FullAccess_API);
    crmAPIUtils = new CRMAPIUtils(properties.Client_id, properties.FullAccess_API);

    // Get tokens for all users
    adminToken = await crmAPIUtils.getUserToken(properties.Admin_email, properties.PASSWORD);
    managerToken = await crmAPIUtils.getUserToken(properties.SalesManager_email, properties.PASSWORD);
    salesToken = await crmAPIUtils.getUserToken(properties.Sales_email, properties.PASSWORD);
    presalesToken = await crmAPIUtils.getUserToken(properties.PreSales_email, properties.PASSWORD);

    // Get user IDs
    adminUserId = await crmAPIUtils.getUserId(properties.Admin_email);
    managerUserId = await crmAPIUtils.getUserId(properties.SalesManager_email);
    salesUserId = await crmAPIUtils.getUserId(properties.Sales_email);
    presalesUserId = await crmAPIUtils.getUserId(properties.PreSales_email);
  });

  test('1. Sales should able to sales own availablty if Enable User Availability Control feature flag is enabled', async () => {

    const userAPIUtilsForSales = new UserAPIUtils(properties.Client_id, properties.FullAccess_API);
    await userAPIUtilsForSales.updateUserAvailabilityControl(adminToken, adminEmail, true);
    const availabilityResponse = await userAPIUtilsForSales.getUserAvailability(salesToken, salesEmail, salesUserId);

       // Update availability - set Friday to true
       const dayAvailability: DayAvailability = {
        monday: true,
        tuesday: true,
        wednesday: false,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      };
  
      const updatedResponse = await userAPIUtils.updateUserAvailability(
        salesToken,
        salesEmail,
        salesUserId,
        salesUserId,
        availabilityResponse,
        dayAvailability
      );

      expect(updatedResponse).toBeDefined();

      expect(updatedResponse.call_availabilities).toBeDefined();

      expect(updatedResponse.call_availabilities.find(
        (avail: any) => avail.day === 'monday'
      ).available).toBe(dayAvailability.monday);

      expect(updatedResponse.call_availabilities.find(
        (avail: any) => avail.day === 'tuesday'
      ).available).toBe(dayAvailability.tuesday);

      expect(updatedResponse.call_availabilities.find(
        (avail: any) => avail.day === 'wednesday'
      ).available).toBe(dayAvailability.wednesday);

      expect(updatedResponse.call_availabilities.find(
        (avail: any) => avail.day === 'thursday'
      ).available).toBe(dayAvailability.thursday);

      expect(updatedResponse.call_availabilities.find(
        (avail: any) => avail.day === 'friday'
      ).available).toBe(dayAvailability.friday);

      expect(updatedResponse.call_availabilities.find(
        (avail: any) => avail.day === 'saturday'
      ).available).toBe(dayAvailability.saturday);

      expect(updatedResponse.call_availabilities.find(
        (avail: any) => avail.day === 'sunday'
      ).available).toBe(dayAvailability.sunday);

  });
});
