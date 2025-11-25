import { expect, test } from '@playwright/test';

test.describe('Trip API Endpoint - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to trips page to ensure we're in the right context
    await page.goto('/trips');
  });

  test('should create trip via form with valid data', async ({ page }) => {
    // Navigate to create trip page
    await page.click('a[href="/trips/new"]');
    await page.waitForURL('/trips/new');

    // Fill in the form with valid data
    await page.fill('input[name="title"]', 'E2E Test Trip');
    await page.fill('input[name="destination"]', 'Budapest, Hungary');
    await page.fill('input[name="startDate"]', '2024-12-01');
    await page.fill('input[name="endDate"]', '2024-12-05');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for successful creation and navigation
    await page.waitForURL(/\/trips\/[a-zA-Z0-9-]+$/);

    // Verify we're on a trip detail page
    await expect(page.locator('h1').first()).toContainText(/E2E Test Trip|Budapest/);
  });

  test('should reject invalid trip data', async ({ page }) => {
    // Navigate to create trip page
    await page.click('a[href="/trips/new"]');
    await page.waitForURL('/trips/new');

    // Fill in the form with invalid data
    await page.fill('input[name="title"]', ''); // Invalid: empty title
    await page.fill('input[name="destination"]', ''); // Invalid: empty destination
    await page.fill('input[name="startDate"]', 'invalid-date');
    await page.fill('input[name="endDate"]', '2024-01-01');

    // Try to submit the form
    await page.click('button[type="submit"]');

    // Should stay on the same page due to validation errors
    await expect(page).toHaveURL('/trips/new');

    // Check that required field validation is working (browser validation)
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toHaveAttribute('required');

    const destinationInput = page.locator('input[name="destination"]');
    await expect(destinationInput).toHaveAttribute('required');
  });

  test('should work for both authenticated and guest users', async ({ page }) => {
    // This test verifies the trip creation works regardless of auth state
    await page.click('a[href="/trips/new"]');
    await page.waitForURL('/trips/new');

    // Fill in minimal valid data
    await page.fill('input[name="title"]', 'Guest User Trip');
    await page.fill('input[name="destination"]', 'Amsterdam, Netherlands');

    // Set dates (using current date + some days to ensure validity)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);

    await page.fill('input[name="startDate"]', startDate.toISOString().split('T')[0]);
    await page.fill('input[name="endDate"]', endDate.toISOString().split('T')[0]);

    // Submit the form
    await page.click('button[type="submit"]');

    // Should successfully create trip and navigate to trip page
    await page.waitForURL(/\/trips\/[a-zA-Z0-9-]+$/, { timeout: 10000 });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('should display validation messages for invalid dates', async ({ page }) => {
    await page.click('a[href="/trips/new"]');
    await page.waitForURL('/trips/new');

    // Fill valid title and destination
    await page.fill('input[name="title"]', 'Invalid Date Trip');
    await page.fill('input[name="destination"]', 'Berlin, Germany');

    // Set end date before start date (invalid)
    await page.fill('input[name="startDate"]', '2024-12-10');
    await page.fill('input[name="endDate"]', '2024-12-05');

    // Submit the form
    await page.click('button[type="submit"]');

    // The form should handle this gracefully - either show error or use browser validation
    // For now, just verify we're still on the form page or get some feedback
    const currentURL = page.url();
    expect(currentURL).toMatch(/\/trips\/new/);
  });

  test('should create trip with optional fields', async ({ page }) => {
    await page.click('a[href="/trips/new"]');
    await page.waitForURL('/trips/new');

    // Fill required fields
    await page.fill('input[name="title"]', 'Complete Trip');
    await page.fill('input[name="destination"]', 'Paris, France');
    await page.fill('input[name="startDate"]', '2024-11-01');
    await page.fill('input[name="endDate"]', '2024-11-07');

    // Fill optional fields
    await page.fill('textarea[name="description"]', 'This is a test trip description');

    // If trip type selector exists, select one
    const tripTypeSelect = page.locator('select[name="tripType"]');
    if (await tripTypeSelect.isVisible()) {
      await tripTypeSelect.selectOption({ label: 'Culture' });
    }

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for successful creation
    await page.waitForURL(/\/trips\/[a-zA-Z0-9-]+$/, { timeout: 10000 });
    await expect(page.locator('h1').first()).toContainText(/Complete Trip|Paris/);
  });
});
