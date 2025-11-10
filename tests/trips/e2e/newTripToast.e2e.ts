import { expect, test } from '@playwright/test';

test('gebruiker ziet melding "Trip succesvol aangemaakt" na het aanmaken van een trip', async ({
  page,
}) => {
  await page.goto('/trips/new');

  // Vul de form stap voor stap in
  await page.getByText('Avontuur').click();
  await page.getByRole('button', { name: 'Volgende' }).click();

  await page.fill('input[placeholder="bijv. Barcelona, Spanje"]', 'Barcelona, Spanje');
  await page.getByRole('button', { name: 'Volgende' }).click();

  // Dates invullen (afhankelijk van hoe DatePicker werkt)
  // eventueel mocken of via API stubs

  await page.getByRole('button', { name: 'Trip Aanmaken' }).click();

  // Controleer dat melding verschijnt
  await expect(page.getByText('Trip succesvol aangemaakt')).toBeVisible();

  // Controleer dat de redirect na de melding werkt
  await page.waitForURL(/trips\/\d+|dashboard/);
});
