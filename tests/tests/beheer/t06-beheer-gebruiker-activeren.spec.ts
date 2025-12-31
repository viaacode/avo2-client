import { expect, test } from '@playwright/test';

import { goToAdminPage } from '../../helpers/go-to-admin';
import { loginOnderwijsAvo } from '../../helpers/login-onderwijs-avo';
import { logoutOnderwijsAvo } from '../../helpers/logout-onderwijs-avo';

/**
 * New: https://docs.google.com/spreadsheets/d/1sy6q3Q6Hl3LhvXY4JeCblhh4-REj8gyzAzyYwQVZZxc/edit#gid=95954947
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T06: Beheer - Gebruiker activeren', async ({ page }) => {
  await goToAdminPage(page);

  // Click on users tab
  await page.getByRole('link', { name: 'Gebruikers' }).click();
  await expect(
    page.getByRole('heading', { name: 'Gebruikers', exact: true }),
  ).toBeVisible();

  await page.waitForTimeout(1000);

  // Search user
  await page
    .locator(
      'input[placeholder="Zoek op naam, e-mail, organisatie, groep, stamboeknummer"]',
    )
    .fill('ward.vercruyssen+iets2');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Zoeken' }).click();

  await page.waitForTimeout(1000);

  // Click on a user
  await page.getByRole('link', { name: 'Ward Vercruyssen' }).click();

  // Check we are on admin user detail page
  await expect(
    page.getByRole('heading', { name: 'Gebruiker - details', exact: true }),
  ).toBeVisible();

  // Check if user is already activated
  if (
    await page
      .locator(
        'button[aria-label="Ban deze gebruiker van Het Archief voor Onderwijs"]',
      )
      .isVisible()
  ) {
    // Activate user first
    await page
      .locator(
        'button[aria-label="Ban deze gebruiker van Het Archief voor Onderwijs"]',
      )
      .click();

    // Check confirm modal opens
    await expect(
      page.getByText('Weet je zeker dat je deze gebruiker wil deactiveren?'),
    ).toBeVisible();
    await page.waitForTimeout(1000);

    // Confirm
    await page.getByRole('button', { name: 'Deactiveren' }).click();
    await page.waitForTimeout(3000);
  }

  // Check activate button is shown
  await expect(
    page.locator(
      'button[aria-label="Geef deze gebruiker opnieuw toegang tot Het Archief voor Onderwijs."]',
    ),
  ).toBeVisible();

  // Click it
  await page
    .locator(
      'button[aria-label="Geef deze gebruiker opnieuw toegang tot Het Archief voor Onderwijs."]',
    )
    .click();

  // Check confirm modal opens
  await expect(
    page.getByText(
      'Weet je zeker dat je deze gebruiker opnieuw wil activeren?',
    ),
  ).toBeVisible();
  await page.waitForTimeout(2000);

  // Confirm
  await page.getByRole('button', { name: 'Opnieuw activeren' }).click();
  await page.waitForTimeout(3000);

  // Check toast
  await expect(
    page.locator(
      'div > div.Toastify__toast-body > div > div > div.c-alert__message',
    ),
  ).toContainText('Gebruiker is opnieuw geactiveerd');

  // Check activate button is not shown
  await expect(
    page.locator(
      'button[aria-label="Geef deze gebruiker opnieuw toegang tot Het Archief voor Onderwijs."]',
    ),
  ).not.toBeVisible();

  // Check deactivate button is shown
  await expect(
    page.locator(
      'button[aria-label="Ban deze gebruiker van Het Archief voor Onderwijs"]',
    ),
  ).toBeVisible();

  await page.waitForTimeout(2000);

  // Logout
  await page.goto(process.env.TEST_CLIENT_ENDPOINT as string);
  await logoutOnderwijsAvo(page);

  // Try logging in with activated user
  await loginOnderwijsAvo(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_WARD_USER as string,
    process.env.TEST_WARD_PASS as string,
  );

  await page.waitForTimeout(2000);
});
