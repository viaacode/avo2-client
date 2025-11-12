import { expect, test } from '@playwright/test'

import { goToAdminPage } from '../../helpers/go-to-admin.js'

/**
 * New: https://docs.google.com/spreadsheets/d/1sy6q3Q6Hl3LhvXY4JeCblhh4-REj8gyzAzyYwQVZZxc/edit#gid=95954947
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T12: Beheer - Gebruiker link naar accountmanager', async ({
  page,
  context,
}) => {
  await goToAdminPage(page)

  // Click on users tab
  await page.getByRole('link', { name: 'Gebruikers' }).click()
  await expect(
    page.getByRole('heading', { name: 'Gebruikers', exact: true }),
  ).toBeVisible()

  await page.waitForTimeout(1000)

  // Search user
  await page
    .locator(
      'input[placeholder="Zoek op naam, e-mail, organisatie, groep, stamboeknummer"]',
    )
    .fill('admin test')
  await page.waitForTimeout(1000)
  await page.getByRole('button', { name: 'Zoeken' }).click()

  await page.waitForTimeout(1000)

  // Click on a user
  await page.getByRole('link', { name: 'Meemoo admin Test' }).click()
  await page.waitForTimeout(1000)

  // Check we are on admin user detail page
  await expect(
    page.getByRole('heading', { name: 'Gebruiker - details', exact: true }),
  ).toBeVisible()

  // Check Beheer in accountmanager button is shown
  await expect(
    page.locator(
      'button[aria-label="Open deze gebruiker in de accountmanager"]',
    ),
  ).toBeVisible()

  // Click it
  await page
    .locator('button[aria-label="Open deze gebruiker in de accountmanager"]')
    .click()
  await page.waitForTimeout(10000)

  // Check the second page (the new page that opened) has Account manager as title
  const title = await context.pages()[1].title()
  expect(title).toContain('Account manager')

  await page.waitForTimeout(2000)
})
