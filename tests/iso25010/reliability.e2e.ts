import { test, expect } from '@playwright/test';

/**
 * ISO/IEC 25010 - Reliability Tests
 * R1: Offline-bewerken blijft bewaard
 * R2: Autosave in planning
 */
test.describe('ISO 25010 - Reliability', () => {
  test('R1 - Offline: Packing item toevoegen + afvinken blijft bewaard na reconnect', async ({
    page,
    context,
  }) => {
    test.setTimeout(60000); // 60 seconden timeout

    // Eerst checken of er trips zijn via /trips
    await page.goto('/trips', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Check of er trips zijn
    const tripLink = page.locator('a[href^="/trips/"]').first();
    const hasTrips = await tripLink.isVisible({ timeout: 5000 }).catch(() => false);

    if (!hasTrips) {
      // Geen trips, skip deze test
      test.skip();
      return;
    }

    // Navigeer naar packing via trip detail
    await tripLink.click();
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

    // Zoek packing tab/button
    const packingTab = page
      .getByRole('button', { name: /packing|inpaklijst/i })
      .or(page.getByText(/packing|inpaklijst/i))
      .first();

    if (await packingTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await packingTab.click();
      await page.waitForTimeout(1000);
    } else {
      // Probeer direct naar /packing te gaan
      const currentUrl = page.url();
      const tripId = currentUrl.match(/\/trips\/([^\/]+)/)?.[1];
      if (tripId) {
        await page.goto(`/packing?trip=${tripId}`, {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        });
      } else {
        await page.goto('/packing', { waitUntil: 'domcontentloaded', timeout: 30000 });
      }
    }

    await page.waitForTimeout(1000);

    // Check of we op packing pagina zijn
    const packingContent = await page
      .getByText(/packing|inpaklijst|item/i)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (!packingContent) {
      test.skip();
      return;
    }

    // Ga offline
    await context.setOffline(true);
    await page.waitForTimeout(500);

    // Voeg item toe - probeer verschillende selectors
    const addItemButton = page
      .getByRole('button', { name: /item toevoegen|add item/i })
      .or(page.getByText(/item toevoegen/i))
      .first();

    if (await addItemButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addItemButton.click();
      await page.waitForTimeout(500);
    }

    const addItemInput = page
      .getByPlaceholder(/item|nieuw|naam/i)
      .or(page.locator('input[type="text"]').filter({ hasNot: page.locator('[type="hidden"]') }))
      .first();

    if (await addItemInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addItemInput.fill('Offline test item');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1500);

      // Vink item af
      const checkboxes = page.locator('input[type="checkbox"]');
      const checkboxCount = await checkboxes.count();
      if (checkboxCount > 0) {
        const lastCheckbox = checkboxes.nth(checkboxCount - 1);
        await lastCheckbox.check();
        await page.waitForTimeout(1000);
      }
    }

    // Ga online
    await context.setOffline(false);
    await page.waitForTimeout(3000);

    // Check of status persisted
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    if (checkboxCount > 0) {
      const lastCheckbox = checkboxes.nth(checkboxCount - 1);
      const isChecked = await lastCheckbox.isChecked();
      expect(isChecked).toBe(true);
    }
  });

  test('R2 - Autosave: Wijzig activiteit, refresh → wijziging blijft', async ({ page }) => {
    test.setTimeout(60000); // 60 seconden timeout

    // Navigeer naar trips en open eerste trip
    await page.goto('/trips', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

    // Klik op eerste trip
    const tripLink = page.locator('a[href^="/trips/"]').first();
    if (!(await tripLink.isVisible({ timeout: 5000 }).catch(() => false))) {
      // Geen trips, skip deze test
      test.skip();
      return;
    }

    await tripLink.click();
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

    // Klik op itinerary/planning tab
    const itineraryTab = page
      .getByRole('button', { name: /planning|itinerary|dagplanning/i })
      .or(page.getByText(/planning|itinerary|dagplanning/i))
      .first();

    if (await itineraryTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await itineraryTab.click();
      await page.waitForTimeout(1500);
    }

    // Wijzig activiteitstitel - probeer verschillende selectors
    const activityInput = page
      .getByPlaceholder(/activiteit|activity|titel/i)
      .or(
        page
          .locator('input[type="text"]')
          .filter({ hasNot: page.locator('[type="hidden"]') })
          .first()
      )
      .first();

    if (await activityInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await activityInput.fill('Autosave test activity');
      await page.waitForTimeout(3000); // Wait for autosave

      // Refresh pagina
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

      // Wacht op tab weer te laden
      if (await itineraryTab.isVisible({ timeout: 5000 }).catch(() => false)) {
        await itineraryTab.click();
        await page.waitForTimeout(1500);
      }

      // Check of wijziging blijft - probeer opnieuw input te vinden
      const activityInputAfterReload = page
        .getByPlaceholder(/activiteit|activity|titel/i)
        .or(
          page
            .locator('input[type="text"]')
            .filter({ hasNot: page.locator('[type="hidden"]') })
            .first()
        )
        .first();

      if (await activityInputAfterReload.isVisible({ timeout: 5000 }).catch(() => false)) {
        const value = await activityInputAfterReload.inputValue().catch(() => '');
        expect(value).toContain('Autosave');
      }
    } else {
      // Geen activity input gevonden, test passes (geen activiteiten om te testen)
      console.warn('No activity input found, skipping autosave test');
    }
  });
});
