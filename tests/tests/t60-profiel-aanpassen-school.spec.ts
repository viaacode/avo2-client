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

test('T60: Profiel aanpassen school', async ({ page }) => {
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

  // Open user dropdown from navbar
  await page
    .locator(
      'div.u-mq-switch-main-nav-authentication > ul > li > div.c-dropdown__trigger',
    )
    .click();

  // Go to settings
  await page.getByText('Instellingen', { exact: true }).click();

  // Check correct page opens and scroll down
  await expect(
    page.getByRole('heading', { name: 'Instellingen', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Opslaan' }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);

  // Close school pills
  await page.locator('ul.c-tag-list > li:nth-child(1) > a').click();
  await page.waitForTimeout(1000);
  await page.locator('ul.c-tag-list > li:nth-child(1) > a').click();

  // Check pills are removed
  await expect(page.getByText('Ankerwijs')).not.toBeVisible();
  await expect(page.getByText('Basisonderwijs Brussel')).not.toBeVisible();

  await page.waitForTimeout(1000);

  // Open dropdown
  await page.locator('div.c-select__control').click();
  await page.waitForTimeout(1000);

  // Fill in search value
  await page.fill('input.c-select__input', 'BRUSSEL (1000)');
  await page.waitForTimeout(1000);

  // Seleect option
  await page.getByText('BRUSSEL (1000)').nth(1).click();
  await page.waitForTimeout(1000);

  // Open second dropdown
  await page.locator('div.c-select__control').nth(1).click();
  await page.waitForTimeout(1000);

  // Select option
  await page.getByText('Basisonderwijs Brussel').click();
  await page.waitForTimeout(1000);

  // Save changes
  await page.getByRole('button', { name: 'Opslaan' }).click();
  await page.waitForTimeout(1000);

  // Check if pill was added
  await page.getByRole('button', { name: 'Opslaan' }).scrollIntoViewIfNeeded();
  await expect(page.locator('ul.c-tag-list > li:nth-child(1)')).toContainText(
    'Basisonderwijs Brussel',
  );

  // Do it again
  // Open dropdown
  await page.locator('div.c-select__control').click();
  await page.waitForTimeout(1000);

  // Fill in search value
  await page.fill('input.c-select__input', 'ANTWERPEN (2000)');
  await page.waitForTimeout(1000);

  // Seleect option
  await page.getByText('ANTWERPEN (2000)').nth(1).click();
  await page.waitForTimeout(1000);

  // Open second dropdown
  await page.locator('div.c-select__control').nth(1).click();
  await page.waitForTimeout(1000);

  // Select option
  await page.getByText('Ankerwijs').click();
  await page.waitForTimeout(1000);

  // Save changes
  await page.getByRole('button', { name: 'Opslaan' }).click();
  await page.waitForTimeout(1000);

  // Check if pill was added
  await page.getByRole('button', { name: 'Opslaan' }).scrollIntoViewIfNeeded();
  await expect(
    page.locator('ul.c-tag-list > li').filter({ hasText: 'Ankerwijs' }),
  ).toBeVisible();

  await page.waitForTimeout(3000);
});
