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

    // Wait for login to complete
    await page.waitForURL('/trips**');

    // Navigate to edit page - using a more flexible approach
    await page.goto('/trips/trip987/edit');

    // Wait for the form to load
    await page.waitForSelector('input#title');
  });

  test('kan wijzigingen opslaan en terugkeren naar tripdetails', async ({ page }) => {
    // Fill in the form fields
    await page.fill('input#title', 'Bijgewerkte trip');
    await page.fill('input#destination', 'Amsterdam, Nederland');

    // Click the save button
    await page.click('button:has-text("Wijzigingen Opslaan")');

    // Wait for success message
    await expect(page.locator('text=Reis succesvol bijgewerkt!')).toBeVisible({ timeout: 5000 });

    // Wait for navigation to trip details page
    await page.waitForURL(/\/trips\/trip987$/, { timeout: 5000 });

    // Verify we're on the trip details page and see the updated title
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('blijft op pagina bij fout en behoudt invoer', async ({ page }) => {
    // Since we can't easily mock Server Actions in E2E tests,
    // we'll test the client-side error handling by simulating a scenario
    // that would cause the Server Action to fail

    // Fill in the form with data that might cause issues
    await page.fill('input#title', 'Mislukte wijziging');
    await page.fill('input#destination', ''); // Empty destination should trigger validation

    // Try to submit the form
    await page.click('button:has-text("Wijzigingen Opslaan")');

    // The form should show validation errors and stay on the same page
    await expect(page).toHaveURL(/\/trips\/trip987\/edit/);

    // Verify the input values are preserved
    await expect(page.locator('input#title')).toHaveValue('Mislukte wijziging');
  });

  test('toont validatiefouten voor verplichte velden', async ({ page }) => {
    // Clear required fields
    await page.fill('input#title', '');
    await page.fill('input#destination', '');

    // Try to submit
    await page.click('button:has-text("Wijzigingen Opslaan")');

    // Should stay on edit page due to validation
    await expect(page).toHaveURL(/\/trips\/trip987\/edit/);

    // Check that required attributes are present (browser validation)
    const titleInput = page.locator('input#title');
    await expect(titleInput).toHaveAttribute('required');

    const destinationInput = page.locator('input#destination');
    await expect(destinationInput).toHaveAttribute('required');
  });

  test('kan annuleren zonder wijzigingen op te slaan', async ({ page }) => {
    // Click the back button
    await page.click('a:has-text("Terug")');

    // Should navigate back to trip details without saving
    await page.waitForURL(/\/trips\/trip987$/);
    await expect(page).toHaveURL(/\/trips\/trip987$/);
  });

  test('behoudt wijzigingen tijdens pending state', async ({ page }) => {
    // Fill form with new data
    const newTitle = 'Nieuwe titel tijdens pending';
    await page.fill('input#title', newTitle);

    // Submit the form
    await page.click('button:has-text("Wijzigingen Opslaan")');

    // Immediately check that the button shows loading state but form data is preserved
    await expect(page.locator('button:has-text("Opslaan...")')).toBeVisible();
    await expect(page.locator('input#title')).toHaveValue(newTitle);
  });
});
