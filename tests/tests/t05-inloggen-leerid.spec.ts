import { expect, test } from '@playwright/test';

import { goToPageAndAcceptCookies } from '../helpers/go-to-page-and-accept-cookies';

/**
 * New: https://docs.google.com/spreadsheets/d/1IvhK0v0HSntCwTcXiFseHargwwWwpoCkDMjmMehaDMA/edit#gid=0
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T05: Inloggen leerid', async ({ page }) => {
  await goToPageAndAcceptCookies(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_CLIENT_TITLE as string,
  );

  // Go to the avo homepage
  await page.goto(process.env.TEST_CLIENT_ENDPOINT as string);

  // Check navbar exists, not logged in
  await expect(
    page.getByRole('link', { name: 'Projecten', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Inloggen', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Mijn werkruimte' }),
  ).not.toBeVisible();

  // Click log in button
  await page.getByText('Inloggen', { exact: true }).click();

  await page.click('div[data-id="leerling"]');
  await page.waitForTimeout(1000);
  await page.getByText('LeerID').click();

  // Check if on external login page

  await page.fill('#username', process.env.TEST_LEERID_USER as string);
  await page.click('#iconSubmit');
  await page.fill('#password', process.env.TEST_LEERID_PASS as string);
  await page.click('#iconSubmit');

  await expect(page.getByText('meemoo_voornaam_no_ver_no_mail')).toBeVisible();

  await page.waitForTimeout(2000);
  // // Wait for close to save the videos
  // await context.close();
});
