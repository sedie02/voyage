/**
 * @file trips-edit.spec.ts
 * @description End-to-End test voor het bewerkformulier
 */

import { expect, test } from '@playwright/test';

test.describe('Trip bewerken flow', () => {
  test.beforeEach(async ({ page }) => {
    // Simuleer ingelogde gebruiker
    await page.goto('/login');
    await page.fill('input[name="email"]', 'demo@voyage.app');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Navigeer naar bewerkpagina
    await page.goto('/trips/trip123/edit');
  });

  test('formulier toont bestaande waarden', async ({ page }) => {
    await expect(page.locator('input#title')).toHaveValue(/.+/);
    await expect(page.locator('input#destination')).toHaveValue(/.+/);
  });

  test('kan velden wijzigen en succesvol opslaan', async ({ page }) => {
    await page.fill('input#title', 'Herfstvakantie');
    await page.click('button:has-text("Wijzigingen Opslaan")');

    await expect(page.locator('text=Reis succesvol bijgewerkt!')).toBeVisible();
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/trips\/trip123$/);
  });

  test('toont foutmelding bij mislukte update', async ({ page }) => {
    // Deze kan later via intercept gemockt worden zodra API-mocking is opgezet
    await page.route('**/updateTrip**', (route) =>
      route.fulfill({ status: 500, body: 'Server error' })
    );

    await page.click('button:has-text("Wijzigingen Opslaan")');
    await expect(page.locator('text=Failed to update trip')).toBeVisible();
  });

  test('annuleren via navigatie werkt correct', async ({ page }) => {
    await page.click('a:has-text("Terug")');
    await expect(page).toHaveURL(/\/trips\/trip123$/);
  });
});
