import { expect, test } from '@playwright/test'

import { goToAdminPage } from '../../helpers/go-to-admin.js'

/**
 * New: https://docs.google.com/spreadsheets/d/1sy6q3Q6Hl3LhvXY4JeCblhh4-REj8gyzAzyYwQVZZxc/edit#gid=95954947
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T19: Beheer - Collectiebeheer overzicht', async ({ page }) => {
  await goToAdminPage(page)

  // Click on collection tab
  await page.getByRole('link', { name: 'Collectiebeheer' }).click()
  await expect(
    page.getByRole('heading', { name: 'Collecties', exact: true }),
  ).toBeVisible()
  await page.waitForTimeout(2000)

  // Check that collections are shown in a table
  const rows = await page.locator('tbody > tr').count()
  expect(rows).toBeGreaterThan(1)

  await page.waitForTimeout(1000)
})
