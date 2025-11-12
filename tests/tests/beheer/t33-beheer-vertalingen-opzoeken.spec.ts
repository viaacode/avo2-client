import { expect, test } from '@playwright/test'

import { goToAdminPage } from '../../helpers/go-to-admin'

/**
 * New: https://docs.google.com/spreadsheets/d/1sy6q3Q6Hl3LhvXY4JeCblhh4-REj8gyzAzyYwQVZZxc/edit#gid=95954947
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T33: Beheer - Vertalingen opzoeken', async ({ page }) => {
  await goToAdminPage(page)

  // Click on translations tab
  await page.getByRole('link', { name: 'Vertalingen' }).click()
  await expect(
    page.getByRole('heading', { name: 'Vertalingen', exact: true }),
  ).toBeVisible()
  await page.waitForTimeout(2000)

  // Check that translations are shown in a table
  const rows = await page.locator('tbody > tr').count()
  expect(rows).toBeGreaterThan(1)
  await page.waitForTimeout(1000)

  // Search translation
  await page.locator('input[type="search"]').fill('database is mislukt')
  await page.waitForTimeout(2000)

  // Check that 1 translation is shown in table
  const rowsAfterSearch = await page.locator('tbody > tr').count()
  expect(rowsAfterSearch).toEqual(1)

  await page.waitForTimeout(1000)
})
