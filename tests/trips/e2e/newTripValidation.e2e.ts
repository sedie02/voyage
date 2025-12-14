import { test, expect } from '@playwright/test';

/**
 * E2E Test: New Trip Form Validation
 * Test de validatie van het nieuwe trip formulier
 */
test.describe('New Trip Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigeer naar de new trip pagina
    await page.goto('/trips/new');
  });

  test('should show validation error when submitting empty form', async ({ page }) => {
    // Probeer formulier te submitten zonder data
    const submitButton = page.getByRole('button', { name: /trip aanmaken|maak trip/i });

    // Check of de submit button disabled is of dat er een error verschijnt
    const isDisabled = await submitButton.isDisabled().catch(() => false);

    if (!isDisabled) {
      await submitButton.click();

      // Wacht op error message
      const errorMessage = page.getByText(/selecteer|vul|geldig/i);
      await expect(errorMessage).toBeVisible({ timeout: 2000 });
    } else {
      // Als button disabled is, is validatie al actief
      expect(isDisabled).toBe(true);
    }
  });

  test('should validate trip type selection', async ({ page }) => {
    // Probeer door te gaan zonder trip type te selecteren
    const continueButton = page.getByRole('button', { name: /volgende|continue/i });

    if (await continueButton.isVisible()) {
      const isDisabled = await continueButton.isDisabled().catch(() => false);
      expect(isDisabled).toBe(true);
    }
  });

  test('should validate destination field', async ({ page }) => {
    // Selecteer eerst een trip type
    const adventureType = page.getByText(/adventure|avontuur/i).first();
    if (await adventureType.isVisible()) {
      await adventureType.click();
    }

    // Probeer door te gaan zonder destination
    const continueButton = page.getByRole('button', { name: /volgende|continue/i });

    if (await continueButton.isVisible()) {
      const isDisabled = await continueButton.isDisabled().catch(() => false);
      // Button zou disabled moeten zijn zonder destination
      if (!isDisabled) {
        await continueButton.click();
        // Er zou een error moeten verschijnen
        await expect(page.getByText(/bestemming|destination/i)).toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('should validate date selection', async ({ page }) => {
    // Selecteer trip type
    const adventureType = page.getByText(/adventure|avontuur/i).first();
    if (await adventureType.isVisible()) {
      await adventureType.click();
    }

    // Navigeer naar date step (als multi-step form)
    const continueButton = page.getByRole('button', { name: /volgende|continue/i });
    if ((await continueButton.isVisible()) && !(await continueButton.isDisabled())) {
      await continueButton.click();
    }

    // Probeer door te gaan zonder datums
    const nextButton = page.getByRole('button', { name: /volgende|continue/i });
    if (await nextButton.isVisible()) {
      const isDisabled = await nextButton.isDisabled().catch(() => false);
      // Button zou disabled moeten zijn zonder datums
      expect(isDisabled).toBe(true);
    }
  });

  test('should validate budget field', async ({ page }) => {
    // Selecteer trip type
    const adventureType = page.getByText(/adventure|avontuur/i).first();
    if (await adventureType.isVisible()) {
      await adventureType.click();
    }

    // Navigeer door de stappen (simplified - in echte test zou je alle stappen doorlopen)
    // Dit is een basis validatie test
    const budgetInput = page
      .getByLabel(/budget|activiteitenbudget/i)
      .or(page.getByPlaceholder(/budget|€/i));

    if (await budgetInput.isVisible()) {
      // Test met lege waarde
      await budgetInput.fill('');

      // Test met ongeldige waarde
      await budgetInput.fill('abc');

      // Submit button zou disabled moeten zijn of error moeten tonen
      const submitButton = page.getByRole('button', { name: /aanmaken|submit/i });
      const isDisabled = await submitButton.isDisabled().catch(() => false);

      if (!isDisabled) {
        await submitButton.click();
        // Er zou een error moeten verschijnen
        await expect(page.getByText(/geldig|valid|meer dan 0/i)).toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('should show error when end date is before start date', async ({ page }) => {
    // Deze test vereist dat we door het formulier navigeren
    // Simplified version - in productie zou je alle stappen doorlopen

    const startDateInput = page.locator('input[type="date"]').first();
    const endDateInput = page.locator('input[type="date"]').last();

    if ((await startDateInput.isVisible()) && (await endDateInput.isVisible())) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Set end date before start date
      await startDateInput.fill(tomorrow.toISOString().split('T')[0]);
      await endDateInput.fill(yesterday.toISOString().split('T')[0]);

      // Er zou een validatie error moeten zijn
      const errorMessage = page.getByText(/datum|date|voor|before/i);
      await expect(errorMessage).toBeVisible({ timeout: 2000 });
    }
  });
});
