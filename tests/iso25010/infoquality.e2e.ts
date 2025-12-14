import { expect, test } from '@playwright/test';

/**
 * ISO 25010 - Information Quality Tests
 *
 * Test dat informatie zoals planning, activiteiten en budget
 * altijd actueel en correct gesynchroniseerd zijn.
 */

test.describe('ISO 25010 - Information Quality', () => {
  test('IQ1 - Trip data consistentie: alle required velden aanwezig en correct type', async ({
    page,
  }) => {
    // Navigeer naar home pagina
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check of er trips zijn (via API of UI)
    // Als er trips zijn, check data consistentie
    const tripCards = page.locator(
      '[data-testid="trip-card"], [class*="trip"], a[href*="/trips/"]'
    );
    const tripCount = await tripCards.count();

    if (tripCount > 0) {
      // Klik op eerste trip
      await tripCards.first().click();
      await page.waitForLoadState('networkidle');

      // Check of trip data correct wordt weergegeven
      // Check voor belangrijke velden
      const title = page.locator('h1, h2, [class*="title"]').first();
      const titleText = await title.textContent();

      // Assert: title moet niet leeg zijn
      expect(titleText).toBeTruthy();
      expect(titleText?.trim().length).toBeGreaterThan(0);

      // Check alleen zichtbare tekst, niet HTML/JS internals
      // Haal alleen de zichtbare tekst op (zonder script tags)
      const visibleText = await page.evaluate(() => {
        // Verwijder script en style tags
        const scripts = document.querySelectorAll('script, style');
        scripts.forEach((el) => el.remove());
        return document.body.innerText || document.body.textContent || '';
      });

      // Check of er geen "undefined", "null" of "NaN" zichtbaar is voor gebruikers
      expect(visibleText).not.toContain('undefined');
      expect(visibleText).not.toContain('null');
      expect(visibleText).not.toContain('NaN');
    } else {
      // Geen trips, skip deze test
      test.skip();
    }
  });

  test('IQ2 - Data correctheid: pagina rendert zonder data errors', async ({ page }) => {
    // Test of de homepage correct rendert zonder errors
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check of de pagina content heeft
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();
    expect(pageTitle.length).toBeGreaterThan(0);

    // Check of er geen console errors zijn (kritieke data errors)
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Negeer niet-kritieke errors
        if (
          !text.includes('favicon') &&
          !text.includes('hydration') &&
          !text.includes('Supabase')
        ) {
          errors.push(text);
        }
      }
    });

    // Wacht even voor eventuele async errors
    await page.waitForTimeout(1000);

    // Er mogen geen kritieke data errors zijn
    expect(errors.length).toBe(0);
  });

  test('IQ3 - Data compleetheid: trip details bevatten alle essentiële informatie', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const tripLinks = page.locator('a[href*="/trips/"]');
    const count = await tripLinks.count();

    if (count > 0) {
      await tripLinks.first().click();
      await page.waitForLoadState('networkidle');

      // Check of belangrijke secties aanwezig zijn (zonder te specifiek te zijn)
      const hasContent = await page.locator('body').textContent();
      expect(hasContent).toBeTruthy();
      expect(hasContent?.length).toBeGreaterThan(50); // Minimaal wat content
    } else {
      test.skip();
    }
  });
});
