import { expect, test } from '@playwright/test';

import { goToPageAndAcceptCookies } from '../helpers/go-to-page-and-accept-cookies';
import { loginOnderwijsAvo } from '../helpers/login-onderwijs-avo';

/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T54: Opdracht - Aanmaken nieuwe opdracht', async ({ page }) => {
  await goToPageAndAcceptCookies(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_CLIENT_TITLE as string,
  );

  await loginOnderwijsAvo(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_BASIS_GEBRUIKER_USER as string,
    process.env.TEST_BASIS_GEBRUIKER_PASS as string,
  );

  // Click mijn werkruimte
  await page.getByRole('link', { name: 'Mijn werkruimte' }).click();

  // Go to assignments tab
  await page.click('div[data-id="opdrachten"]');

  // Create new assignment
  await page.getByRole('button', { name: 'Nieuwe opdracht' }).click();

  // Check if banner appeared
  await expect(page.locator('div.c-sticky-bar')).toContainText(
    'Wijzigingen opslaan?',
  );

  // Save changes
  await page.getByRole('button', { name: 'Opslaan' }).click();

  // Check toast message was succesful
  await expect(
    page.locator(
      'div > div.Toastify__toast-body > div > div > div.c-alert__message',
    ),
  ).toContainText(
    'De opdracht is succesvol aangemaakt, je vindt deze in je Werkruimte.',
  );

  await page.waitForTimeout(1000);

  // Open options of the newly created assignment
  await page.click("button[aria-label='Meer opties']");

  // Click 'Verwijderen'
  await page
    .locator(
      'div.c-sticky-bar__wrapper > div > div.c-header.o-container-vertical.o-container-vertical--bg-alt > div > div:nth-child(2) > div.c-toolbar__right > div > div > div.c-dropdown__content-open > div > div:nth-child(2)',
    )
    .click();

  // Confirm remove modal
  await page.getByRole('button', { name: 'Verwijder' }).click();

  await page.waitForTimeout(1000);

  // // Wait for close to save the videos
  // await context.close();
});
