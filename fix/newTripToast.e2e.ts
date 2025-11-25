import { expect, test } from '@playwright/test';

test.describe('New Trip Creation with Toast Notification', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure we're logged in and on the new trip page
    await page.goto('/login');
    await page.fill('input[name="email"]', 'demo@voyage.app');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for login to complete
    await page.waitForURL('/trips**');

    // Navigate to new trip page
    await page.goto('/trips/new');
    await page.waitForLoadState('networkidle');
  });

  test('gebruiker ziet melding "Trip succesvol aangemaakt" na het aanmaken van een trip', async ({
    page,
  }) => {
    // Wait for the form to be fully loaded
    await page.waitForSelector('input[name="title"]');

    // Fill in the form step by step with realistic data
    await page.fill('input[name="title"]', 'Mijn Barcelona Avontuur');
    await page.fill('input[name="destination"]', 'Barcelona, Spanje');

    // Set dates (use future dates to avoid validation issues)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);

    await page.fill('input[name="startDate"]', startDate.toISOString().split('T')[0]);
    await page.fill('input[name="endDate"]', endDate.toISOString().split('T')[0]);

    // Optional: fill description
    await page.fill('textarea[name="description"]', 'Een geweldige trip naar Barcelona!');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for and check the success toast message
    // Look for the exact message from your Server Action
    await expect(page.locator('text=Trip succesvol aangemaakt').first()).toBeVisible({
      timeout: 10000,
    });

    // Also check for the toast styling to ensure it's the actual toast
    await expect(page.locator('[class*="border-green-200"]').first()).toBeVisible();

    // Wait for navigation to trip details page
    await page.waitForURL(/\/trips\/[a-zA-Z0-9-]+$/, { timeout: 10000 });

    // Verify we're on a trip details page
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('toont foutmelding bij mislukte trip creatie', async ({ page }) => {
    await page.waitForSelector('input[name="title"]');

    // Submit form with invalid data (empty required fields)
    await page.fill('input[name="title"]', '');
    await page.fill('input[name="destination"]', '');

    await page.click('button[type="submit"]');

    // Should show validation errors - either browser validation or toast error
    // Check for required field validation
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toHaveAttribute('required');

    // Or check for error message if form submission fails
    try {
      await expect(page.locator('text=Failed to create trip').first()).toBeVisible({
        timeout: 5000,
      });
    } catch {
      // If no error toast, verify we're still on the form page
      await expect(page).toHaveURL(/\/trips\/new/);
    }
  });

  test('toast verdwijnt automatisch na bepaalde tijd', async ({ page }) => {
    await page.waitForSelector('input[name="title"]');

    // Fill valid form data
    await page.fill('input[name="title"]', 'Korte Toast Test');
    await page.fill('input[name="destination"]', 'Amsterdam, Nederland');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3);

    await page.fill('input[name="startDate"]', startDate.toISOString().split('T')[0]);
    await page.fill('input[name="endDate"]', endDate.toISOString().split('T')[0]);

    await page.click('button[type="submit"]');

    // Wait for toast to appear
    const toast = page.locator('text=Trip succesvol aangemaakt').first();
    await expect(toast).toBeVisible({ timeout: 10000 });

    // Wait for toast to disappear (default duration is 4000ms + buffer)
    await expect(toast).not.toBeVisible({ timeout: 10000 });

    // Should still be on trip details page after toast disappears
    await expect(page).toHaveURL(/\/trips\/[a-zA-Z0-9-]+$/);
  });

  test('gebruiker kan toast handmatig sluiten', async ({ page }) => {
    await page.waitForSelector('input[name="title"]');

    // Fill valid form data
    await page.fill('input[name="title"]', 'Handmatige Toast Test');
    await page.fill('input[name="destination"]', 'Rotterdam, Nederland');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 2);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 5);

    await page.fill('input[name="startDate"]', startDate.toISOString().split('T')[0]);
    await page.fill('input[name="endDate"]', endDate.toISOString().split('T')[0]);

    await page.click('button[type="submit"]');

    // Wait for toast to appear
    const toast = page.locator('text=Trip succesvol aangemaakt').first();
    await expect(toast).toBeVisible({ timeout: 10000 });

    // Find and click the close button
    const closeButton = page.locator('button[aria-label="Sluit melding"]').first();
    await closeButton.click();

    // Toast should disappear immediately
    await expect(toast).not.toBeVisible({ timeout: 5000 });

    // Should still be on trip details page
    await expect(page).toHaveURL(/\/trips\/[a-zA-Z0-9-]+$/);
  });
});
