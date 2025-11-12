import { expect, test } from '@playwright/test'

import { goToAdminPage } from '../../helpers/go-to-admin'

/**
 * New: https://docs.google.com/spreadsheets/d/1sy6q3Q6Hl3LhvXY4JeCblhh4-REj8gyzAzyYwQVZZxc/edit#gid=95954947
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T05: Beheer - Navigeer naar bewerkpagina', async ({ page }) => {
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
    .fill('admin')
  await page.waitForTimeout(1000)
  await page.getByRole('button', { name: 'Zoeken' }).click()

  await page.waitForTimeout(1000)

  // Click on a user
  await page.getByRole('link', { name: 'Meemoo admin Test' }).click()

  // Check we are on admin user detail page
  await expect(
    page.getByRole('heading', { name: 'Gebruiker - details', exact: true }),
  ).toBeVisible()

  await page.waitForTimeout(3000)
})
