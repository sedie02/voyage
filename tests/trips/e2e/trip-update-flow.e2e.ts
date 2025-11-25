/**
 * @file trip-update-flow.spec.ts
 * @description End-to-End test voor opslaan van wijzigingen
 */

import { expect, test } from '@playwright/test';

test.describe('US47 - Opslaan van wijzigingen in trip', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'demo@voyage.app');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    await page.goto('/trips/trip987/edit');
  });

  test('kan wijzigingen opslaan en terugkeren naar tripdetails', async ({ page }) => {
    await page.fill('input#title', 'Bijgewerkte trip');
    await page.click('button:has-text("Wijzigingen Opslaan")');

    await expect(page.locator('text=Reis succesvol bijgewerkt!')).toBeVisible();
    await page.waitForURL(/\/trips\/trip987$/);
    await expect(page.locator('h1')).toContainText('Bijgewerkte trip');
  });

  test('blijft op pagina bij fout en behoudt invoer', async ({ page }) => {
    await page.route('**/updateTrip**', (route) =>
      route.fulfill({ status: 500, body: 'Server error' })
    );

    await page.fill('input#title', 'Mislukte wijziging');
    await page.click('button:has-text("Wijzigingen Opslaan")');

    await expect(page.locator('text=Failed to update trip')).toBeVisible();
    await expect(page.locator('input#title')).toHaveValue('Mislukte wijziging');
  });
});
