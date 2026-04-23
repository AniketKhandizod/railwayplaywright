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

  test('1. Admin should be able to update availability of Manager', async () => {
    // Get current availability
    const availabilityResponse = await userAPIUtils.getUserAvailability(adminToken, adminEmail, managerUserId);
    const userManagementAPIUtils = new UserManagementAPIUtils(properties.Client_id, properties.FullAccess_API);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(managerUserId, true);
    
    // Update availability - set Monday to true
    const dayAvailability: DayAvailability = {
      monday: false,
      tuesday: true,
      wednesday: false,
      thursday: false,
      friday: true,
      saturday: false,
      sunday: true,
    };

    const updatedResponse = await userAPIUtils.updateUserAvailability(
      adminToken,
      adminEmail,
      managerUserId,
      managerFallbackId,
      availabilityResponse,
      dayAvailability
    );

    expect(updatedResponse).toBeDefined();
    expect(updatedResponse.call_availabilities).toBeDefined();
    
    // Verify Monday availability was updated
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

    // Verify fallback user is present when availability is false (user is on leave)
    // Days with availability = false should have fallback user
    expect(mondayAvailability.available).toBe(false);
    if (Array.isArray(mondayAvailability.fallback_user_ids)) {
      expect(mondayAvailability.fallback_user_ids).toContain(managerFallbackId);
    } else {
      expect(String(mondayAvailability.fallback_user_ids)).toContain(managerFallbackId);
    }
    
    expect(wednesdayAvailability.available).toBe(false);
    if (Array.isArray(wednesdayAvailability.fallback_user_ids)) {
      expect(wednesdayAvailability.fallback_user_ids).toContain(managerFallbackId);
    } else {
      expect(String(wednesdayAvailability.fallback_user_ids)).toContain(managerFallbackId);
    }
    
    expect(thursdayAvailability.available).toBe(false);
    if (Array.isArray(thursdayAvailability.fallback_user_ids)) {
      expect(thursdayAvailability.fallback_user_ids).toContain(managerFallbackId);
    } else {
      expect(String(thursdayAvailability.fallback_user_ids)).toContain(managerFallbackId);
    }
    
    expect(saturdayAvailability.available).toBe(false);
    if (Array.isArray(saturdayAvailability.fallback_user_ids)) {
      expect(saturdayAvailability.fallback_user_ids).toContain(managerFallbackId);
    } else {
      expect(String(saturdayAvailability.fallback_user_ids)).toContain(managerFallbackId);
    }
    
    // Days with availability = true should NOT have fallback user (fallback_user_ids should be empty)
    expect(tuesdayAvailability.available).toBe(true);
    if (Array.isArray(tuesdayAvailability.fallback_user_ids)) {
      expect(tuesdayAvailability.fallback_user_ids).toEqual([]);
    } else {
      expect(String(tuesdayAvailability.fallback_user_ids)).toBe("");
    }
    
    expect(fridayAvailability.available).toBe(true);
    if (Array.isArray(fridayAvailability.fallback_user_ids)) {
      expect(fridayAvailability.fallback_user_ids).toEqual([]);
    } else {
      expect(String(fridayAvailability.fallback_user_ids)).toBe("");
    }
    
    expect(sundayAvailability.available).toBe(true);
    if (Array.isArray(sundayAvailability.fallback_user_ids)) {
      expect(sundayAvailability.fallback_user_ids).toEqual([]);
    } else {
      expect(String(sundayAvailability.fallback_user_ids)).toBe("");
    }

    const availabilityResponseAfterUpdate = await userAPIUtils.getUserAvailability(adminToken, adminEmail, managerUserId);

    expect(availabilityResponseAfterUpdate).toBeDefined();
    expect(availabilityResponseAfterUpdate.call_availabilities).toBeDefined();

    const mondayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'monday'
    );

    const tuesdayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'tuesday'
    );

    const wednesdayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'wednesday'
    );

    const thursdayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'thursday'
    );

    const fridayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'friday'
    );

    const saturdayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'saturday'
    );

    const sundayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'sunday'
    );

    expect(mondayAvailabilityAfterUpdate.available).toBe(dayAvailability.monday);
    expect(tuesdayAvailabilityAfterUpdate.available).toBe(dayAvailability.tuesday);
    expect(wednesdayAvailabilityAfterUpdate.available).toBe(dayAvailability.wednesday);
    expect(thursdayAvailabilityAfterUpdate.available).toBe(dayAvailability.thursday);
    expect(fridayAvailabilityAfterUpdate.available).toBe(dayAvailability.friday);
    expect(saturdayAvailabilityAfterUpdate.available).toBe(dayAvailability.saturday);
    expect(sundayAvailabilityAfterUpdate.available).toBe(dayAvailability.sunday);

    if (mondayAvailabilityAfterUpdate.available === false) {
      expect(mondayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (tuesdayAvailabilityAfterUpdate.available === false) {
      expect(tuesdayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (wednesdayAvailabilityAfterUpdate.available === false) {
      expect(wednesdayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (thursdayAvailabilityAfterUpdate.available === false) {
      expect(thursdayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (fridayAvailabilityAfterUpdate.available === false) {
      expect(fridayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (saturdayAvailabilityAfterUpdate.available === false) {
      expect(saturdayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (sundayAvailabilityAfterUpdate.available === false) {
      expect(sundayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }

    if (mondayAvailabilityAfterUpdate.available === true) {
      expect(mondayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (tuesdayAvailabilityAfterUpdate.available === true) {
      expect(tuesdayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (wednesdayAvailabilityAfterUpdate.available === true) {
      expect(wednesdayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (thursdayAvailabilityAfterUpdate.available === true) {
      expect(thursdayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (fridayAvailabilityAfterUpdate.available === true) {
      expect(fridayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (saturdayAvailabilityAfterUpdate.available === true) {
      expect(saturdayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (sundayAvailabilityAfterUpdate.available === true) {
      expect(sundayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }

    const callAvailabilitiesResponseAfterUpdate = await userAPIUtils.getUserCallAvailabilities(adminToken, adminEmail, managerUserId);

    expect(callAvailabilitiesResponseAfterUpdate).toBeDefined();
    expect(callAvailabilitiesResponseAfterUpdate.call_availabilities).toBeDefined();

    const mondayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'monday'
    );
    expect(mondayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.monday);

    const tuesdayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'tuesday'
    );
    expect(tuesdayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.tuesday);

    const wednesdayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'wednesday'
    );
    expect(wednesdayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.wednesday);

    const thursdayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'thursday'
    );
    expect(thursdayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.thursday);

    const fridayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'friday'
    );
    expect(fridayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.friday);

    const saturdayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'saturday'
    );
    expect(saturdayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.saturday);

    const sundayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'sunday'
    );
    expect(sundayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.sunday);

    if (mondayCallAvailabilityAfterUpdate.available === false) {
      expect(mondayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (tuesdayCallAvailabilityAfterUpdate.available === false) {
      expect(tuesdayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (wednesdayCallAvailabilityAfterUpdate.available === false) {
      expect(wednesdayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (thursdayCallAvailabilityAfterUpdate.available === false) {
      expect(thursdayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (fridayCallAvailabilityAfterUpdate.available === false) {
      expect(fridayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (saturdayCallAvailabilityAfterUpdate.available === false) {
      expect(saturdayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (sundayCallAvailabilityAfterUpdate.available === false) {
      expect(sundayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }

    if (mondayCallAvailabilityAfterUpdate.available === true) {
      expect(mondayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (tuesdayCallAvailabilityAfterUpdate.available === true) {
      expect(tuesdayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (wednesdayCallAvailabilityAfterUpdate.available === true) {
      expect(wednesdayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (thursdayCallAvailabilityAfterUpdate.available === true) {
      expect(thursdayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (fridayCallAvailabilityAfterUpdate.available === true) {
      expect(fridayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (saturdayCallAvailabilityAfterUpdate.available === true) {
      expect(saturdayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (sundayCallAvailabilityAfterUpdate.available === true) {
      expect(sundayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
  });

  test('2. Admin should be able to update availability of Sales user', async () => {
    // Get current availability
    const availabilityResponse = await userAPIUtils.getUserAvailability(adminToken, adminEmail, salesUserId);
    const userManagementAPIUtils = new UserManagementAPIUtils(properties.Client_id, properties.FullAccess_API);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserId, true);
    
    // Update availability - set Tuesday and Wednesday to true
    const dayAvailability: DayAvailability = {
      monday: true,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    };

    const updatedResponse = await userAPIUtils.updateUserAvailability(
      adminToken,
      adminEmail,
      salesUserId,
      managerFallbackId,
      availabilityResponse,
      dayAvailability
    );

    expect(updatedResponse).toBeDefined();
    expect(updatedResponse.call_availabilities).toBeDefined();
    
    // Verify Tuesday and Wednesday availability was updated
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

    const availabilityResponseAfterUpdate = await userAPIUtils.getUserAvailability(adminToken, adminEmail, salesUserId);
    expect(availabilityResponseAfterUpdate).toBeDefined();
    expect(availabilityResponseAfterUpdate.call_availabilities).toBeDefined();

    const mondayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'monday'
    );
    const tuesdayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'tuesday'
    );
    const wednesdayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'wednesday'
    );
    const thursdayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'thursday'
    );
    const fridayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'friday'
    );
    const saturdayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'saturday'
    );
    const sundayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'sunday'
    );
    expect(mondayAvailabilityAfterUpdate.available).toBe(dayAvailability.monday);
    expect(tuesdayAvailabilityAfterUpdate.available).toBe(dayAvailability.tuesday);
    expect(wednesdayAvailabilityAfterUpdate.available).toBe(dayAvailability.wednesday);
    expect(thursdayAvailabilityAfterUpdate.available).toBe(dayAvailability.thursday);
    expect(fridayAvailabilityAfterUpdate.available).toBe(dayAvailability.friday);
    expect(saturdayAvailabilityAfterUpdate.available).toBe(dayAvailability.saturday);
    expect(sundayAvailabilityAfterUpdate.available).toBe(dayAvailability.sunday);

    if (mondayAvailabilityAfterUpdate.available === false) {
      expect(mondayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (tuesdayAvailabilityAfterUpdate.available === false) {
      expect(tuesdayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (wednesdayAvailabilityAfterUpdate.available === false) {
      expect(wednesdayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (thursdayAvailabilityAfterUpdate.available === false) {
      expect(thursdayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (fridayAvailabilityAfterUpdate.available === false) {
      expect(fridayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (saturdayAvailabilityAfterUpdate.available === false) {
      expect(saturdayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (sundayAvailabilityAfterUpdate.available === false) {
      expect(sundayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }

    if (mondayAvailabilityAfterUpdate.available === true) {
      expect(mondayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (tuesdayAvailabilityAfterUpdate.available === true) {
      expect(tuesdayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (wednesdayAvailabilityAfterUpdate.available === true) {
      expect(wednesdayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (thursdayAvailabilityAfterUpdate.available === true) {
      expect(thursdayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (fridayAvailabilityAfterUpdate.available === true) {
      expect(fridayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (saturdayAvailabilityAfterUpdate.available === true) {
      expect(saturdayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (sundayAvailabilityAfterUpdate.available === true) {
      expect(sundayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }

    const callAvailabilitiesResponseAfterUpdate = await userAPIUtils.getUserCallAvailabilities(adminToken, adminEmail, salesUserId);
    expect(callAvailabilitiesResponseAfterUpdate).toBeDefined();
    expect(callAvailabilitiesResponseAfterUpdate.call_availabilities).toBeDefined();

    const mondayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'monday'
    );
    expect(mondayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.monday);
    const tuesdayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'tuesday'
    );
    expect(tuesdayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.tuesday);
    const wednesdayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'wednesday'
    );
    expect(wednesdayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.wednesday);
    const thursdayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'thursday'
    );
    expect(thursdayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.thursday);
    const fridayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'friday'
    );
    expect(fridayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.friday);
    const saturdayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'saturday'
    );
    expect(saturdayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.saturday);
    const sundayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'sunday'
    );
    expect(sundayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.sunday);

    if (mondayCallAvailabilityAfterUpdate.available === false) {
      expect(mondayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (tuesdayCallAvailabilityAfterUpdate.available === false) {
      expect(tuesdayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (wednesdayCallAvailabilityAfterUpdate.available === false) {
      expect(wednesdayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (thursdayCallAvailabilityAfterUpdate.available === false) {
      expect(thursdayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (fridayCallAvailabilityAfterUpdate.available === false) {
      expect(fridayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (saturdayCallAvailabilityAfterUpdate.available === false) {
      expect(saturdayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (sundayCallAvailabilityAfterUpdate.available === false) {
      expect(sundayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (mondayCallAvailabilityAfterUpdate.available === true) {
      expect(mondayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (tuesdayCallAvailabilityAfterUpdate.available === true) {
      expect(tuesdayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (wednesdayCallAvailabilityAfterUpdate.available === true) {
      expect(wednesdayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (thursdayCallAvailabilityAfterUpdate.available === true) {
      expect(thursdayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (fridayCallAvailabilityAfterUpdate.available === true) {
      expect(fridayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (saturdayCallAvailabilityAfterUpdate.available === true) {
      expect(saturdayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (sundayCallAvailabilityAfterUpdate.available === true) {
      expect(sundayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
  });

  test('3. Admin should be able to update availability of PreSales user', async () => {
    // Get current availability
    const availabilityResponse = await userAPIUtils.getUserAvailability(adminToken, adminEmail, presalesUserId);
    const userManagementAPIUtils = new UserManagementAPIUtils(properties.Client_id, properties.FullAccess_API);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(presalesUserId, true);
    
    // Update availability - set Thursday to true
    const dayAvailability: DayAvailability = {
      monday: true,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    };

    const updatedResponse = await userAPIUtils.updateUserAvailability(
      adminToken,
      adminEmail,
      presalesUserId,
      managerFallbackId,
      availabilityResponse,
      dayAvailability
    );

    expect(updatedResponse).toBeDefined();
    expect(updatedResponse.call_availabilities).toBeDefined();
    
    // Verify Thursday availability was updated
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

    const availabilityResponseAfterUpdate = await userAPIUtils.getUserAvailability(adminToken, adminEmail, presalesUserId);
    expect(availabilityResponseAfterUpdate).toBeDefined();
    expect(availabilityResponseAfterUpdate.call_availabilities).toBeDefined();

    const mondayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'monday'
    );
    const tuesdayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'tuesday'
    );
    const wednesdayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'wednesday'
    );
    const thursdayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'thursday'
    );
    const fridayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'friday'
    );
    const saturdayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'saturday'
    );
    const sundayAvailabilityAfterUpdate = availabilityResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'sunday'
    );
    expect(mondayAvailabilityAfterUpdate.available).toBe(dayAvailability.monday);
    expect(tuesdayAvailabilityAfterUpdate.available).toBe(dayAvailability.tuesday);
    expect(wednesdayAvailabilityAfterUpdate.available).toBe(dayAvailability.wednesday);
    expect(thursdayAvailabilityAfterUpdate.available).toBe(dayAvailability.thursday);
    expect(fridayAvailabilityAfterUpdate.available).toBe(dayAvailability.friday);
    expect(saturdayAvailabilityAfterUpdate.available).toBe(dayAvailability.saturday);
    expect(sundayAvailabilityAfterUpdate.available).toBe(dayAvailability.sunday);

    if (mondayAvailabilityAfterUpdate.available === false) {
      expect(mondayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (tuesdayAvailabilityAfterUpdate.available === false) {
      expect(tuesdayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (wednesdayAvailabilityAfterUpdate.available === false) {
      expect(wednesdayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (thursdayAvailabilityAfterUpdate.available === false) {
      expect(thursdayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (fridayAvailabilityAfterUpdate.available === false) {
      expect(fridayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (saturdayAvailabilityAfterUpdate.available === false) {
      expect(saturdayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (sundayAvailabilityAfterUpdate.available === false) {
      expect(sundayAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (mondayAvailabilityAfterUpdate.available === true) {
      expect(mondayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (tuesdayAvailabilityAfterUpdate.available === true) {
      expect(tuesdayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (wednesdayAvailabilityAfterUpdate.available === true) {
      expect(wednesdayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (thursdayAvailabilityAfterUpdate.available === true) {
      expect(thursdayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (fridayAvailabilityAfterUpdate.available === true) {
      expect(fridayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (saturdayAvailabilityAfterUpdate.available === true) {
      expect(saturdayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    if (sundayAvailabilityAfterUpdate.available === true) {
      expect(sundayAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }

    const callAvailabilitiesResponseAfterUpdate = await userAPIUtils.getUserCallAvailabilities(adminToken, adminEmail, presalesUserId);
    
    expect(callAvailabilitiesResponseAfterUpdate).toBeDefined();
    expect(callAvailabilitiesResponseAfterUpdate.call_availabilities).toBeDefined();

    const mondayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'monday'
    );
    expect(mondayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.monday);
    if (mondayCallAvailabilityAfterUpdate.available === false) {
      expect(mondayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (mondayCallAvailabilityAfterUpdate.available === true) {
      expect(mondayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    const tuesdayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'tuesday'
    );
    expect(tuesdayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.tuesday);
    if (tuesdayCallAvailabilityAfterUpdate.available === false) {
      expect(tuesdayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (tuesdayCallAvailabilityAfterUpdate.available === true) {
      expect(tuesdayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    const wednesdayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'wednesday'
    );
    expect(wednesdayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.wednesday);
    if (wednesdayCallAvailabilityAfterUpdate.available === false) {
      expect(wednesdayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (wednesdayCallAvailabilityAfterUpdate.available === true) {
      expect(wednesdayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    const thursdayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'thursday'
    );
    expect(thursdayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.thursday);
    if (thursdayCallAvailabilityAfterUpdate.available === false) {
      expect(thursdayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (thursdayCallAvailabilityAfterUpdate.available === true) {
      expect(thursdayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    const fridayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'friday'
    );
    expect(fridayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.friday);
    if (fridayCallAvailabilityAfterUpdate.available === false) {
      expect(fridayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (fridayCallAvailabilityAfterUpdate.available === true) {
      expect(fridayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    const saturdayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'saturday'
    );
    expect(saturdayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.saturday);
    if (saturdayCallAvailabilityAfterUpdate.available === false) {
      expect(saturdayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (saturdayCallAvailabilityAfterUpdate.available === true) {
      expect(saturdayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
    const sundayCallAvailabilityAfterUpdate = callAvailabilitiesResponseAfterUpdate.call_availabilities.find(
      (avail: any) => avail.day === 'sunday'
    );
    expect(sundayCallAvailabilityAfterUpdate.available).toBe(dayAvailability.sunday);
    if (sundayCallAvailabilityAfterUpdate.available === false) {
      expect(sundayCallAvailabilityAfterUpdate.fallback_user_ids[0]).toBe(managerFallbackId);
    }
    if (sundayCallAvailabilityAfterUpdate.available === true) {
      expect(sundayCallAvailabilityAfterUpdate.fallback_user_ids).toEqual([]);
    }
  });

});
