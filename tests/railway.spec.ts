import { test } from '@playwright/test';
import { properties } from '../Environment/v2';

test('Testrail', async () => {
  const entries = Object.entries(properties).sort(([a], [b]) => a.localeCompare(b));
  for (const [key, value] of entries) {
    console.log(`${key}:`, value);
  }
});
