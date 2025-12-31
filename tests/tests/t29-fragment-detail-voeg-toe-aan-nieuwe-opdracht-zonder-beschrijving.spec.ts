import { expect, test } from '@playwright/test';

import { goToPageAndAcceptCookies } from '../helpers/go-to-page-and-accept-cookies';
import { goToVideoDetailPage } from '../helpers/go-to-video-detail-page';
import { loginOnderwijsAvo } from '../helpers/login-onderwijs-avo';

/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T29: Fragment detail - Voeg toe aan nieuwe opdracht zonder beschrijving', async ({
  page,
}) => {
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

  // Go to video detail page
  await goToVideoDetailPage(page);

  // Click add to assignment button
  await page.getByRole('button', { name: 'Voeg toe aan opdracht' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Nieuwe opdracht' }).click();

  // Check cut fragment modal opens
  await expect(
    page.getByRole('heading', { name: 'Knip fragment' }),
  ).toBeVisible();

  // Confirm
  await page.getByRole('button', { name: 'Toepassen' }).click();

  // Check assignment page is opened
  await expect(
    page.getByRole('heading', { name: 'Over deze opdracht' }),
  ).toBeVisible();

  // Click edit button
  await page.getByRole('button', { name: 'Bewerken' }).click();

  // Check if edit page (edit page has anchor tag to assignment overview page)
  await expect(
    page.getByRole('link', { name: 'Mijn opdrachten' }),
  ).toBeVisible();

  // Click no description button
  await page.getByRole('button', { name: 'Geen beschrijving' }).click();

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
  ).toContainText('De opdracht is succesvol aangepast.');

  // Open options of the assignment
  await page.getByRole('button', { name: 'Meer opties' }).click();

  // Click 'Verwijderen'
  await page
    .locator('div.c-dropdown__content-open > div > button:nth-child(3)')
    .click();

  // Check modal opens
  await expect(
    page.getByRole('heading', {
      name: 'Ben je zeker dat je deze opdracht wil verwijderen?',
    }),
  ).toBeVisible();

  // Confirm remove modal
  await page.getByRole('button', { name: 'Verwijder', exact: true }).click();

  // Check toast message was succesful
  await expect(page.getByText('De opdracht werd verwijderd.')).toBeVisible();

  await page.waitForTimeout(2000);

  // // Wait for close to save the videos
  // await context.close();
});
