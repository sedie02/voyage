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

    // Wacht op navigatie na login
    await page.waitForURL('/trips**');

    // Navigeer naar bewerkpagina van een bestaande trip
    await page.goto('/trips/trip123/edit');

    // Wacht tot de pagina geladen is
    await page.waitForLoadState('networkidle');
  });

  test('formulier toont bestaande waarden', async ({ page }) => {
    // Wacht tot formulier geladen is
    await page.waitForSelector('input#title');

    // Controleer of de inputs waarden hebben (niet leeg zijn)
    const titleValue = await page.locator('input#title').inputValue();
    const destinationValue = await page.locator('input#destination').inputValue();

    expect(titleValue).toBeTruthy();
    expect(destinationValue).toBeTruthy();
  });

  test('kan velden wijzigen en succesvol opslaan', async ({ page }) => {
    // Wacht tot formulier geladen is
    await page.waitForSelector('input#title');

    // Vul nieuwe waarden in
    await page.fill('input#title', 'Herfstvakantie');

    // Klik op opslaan knop
    await page.click('button:has-text("Wijzigingen Opslaan")');

    // Wacht op success message
    await expect(page.locator('text=Reis succesvol bijgewerkt!')).toBeVisible({ timeout: 5000 });

    // Wacht op navigatie
    await page.waitForURL(/\/trips\/trip123$/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/trips\/trip123$/);
  });

  test('toont foutmelding bij mislukte update', async ({ page }) => {
    // Mock de API call voor updateTrip
    await page.route('**/updateTrip**', (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' }),
      })
    );

    // Wacht tot formulier geladen is
    await page.waitForSelector('input#title');

    // Klik op opslaan knop
    await page.click('button:has-text("Wijzigingen Opslaan")');

    // Controleer foutmelding
    await expect(page.locator('text=Failed to update trip')).toBeVisible({ timeout: 5000 });
  });

  test('annuleren via navigatie werkt correct', async ({ page }) => {
    // Wacht tot navigatie geladen is
    await page.waitForSelector('a:has-text("Terug")');

    // Klik op terug knop
    await page.click('a:has-text("Terug")');

    // Wacht op navigatie
    await page.waitForURL(/\/trips\/trip123$/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/trips\/trip123$/);
  });

  // Nieuwe test voor formulier validatie
  test('vereiste velden moeten ingevuld zijn', async ({ page }) => {
    await page.waitForSelector('input#title');

    // Maak titel leeg
    await page.fill('input#title', '');

    // Probeer op te slaan
    await page.click('button:has-text("Wijzigingen Opslaan")');

    // Controleer dat required attribuut werkt (browser validatie)
    const isRequired = await page.locator('input#title').getAttribute('required');
    expect(isRequired).toBeTruthy();
  });

  // Nieuwe test voor actie knoppen
  test('actie knoppen zijn aanwezig', async ({ page }) => {
    await page.waitForSelector('text=Acties');

    await expect(page.locator('text=Dupliceren')).toBeVisible();
    await expect(page.locator('text=Archiveren')).toBeVisible();
    await expect(page.locator('text=Verwijderen')).toBeVisible();
  });
});
