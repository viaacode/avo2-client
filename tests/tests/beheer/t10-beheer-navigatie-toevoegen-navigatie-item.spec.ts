import { expect, test } from '@playwright/test';

import { goToAdminPage } from '../../helpers/go-to-admin';

/**
 * New: https://docs.google.com/spreadsheets/d/1sy6q3Q6Hl3LhvXY4JeCblhh4-REj8gyzAzyYwQVZZxc/edit#gid=95954947
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test.skip('T10: Beheer - Navigatie, toevoegen navigatie item', async ({
  page,
}) => {
  await goToAdminPage(page);

  // Click on Navigation menu
  await page.getByRole('link', { name: 'Navigatie' }).click();
  await expect(
    page.getByRole('heading', { name: 'Navigatie: overzicht', exact: true }),
  ).toBeVisible();

  await page.waitForTimeout(1000);

  // Click on main navigation bar
  await page
    .getByRole('link', { name: 'Hoofdnavigatie Links', exact: true })
    .click();
  await expect(
    page.getByRole('heading', {
      name: 'Navigatie balk: Hoofdnavigatie Links',
      exact: true,
    }),
  ).toBeVisible();

  // Add item
  await page
    .getByRole('button', { name: 'Voeg een navigatie-item toe' })
    .click();
  await expect(
    page.getByRole('heading', {
      name: 'Hoofdnavigatie Links: item Toevoegen',
      exact: true,
    }),
  ).toBeVisible();

  // Fill in form
  // Title
  await page
    .locator('div.m-menu-edit-form > div:nth-child(2) > div > input')
    .fill('Auto Test');

  // Link
  await page
    .locator('div.c-select__control', { hasText: 'Content' })
    .first()
    .click();
  await page.waitForTimeout(1000);
  await page.getByText('Statisch', { exact: true }).click();
  await page.waitForTimeout(1000);
  await page
    .locator('div.c-select__control', { hasText: 'Selecteer een content-item' })
    .click();
  await page.waitForTimeout(1000);
  await page.getByText('/accepteer-voorwaarden', { exact: true }).click();

  // Select users
  await page.getByText('Ingelogde gebruikers', { exact: true }).click();
  await page.getByText('Niet-ingelogde gebruikers', { exact: true }).click();
  await page.waitForTimeout(1000);

  // Save navigation
  await page.getByRole('button', { name: 'Opslaan', exact: true }).click();
  await page.waitForTimeout(1000);

  // Go to home page
  await page.goto(process.env.TEST_CLIENT_ENDPOINT as string);
  await expect(page.getByRole('link', { name: 'Auto Test' })).toBeVisible();
  await page.waitForTimeout(1000);

  // Check navigation redirects to correct page
  await page.getByRole('link', { name: 'Auto Test' }).click();
  const url = page.url();
  expect(url).toContain(
    (process.env.TEST_CLIENT_ENDPOINT as string) + 'accepteer-voorwaarden',
  );
  await page.waitForTimeout(1000);

  // CLEANUP
  // Go to admin page
  await page.goto(process.env.TEST_CLIENT_ENDPOINT as string);
  await page.getByRole('link', { name: 'Beheer' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  // Click on Navigation menu
  await page.getByRole('link', { name: 'Navigatie' }).click();
  await expect(
    page.getByRole('heading', { name: 'Navigatie: overzicht', exact: true }),
  ).toBeVisible();

  await page.waitForTimeout(1000);

  // Click on main navigation bar
  await page
    .getByRole('link', { name: 'Hoofdnavigatie Links', exact: true })
    .click();
  await expect(
    page.getByRole('heading', {
      name: 'Navigatie balk: Hoofdnavigatie Links',
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText('Auto test')).toBeVisible();

  // Remove last added item
  await page
    .locator('button[aria-label="Verwijder dit navigatie-item"]')
    .last()
    .focus();
  await page.waitForTimeout(1000);
  await page
    .locator('button[aria-label="Verwijder dit navigatie-item"]')
    .last()
    .click();
  await expect(
    page.getByRole('heading', {
      name: 'Ben je zeker dat je deze actie wil uitvoeren?',
      exact: true,
    }),
  ).toBeVisible();
  await page.waitForTimeout(1000);

  // Confirm
  await page.getByRole('button', { name: 'Verwijder', exact: true }).click();

  // Check navigation item is removed
  await expect(
    page.locator(
      'div > div.Toastify__toast-body > div > div > div.c-alert__message',
    ),
  ).toContainText('Het navigatie-item is succesvol verwijderd.');
  await expect(page.getByText('Auto test')).not.toBeVisible();

  await page.waitForTimeout(3000);
});
