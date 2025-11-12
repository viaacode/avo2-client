import { expect, test } from '@playwright/test'

import { createCollection } from '../../helpers/create-collection.js'
import { goToPageAndAcceptCookies } from '../../helpers/go-to-page-and-accept-cookies.js'
import { loginOnderwijsAvo } from '../../helpers/login-onderwijs-avo.js'

/**
 * New: https://docs.google.com/spreadsheets/d/1sy6q3Q6Hl3LhvXY4JeCblhh4-REj8gyzAzyYwQVZZxc/edit#gid=95954947
 *
 * to run tests: npm run test:e2e:debug
 * from /tests directory
 *
 */

test('T25: Beheer - Collectie verwijderen', async ({ page }) => {
  await goToPageAndAcceptCookies(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_CLIENT_TITLE as string,
  )

  // Login as admin
  await loginOnderwijsAvo(
    page,
    process.env.TEST_CLIENT_ENDPOINT as string,
    process.env.TEST_ADMIN_USER as string,
    process.env.TEST_ADMIN_PASS as string,
  )

  const collectionTitle = await createCollection(page)

  // Go to admin page
  await page.getByRole('link', { name: 'Beheer' }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  await page.waitForTimeout(1000)

  // Click on collection tab
  await page.getByRole('link', { name: 'Collectiebeheer' }).click()
  await expect(
    page.getByRole('heading', { name: 'Collecties', exact: true }),
  ).toBeVisible()
  await page.waitForTimeout(2000)

  // Check new collection is shown
  // Slicing because title is cut off at 50 characters,
  // and last 3 characters are swapped with periods
  const collectionTitleInOverview = collectionTitle.slice(0, 47) + '...'

  await expect(
    page.getByRole('link', { name: collectionTitleInOverview }),
  ).toBeVisible()

  // Open the collection
  await page.getByRole('link', { name: collectionTitleInOverview }).click()

  // Click more options
  await page.locator('button[aria-label="Meer opties"]').click()

  // Click remove
  await page.getByText('Verwijderen', { exact: true }).click()
  await page.waitForTimeout(1000)

  // Check remove modal opens
  await expect(
    page.getByRole('heading', {
      name: 'Verwijder deze collectie',
      exact: true,
    }),
  ).toBeVisible()

  // Confirm remove modal
  await page.getByRole('button', { name: 'Verwijder' }).click()

  // Check toast
  await expect(
    page.locator(
      'div > div.Toastify__toast-body > div > div > div.c-alert__message',
    ),
  ).toContainText('De collectie werd succesvol verwijderd.')
  await page.waitForTimeout(1000)

  // Go to admin page
  await page.getByRole('link', { name: 'Beheer' }).click()
  await page.waitForTimeout(1000)
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  // Click on collection tab
  await page.getByRole('link', { name: 'Collectiebeheer' }).click()
  await expect(
    page.getByRole('heading', { name: 'Collecties', exact: true }),
  ).toBeVisible()
  await page.waitForTimeout(2000)

  // Check collection is not in the list
  await expect(
    page.getByRole('link', { name: collectionTitleInOverview }),
  ).not.toBeVisible()
  await page.waitForTimeout(1000)
})
