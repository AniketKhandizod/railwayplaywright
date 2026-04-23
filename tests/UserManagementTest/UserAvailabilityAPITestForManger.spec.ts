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

  // User emails
  const adminEmail = properties.Admin_email;
  const managerEmail = properties.SalesManager_email;
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

    // Get user IDs
    adminUserId = await crmAPIUtils.getUserId(properties.Admin_email);
    managerUserId = await crmAPIUtils.getUserId(properties.SalesManager_email);
    salesUserId = await crmAPIUtils.getUserId(properties.Sales_email);
    presalesUserId = await crmAPIUtils.getUserId(properties.PreSales_email);
  });


  test('1. Manager should be able to update availability of team members (Sales)', async () => {
    // Get current availability of sales user
    const availabilityResponse = await userAPIUtils.getUserAvailability(managerToken, managerEmail, salesUserId);
    const userManagementAPIUtils = new UserManagementAPIUtils(properties.Client_id, properties.FullAccess_API);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserId, true);

    // Update availability - set Friday to true
    const dayAvailability: DayAvailability = {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: true,
      friday: false,
      saturday: false,
      sunday: false,
    };

    const updatedResponse = await userAPIUtils.updateUserAvailability(
      managerToken,
      managerEmail,
      salesUserId,
      managerFallbackId,
      availabilityResponse,
      dayAvailability
    );

    expect(updatedResponse).toBeDefined();
    expect(updatedResponse.call_availabilities).toBeDefined();
    
    // Verify Friday availability was updated
    const mondayAvailability = updatedResponse.call_availabilities.find(
      (avail: any) => avail.day === 'monday'
    );
    const tuesdayAvailability = updatedResponse.call_availabilities.find(
      (avail: any) => avail.day === 'tuesday'
    );
    const wednesdayAvailability = updatedResponse.call_availabilities.find(
      (avail: any) => avail.day === 'wednesday'
    );
    const thursdayAvailability = updatedResponse.call_availabilities.find(
      (avail: any) => avail.day === 'thursday'
    );
    const fridayAvailability = updatedResponse.call_availabilities.find(
      (avail: any) => avail.day === 'friday'
    );
    const saturdayAvailability = updatedResponse.call_availabilities.find(
      (avail: any) => avail.day === 'saturday'
    );
    const sundayAvailability = updatedResponse.call_availabilities.find(
      (avail: any) => avail.day === 'sunday'
    );
    expect(mondayAvailability.available).toBe(dayAvailability.monday);
    expect(tuesdayAvailability.available).toBe(dayAvailability.tuesday);
    expect(wednesdayAvailability.available).toBe(dayAvailability.wednesday);
    expect(thursdayAvailability.available).toBe(dayAvailability.thursday);
    expect(fridayAvailability.available).toBe(dayAvailability.friday);
    expect(saturdayAvailability.available).toBe(dayAvailability.saturday);
    expect(sundayAvailability.available).toBe(dayAvailability.sunday);

    if (mondayAvailability.available === false) {
      expect(mondayAvailability.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (tuesdayAvailability.available === false) {
      expect(tuesdayAvailability.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (wednesdayAvailability.available === false) {
      expect(wednesdayAvailability.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (thursdayAvailability.available === false) {
      expect(thursdayAvailability.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (fridayAvailability.available === false) {
      expect(fridayAvailability.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (saturdayAvailability.available === false) {
      expect(saturdayAvailability.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (sundayAvailability.available === false) {
      expect(sundayAvailability.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (mondayAvailability.available === true) {
      expect(mondayAvailability.fallback_user_ids).toEqual([]);
    }
    if (tuesdayAvailability.available === true) {
      expect(tuesdayAvailability.fallback_user_ids).toEqual([]);
    }
    if (wednesdayAvailability.available === true) {
      expect(wednesdayAvailability.fallback_user_ids).toEqual([]);
    }
    if (thursdayAvailability.available === true) {
      expect(thursdayAvailability.fallback_user_ids).toEqual([]);
    }
    if (fridayAvailability.available === true) {
      expect(fridayAvailability.fallback_user_ids).toEqual([]);
    }
    if (saturdayAvailability.available === true) {
      expect(saturdayAvailability.fallback_user_ids).toEqual([]);
    }
    if (sundayAvailability.available === true) {
      expect(sundayAvailability.fallback_user_ids).toEqual([]);
    }

    // test user availablity api
    const availabilityResponseAfterUpdate = await userAPIUtils.getUserAvailability(managerToken, managerEmail, salesUserId);
    expect(availabilityResponseAfterUpdate).toBeDefined();
    expect(availabilityResponseAfterUpdate.call_availabilities).toBeDefined();

    const mondayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'monday'
    );
    expect(mondayAvailabilityAfterUpdate.available).toBe(dayAvailability.monday);
    if (mondayAvailabilityAfterUpdate.available === false) {
      expect(mondayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (mondayAvailabilityAfterUpdate.available === true) {
      expect(mondayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }

    const tuesdayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'tuesday'
    );
    expect(tuesdayAvailabilityAfterUpdate.available).toBe(dayAvailability.tuesday);
    if (tuesdayAvailabilityAfterUpdate.available === false) {
      expect(tuesdayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (tuesdayAvailabilityAfterUpdate.available === true) {
      expect(tuesdayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }

    const wednesdayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'wednesday'
    );
    expect(wednesdayAvailabilityAfterUpdate.available).toBe(dayAvailability.wednesday);
    if (wednesdayAvailabilityAfterUpdate.available === false) {
      expect(wednesdayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (wednesdayAvailabilityAfterUpdate.available === true) {
      expect(wednesdayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }

    const thursdayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'thursday'
    );
    expect(thursdayAvailabilityAfterUpdate.available).toBe(dayAvailability.thursday);
    if (thursdayAvailabilityAfterUpdate.available === false) {
      expect(thursdayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (thursdayAvailabilityAfterUpdate.available === true) {
      expect(thursdayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }

    const fridayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'friday'
    );
    expect(fridayAvailabilityAfterUpdate.available).toBe(dayAvailability.friday);
    if (fridayAvailabilityAfterUpdate.available === false) {
      expect(fridayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (fridayAvailabilityAfterUpdate.available === true) {
      expect(fridayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }

    const saturdayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'saturday'
    );
    expect(saturdayAvailabilityAfterUpdate.available).toBe(dayAvailability.saturday);
    if (saturdayAvailabilityAfterUpdate.available === false) {
      expect(saturdayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (saturdayAvailabilityAfterUpdate.available === true) {
      expect(saturdayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }

    const sundayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'sunday'
    );
    expect(sundayAvailabilityAfterUpdate.available).toBe(dayAvailability.sunday);
    if (sundayAvailabilityAfterUpdate.available === false) {
      expect(sundayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (sundayAvailabilityAfterUpdate.available === true) {
      expect(sundayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (mondayAvailabilityAfterUpdate.available === false) {
      expect(mondayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (mondayAvailabilityAfterUpdate.available === true) {
      expect(mondayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (tuesdayAvailabilityAfterUpdate.available === false) {
      expect(tuesdayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (tuesdayAvailabilityAfterUpdate.available === true) {
      expect(tuesdayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (wednesdayAvailabilityAfterUpdate.available === false) {
      expect(wednesdayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (wednesdayAvailabilityAfterUpdate.available === true) {
      expect(wednesdayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (thursdayAvailabilityAfterUpdate.available === false) {
      expect(thursdayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (thursdayAvailabilityAfterUpdate.available === true) {
      expect(thursdayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (fridayAvailabilityAfterUpdate.available === false) {
      expect(fridayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }

    // test user call availabilities api
    const callAvailabilitiesResponseAfterUpdate = await userAPIUtils.getUserCallAvailabilities(managerToken, managerEmail, salesUserId);
    expect(callAvailabilitiesResponseAfterUpdate).toBeDefined();
    expect(callAvailabilitiesResponseAfterUpdate.call_availabilities).toBeDefined();

    const mondayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'monday'
    );
    const tuesdayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'tuesday'
    );
    const wednesdayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'wednesday'
    );
    const thursdayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'thursday'
    );
    const fridayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'friday'
    );
    const saturdayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'saturday'
    );
    const sundayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'sunday'
    );

    expect(mondayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.monday);
    expect(tuesdayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.tuesday);
    expect(wednesdayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.wednesday);
    expect(thursdayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.thursday);
    expect(fridayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.friday);
    expect(saturdayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.saturday);
    expect(sundayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.sunday);
    if (mondayCallAvailabilityAfterUpdate.available === false) {
      expect(mondayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (mondayCallAvailabilityAfterUpdate.available === true) {
      expect(mondayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (tuesdayCallAvailabilityAfterUpdate.available === false) {
      expect(tuesdayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (tuesdayCallAvailabilityAfterUpdate.available === true) {
      expect(tuesdayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (wednesdayCallAvailabilityAfterUpdate.available === false) {
      expect(wednesdayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (wednesdayCallAvailabilityAfterUpdate.available === true) {
      expect(wednesdayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (thursdayCallAvailabilityAfterUpdate.available === false) {
      expect(thursdayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (thursdayCallAvailabilityAfterUpdate.available === true) {
      expect(thursdayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (fridayCallAvailabilityAfterUpdate.available === false) {
      expect(fridayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (fridayCallAvailabilityAfterUpdate.available === true) {
      expect(fridayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (saturdayCallAvailabilityAfterUpdate.available === false) {
      expect(saturdayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (saturdayCallAvailabilityAfterUpdate.available === true) {
      expect(saturdayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (sundayCallAvailabilityAfterUpdate.available === false) {
      expect(sundayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (sundayCallAvailabilityAfterUpdate.available === true) {
      expect(sundayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
  });

  test('2. Manager should able to manager own availablty if Enable User Availability Control feature flag is enabled', async () => {

    const userAPIUtilsForManager = new UserAPIUtils(properties.Client_id, properties.FullAccess_API);
    await userAPIUtilsForManager.updateUserAvailabilityControl(adminToken, adminEmail, false);
    const availabilityResponse = await userAPIUtilsForManager.getUserAvailability(managerToken, managerEmail, managerUserId);

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
        managerToken,
        managerEmail,
        managerUserId,
        managerUserId,
        availabilityResponse,
        dayAvailability
      );
  });

});


